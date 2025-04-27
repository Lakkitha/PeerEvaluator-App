import { useState, useRef, useEffect } from "react";
import { transcribeAudio, testApiKey } from "../services/openai";

interface AudioRecorderProps {
  onTranscriptUpdate?: (transcript: string) => void;
}

const AudioRecorder = ({ onTranscriptUpdate }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [apiKeyStatus, setApiKeyStatus] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);
  const [localTranscript, setLocalTranscript] = useState<string>(""); // New state for local transcript
  const [wordCount, setWordCount] = useState<number>(0); // New state for word count

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Check API key when component mounts
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const result = await testApiKey();
        if (!result.valid) {
          setError(`API Key issue: ${result.message}`);
        }
        setApiKeyStatus(result);
      } catch (err) {
        setError(
          `Failed to verify API key: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
      }
    };

    checkApiKey();
  }, []);

  // Update word count when transcript changes
  useEffect(() => {
    if (localTranscript) {
      const words = localTranscript.trim().split(/\s+/);
      setWordCount(words.length);
    } else {
      setWordCount(0);
    }
  }, [localTranscript]);

  const startRecording = async () => {
    try {
      setError("");
      setAudioUrl(null); // Clear previous recording
      setLocalTranscript(""); // Clear previous transcript
      if (onTranscriptUpdate) {
        onTranscriptUpdate(""); // Clear transcript in parent component
      }
      audioChunksRef.current = [];

      // Request audio with specific constraints for better quality
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Use specific mime type that OpenAI supports well
      const options = { mimeType: "audio/webm" };
      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        // Create audio URL for playback
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        try {
          setIsProcessing(true);
          const text = await transcribeAudio(audioBlob);

          // Store transcript locally
          setLocalTranscript(text);

          // Update the parent component with the transcript
          if (onTranscriptUpdate) {
            onTranscriptUpdate(text);
          }
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("An unknown error occurred");
          }
        } finally {
          setIsProcessing(false);
        }

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Could not access microphone");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Speech Recorder</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {apiKeyStatus && !apiKeyStatus.valid && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">API Key Warning</p>
          <p>{apiKeyStatus.message}</p>
        </div>
      )}

      <div className="flex justify-center mb-6">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-6 py-3 rounded-full text-white font-medium text-lg focus:outline-none ${
            isRecording
              ? "bg-red-600 hover:bg-red-700 animate-pulse"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={isProcessing}
        >
          {isProcessing
            ? "Processing..."
            : isRecording
            ? "Stop Recording"
            : "Start Recording"}
        </button>
      </div>

      {isRecording && (
        <div className="text-center text-red-600 mb-4">
          Recording in progress...
        </div>
      )}

      {audioUrl && (
        <div className="mt-4 mb-4">
          <h3 className="text-xl font-semibold mb-2">Recording:</h3>
          <audio controls src={audioUrl} className="w-full">
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {/* New transcript display section with word counter */}
      {localTranscript && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Transcript:</h3>
            <div className="text-sm">
              <span
                className={`font-medium ${
                  wordCount < 20 ? "text-red-500" : "text-green-500"
                }`}
              >
                {wordCount} {wordCount === 1 ? "word" : "words"}
              </span>
              {wordCount < 20 && (
                <span className="text-red-500 ml-1">
                  (Need at least 20 words for evaluation)
                </span>
              )}
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            <p className="whitespace-pre-wrap text-gray-700">
              {localTranscript}
            </p>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="mt-4 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-blue-600">Transcribing your speech...</p>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
