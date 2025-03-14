import AudioRecorder from "../components/AudioRecorder";
import ApiKeyTester from "../components/ApiKeyTester";
import { useState, useEffect } from "react";
import { evaluateSpeech } from "../services/openai";
import { isUserVerified } from "../services/firebase";

const SpeechEvaluation = () => {
  const [evaluation, setEvaluation] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showApiTester, setShowApiTester] = useState<boolean>(false);
  const [verificationStatus, setVerificationStatus] = useState<boolean | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is verified
  useEffect(() => {
    async function checkVerification() {
      try {
        const verified = await isUserVerified();
        setVerificationStatus(verified);
      } catch (err) {
        console.error("Error checking verification status:", err);
        setError("Could not verify your account status");
      } finally {
        setIsLoading(false);
      }
    }

    checkVerification();
  }, []);

  // Handle the transcript update from the AudioRecorder
  const handleTranscriptUpdate = (text: string) => {
    setTranscript(text);
  };

  const handleEvaluate = async () => {
    if (!transcript) {
      setError("Please record a speech first");
      return;
    }

    try {
      setIsEvaluating(true);
      setError("");
      const result = await evaluateSpeech(transcript);
      setEvaluation(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to evaluate speech");
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  // Show verification required message
  if (verificationStatus === false) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Your account needs to be verified by your club administrator
                before you can use the evaluation features.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">What to do next:</h2>
          <ol className="list-decimal ml-6 space-y-2">
            <li>Contact your club administrator to verify your account</li>
            <li>
              Once verified, you'll have access to all speech evaluation
              features
            </li>
            <li>
              You can still explore other areas of the application in the
              meantime
            </li>
          </ol>
          <div className="mt-6">
            <a href="/home" className="text-blue-600 hover:text-blue-800">
              Return to home page
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Speech Evaluation</h1>

      {/* Add a toggle button for API tester */}
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setShowApiTester(!showApiTester)}
          className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
        >
          {showApiTester ? "Hide API Tester" : "Show API Tester"}
        </button>
      </div>

      {showApiTester && <ApiKeyTester />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <AudioRecorder onTranscriptUpdate={handleTranscriptUpdate} />

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleEvaluate}
              disabled={isEvaluating || !transcript}
              className={`px-6 py-3 rounded bg-green-600 text-white font-medium hover:bg-green-700 focus:outline-none ${
                isEvaluating || !transcript
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isEvaluating ? "Evaluating..." : "Evaluate Speech"}
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>

        <div>
          {transcript && (
            <div className="bg-white p-8 rounded-lg shadow-md mb-8">
              <h2 className="text-2xl font-bold mb-4">Transcript</h2>
              <div className="prose prose-sm">
                <p className="whitespace-pre-wrap">{transcript}</p>
              </div>
            </div>
          )}

          {evaluation && (
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">Speech Evaluation</h2>
              <div className="prose prose-sm">
                <pre className="whitespace-pre-wrap">{evaluation}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpeechEvaluation;
