import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import ScoreCard from "../components/ScoreCard";

interface EvaluationDetails {
  id: string;
  date: string;
  transcript: string;
  scores: {
    clarity: number;
    coherence: number;
    delivery: number;
    vocabulary: number;
    overallImpact: number;
    fluency?: number;
    engagement?: number;
  };
  feedback: string;
  userId: string;
  username: string;
}

const EvaluationDetails = () => {
  const { evaluationId } = useParams<{ evaluationId: string }>();
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState<EvaluationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOwner, setIsOwner] = useState(false);

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

  useEffect(() => {
    const fetchEvaluation = async () => {
      if (!evaluationId) {
        setError("No evaluation ID provided");
        setLoading(false);
        return;
      }

      if (!auth.currentUser) {
        setError("You must be logged in to view evaluation details");
        setLoading(false);
        return;
      }

      try {
        const evaluationRef = doc(db, "evaluations", evaluationId);
        const evaluationSnap = await getDoc(evaluationRef);

        if (!evaluationSnap.exists()) {
          setError("Evaluation not found");
          setLoading(false);
          return;
        }

        const data = evaluationSnap.data();

        // Check if the current user is the owner of this evaluation
        setIsOwner(data.userId === auth.currentUser.uid);

        setEvaluation({
          id: evaluationSnap.id,
          date: data.date,
          transcript: data.transcript,
          scores: {
            clarity: data.scores.clarity || 0,
            coherence: data.scores.coherence || 0,
            delivery: data.scores.delivery || 0,
            vocabulary: data.scores.vocabulary || 0,
            overallImpact: data.scores.overallImpact || 0,
            fluency: data.scores.fluency || 0,
            engagement: data.scores.engagement || 0,
          },
          feedback: data.feedback,
          userId: data.userId,
          username: data.username || "Unknown User",
        });
      } catch (err) {
        console.error("Error fetching evaluation:", err);
        setError("Failed to load evaluation data");
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluation();
  }, [evaluationId]);

  const handleGoBack = () => {
    // Use history to go back, or navigate to progress page if there's no history
    navigate(-1);
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 dark:text-white">
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={handleGoBack}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="container mx-auto px-4 py-8 dark:text-white">
        <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 px-4 py-3 rounded mb-4">
          No evaluation data found.
        </div>
        <button
          onClick={handleGoBack}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Calculate the average score across all metrics
  const scoreValues = Object.values(evaluation.scores).filter(
    (score) => typeof score === "number"
  ) as number[];
  const averageScore =
    scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length;

  return (    <div className="container mx-auto px-4 py-8 dark:text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold dark:text-white">Speech Evaluation Details</h1>
        <button
          onClick={handleGoBack}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
        >
          Go Back
        </button>
      </div>

      {/* Evaluation Summary Card */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-semibold dark:text-white">
              {isOwner ? "Your Speech" : `${evaluation.username}'s Speech`}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {new Date(evaluation.date).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {averageScore.toFixed(1)}/10
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Average Score</div>
          </div>
        </div>
      </div>      {/* Scores Breakdown */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4 dark:text-white">Performance Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {metricDefinitions.map((metric) => {
            const score =
              evaluation.scores[metric.key as keyof typeof evaluation.scores];
            if (typeof score !== "number") return null;

            return (
              <ScoreCard
                key={metric.key}
                label={metric.label}
                icon={metric.icon}
                description={metric.description}
                score={score}
              />
            );
          })}
        </div>
      </div>      {/* Transcript */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4 dark:text-white">Transcript</h3>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <p className="whitespace-pre-wrap dark:text-gray-200">{evaluation.transcript}</p>
        </div>
      </div>

      {/* Feedback */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4 dark:text-white">AI Feedback</h3>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="whitespace-pre-wrap dark:text-gray-200">{evaluation.feedback}</p>
          </div>
        </div>
      </div>      {/* Action buttons for sharing or downloading */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => window.print()}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
        >
          Print / Save as PDF
        </button>
        {isOwner && (
          <button
            onClick={() => navigate("/progresstracking")}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
          >
            View All Progress
          </button>
        )}
      </div>
    </div>
  );
};

export default EvaluationDetails;
