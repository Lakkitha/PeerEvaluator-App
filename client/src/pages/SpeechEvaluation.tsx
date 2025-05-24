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
      const rawFeedback = await evaluateSpeech(transcript);

      // Import the parser function directly
      const { parseEvaluationResponse } = await import("../services/openai");

      // Parse the AI response to extract structured data
      const parsedEvaluation = parseEvaluationResponse(rawFeedback);

      // Create evaluation result using the actual parsed scores and feedback
      const evaluation: EvaluationResult = {
        transcript: transcript,
        scores: {
          clarity: parsedEvaluation.clarity,
          coherence: parsedEvaluation.coherence,
          delivery: parsedEvaluation.delivery,
          vocabulary: parsedEvaluation.vocabulary,
          overallImpact: parsedEvaluation.overallImpact,
          // Extract these additional scores from the raw feedback
          fluency: parseScoreFromText(rawFeedback, "fluency"),
          engagement: parseScoreFromText(
            rawFeedback,
            "engagement",
            "engagement levels"
          ),
        },
        feedback: rawFeedback,
        suggestions: parsedEvaluation.suggestions,
      };

      setEvaluationResult(evaluation);
      setSaveStatus("saving");

      // Save to database
      try {
        await saveEvaluation({
          transcript: evaluation.transcript,
          scores: evaluation.scores,
          feedback: evaluation.feedback,
          suggestions: evaluation.suggestions,
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
      <div className="flex justify-center items-center h-64 dark:bg-gray-900 min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  // Show verification required message
  if (verificationStatus === false) {
    return (
      <div className="container mx-auto px-4 py-8 dark:bg-gray-900 min-h-screen">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 dark:bg-yellow-900/30 dark:border-yellow-600">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400 dark:text-yellow-300"
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
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Your account needs to be verified by your club administrator
                before you can use the evaluation features.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md dark:bg-gray-800 dark:shadow-lg">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">What to do next:</h2>
          <ol className="list-decimal ml-6 space-y-2 dark:text-gray-300">
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
            <a href="/home" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              Return to home page
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center dark:text-white">Speech Evaluation</h1>      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-white p-6 rounded-lg shadow-md mb-8 dark:bg-gray-800 dark:shadow-lg">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Record Your Speech</h2>
            <AudioRecorder onTranscriptUpdate={handleTranscriptUpdate} />

            <div className="mt-6 flex justify-center">
              <button
                onClick={handleEvaluate}
                disabled={isEvaluating || !transcript}
                className={`px-6 py-3 rounded bg-green-600 text-white font-medium hover:bg-green-700 focus:outline-none dark:bg-green-500 dark:hover:bg-green-600 ${
                  isEvaluating || !transcript
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {isEvaluating ? "Evaluating..." : "Evaluate Speech"}
              </button>
            </div>

            {error && (
              <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded dark:bg-red-900/50 dark:border-red-600 dark:text-red-300">
                {error}
              </div>
            )}
          </div>

          {/* Progress Tracking Link Section */}
          <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold dark:text-white">Track Your Progress</h2>
              <Link
                to="/progresstracking"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-200 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                View Progress
              </Link>
            </div>
            <p className="mt-3 text-gray-600 dark:text-gray-300">
              {hasEvaluations
                ? "View your speech history and track improvements over time."
                : "Complete your first evaluation to start tracking your progress."}
            </p>
          </div>
        </div>        <div>
          {transcript && !evaluationResult && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 dark:bg-gray-800 dark:shadow-lg">
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Transcript</h2>
              <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                <p className="whitespace-pre-wrap dark:text-gray-300">{transcript}</p>
              </div>
            </div>
          )}

          {evaluationResult && (
            <>
              {/* Scores Breakdown */}
              <div className="bg-white p-6 rounded-lg shadow-md mb-8 dark:bg-gray-800 dark:shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold dark:text-white">Performance Metrics</h2>
                  {saveStatus === "success" && (
                    <span className="text-green-600 flex items-center dark:text-green-400">
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
              <div className="bg-white p-6 rounded-lg shadow-md mb-8 dark:bg-gray-800 dark:shadow-lg">
                <h2 className="text-xl font-semibold mb-4 dark:text-white">Transcript</h2>
                <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                  <p className="whitespace-pre-wrap dark:text-gray-300">
                    {evaluationResult.transcript}
                  </p>
                </div>
              </div>

              {/* AI Feedback */}
              <div className="bg-white p-6 rounded-lg shadow-md mb-8 dark:bg-gray-800 dark:shadow-lg">
                <h2 className="text-xl font-semibold mb-4 dark:text-white">AI Feedback</h2>
                <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="whitespace-pre-wrap dark:text-gray-300">
                      {evaluationResult.feedback}
                    </p>
                  </div>
                </div>
              </div>

              {/* Improvement Suggestions */}
              <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:shadow-lg">
                <h2 className="text-xl font-semibold mb-4 dark:text-white">
                  Suggestions for Improvement
                </h2>
                <ul className="space-y-2">
                  {evaluationResult.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-blue-500 mr-2 mt-0.5 dark:text-blue-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="dark:text-gray-300">{suggestion}</span>
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

// Helper function to parse scores from text (copied from openai.ts)
function parseScoreFromText(text: string, ...keywords: string[]): number {
  // Look for patterns like "Clarity: 7/10" or "Grammar score: 7"
  for (const keyword of keywords) {
    const regex = new RegExp(
      `${keyword}[^\\d]*(\\d{1,2})(?:\\s*\\/\\s*10)?`,
      "i"
    );
    const match = text.match(regex);
    if (match && match[1]) {
      const score = parseInt(match[1]);
      if (!isNaN(score) && score >= 0 && score <= 10) {
        return score;
      }
    }
  }
  return 5; // Default score if not found
}

export default SpeechEvaluation;
