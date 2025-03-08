import AudioRecorder from "../components/AudioRecorder";
import ApiKeyTester from "../components/ApiKeyTester";
import { useState } from "react";
import { evaluateSpeech } from "../services/openai";

const SpeechEvaluation = () => {
  const [evaluation, setEvaluation] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showApiTester, setShowApiTester] = useState<boolean>(false);

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
