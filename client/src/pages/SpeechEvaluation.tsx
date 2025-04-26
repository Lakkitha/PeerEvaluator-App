import AudioRecorder from "../components/AudioRecorder";
import { useState, useEffect } from "react";
import { evaluateSpeech } from "../services/openai";
import { isUserVerified, saveEvaluation } from "../services/firebase";
import { Link } from "react-router-dom";
import ScoreCard from "../components/ScoreCard";

interface EvaluationResult {
  transcript: string;
  scores: {
    clarity: number;
    coherence: number;
    delivery: number;
    vocabulary: number;
    overallImpact: number;
    fluency: number;
    engagement: number;
  };
  feedback: string;
  suggestions: string[];
}

const SpeechEvaluation = () => {
  const [evaluationResult, setEvaluationResult] =
    useState<EvaluationResult | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [verificationStatus, setVerificationStatus] = useState<boolean | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [hasEvaluations, setHasEvaluations] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");

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

      // Call the API to evaluate the speech
      const result = await evaluateSpeech(transcript);

      // Parse the result from string into structured data
      // In a real app, this would be handled by the API returning JSON
      // This is just a placeholder for demonstration
      const mockEvaluation: EvaluationResult = {
        transcript: transcript,
        scores: {
          clarity: Math.floor(Math.random() * 3) + 7, // Random score between 7-9
          coherence: Math.floor(Math.random() * 3) + 6, // Random score between 6-8
          delivery: Math.floor(Math.random() * 4) + 5, // Random score between 5-8
          vocabulary: Math.floor(Math.random() * 3) + 7, // Random score between 7-9
          overallImpact: Math.floor(Math.random() * 3) + 7, // Random score between 7-9
          fluency: Math.floor(Math.random() * 4) + 6, // Random score between 6-9
          engagement: Math.floor(Math.random() * 3) + 6, // Random score between 6-8
        },
        feedback: result,
        suggestions: [
          "Focus on varying your tone to maintain audience engagement",
          "Try incorporating more concrete examples to illustrate key points",
          "Work on maintaining consistent eye contact with your audience",
        ],
      };

      setEvaluationResult(mockEvaluation);
      setSaveStatus("saving");

      // Save to database
      try {
        await saveEvaluation({
          transcript: mockEvaluation.transcript,
          scores: mockEvaluation.scores,
          feedback: mockEvaluation.feedback,
          suggestions: mockEvaluation.suggestions,
        });
        setSaveStatus("success");
        setHasEvaluations(true);
      } catch (saveErr) {
        console.error("Error saving evaluation:", saveErr);
        setSaveStatus("error");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to evaluate speech");
      }
      setSaveStatus("error");
    } finally {
      setIsEvaluating(false);
    }
  };

  // Performance metrics data
  const metricDefinitions = [
    {
      key: "clarity",
      label: "Clarity",
      icon: "💬",
      description: "How clear and understandable your message was",
    },
    {
      key: "coherence",
      label: "Coherence",
      icon: "🧩",
      description: "How well your ideas flowed together logically",
    },
    {
      key: "delivery",
      label: "Delivery",
      icon: "🎭",
      description: "Your speaking style, pace, and vocal variety",
    },
    {
      key: "vocabulary",
      label: "Vocabulary",
      icon: "📚",
      description: "The effectiveness and variety of your word choice",
    },
    {
      key: "overallImpact",
      label: "Overall Impact",
      icon: "✨",
      description: "The overall effectiveness and memorability of your speech",
    },
    {
      key: "fluency",
      label: "Fluency",
      icon: "🌊",
      description: "How smoothly you spoke without hesitation",
    },
    {
      key: "engagement",
      label: "Engagement",
      icon: "🤝",
      description: "How well you connected with and engaged your audience",
    },
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">Record Your Speech</h2>
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

          {/* Progress Tracking Link Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Track Your Progress</h2>
              <Link
                to="/progresstracking"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-200"
              >
                View Progress
              </Link>
            </div>
            <p className="mt-3 text-gray-600">
              {hasEvaluations
                ? "View your speech history and track improvements over time."
                : "Complete your first evaluation to start tracking your progress."}
            </p>
          </div>
        </div>

        <div>
          {transcript && !evaluationResult && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-xl font-semibold mb-4">Transcript</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{transcript}</p>
              </div>
            </div>
          )}

          {evaluationResult && (
            <>
              {/* Scores Breakdown */}
              <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Performance Metrics</h2>
                  {saveStatus === "success" && (
                    <span className="text-green-600 flex items-center">
                      <svg
                        className="w-5 h-5 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Saved
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {metricDefinitions.map((metric) => (
                    <ScoreCard
                      key={metric.key}
                      label={metric.label}
                      icon={metric.icon}
                      description={metric.description}
                      score={
                        evaluationResult.scores[
                          metric.key as keyof typeof evaluationResult.scores
                        ]
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Transcript */}
              <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Transcript</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">
                    {evaluationResult.transcript}
                  </p>
                </div>
              </div>

              {/* AI Feedback */}
              <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">AI Feedback</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">
                      {evaluationResult.feedback}
                    </p>
                  </div>
                </div>
              </div>

              {/* Improvement Suggestions */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">
                  Suggestions for Improvement
                </h2>
                <ul className="space-y-2">
                  {evaluationResult.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-blue-500 mr-2 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpeechEvaluation;
