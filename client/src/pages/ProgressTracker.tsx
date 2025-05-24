import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import ProgressChart from "../components/ProgressChart";
import { useNavigate } from "react-router-dom";

interface EvaluationData {
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
}

const ProgressTracker = () => {
  const [evaluations, setEvaluations] = useState<EvaluationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Use array for multiple metrics selection
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    "overallImpact",
  ]);
  const [timeframe, setTimeframe] = useState<string>("all");
  const [showAllMetrics, setShowAllMetrics] = useState(false);

  useEffect(() => {
    const fetchEvaluations = async () => {
      if (!auth.currentUser) {
        setError("You must be logged in to view your progress");
        setLoading(false);
        return;
      }

      try {
        const userId = auth.currentUser.uid;
        const evaluationsRef = collection(db, "evaluations");
        const userEvaluationsQuery = query(
          evaluationsRef,
          where("userId", "==", userId),
          orderBy("date", "asc")
        );

        const querySnapshot = await getDocs(userEvaluationsQuery);
        const evaluationsData: EvaluationData[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          evaluationsData.push({
            id: doc.id,
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
          });
        });

        setEvaluations(evaluationsData);
      } catch (err) {
        setError("Failed to load evaluation data");
        console.error("Error fetching evaluations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, []);

  const filteredEvaluations = () => {
    if (timeframe === "all") return evaluations;

    const now = new Date();
    const cutoff = new Date();

    if (timeframe === "week") {
      cutoff.setDate(now.getDate() - 7);
    } else if (timeframe === "month") {
      cutoff.setMonth(now.getMonth() - 1);
    } else if (timeframe === "year") {
      cutoff.setFullYear(now.getFullYear() - 1);
    }

    return evaluations.filter((evaluation) => {
      const evalDate = new Date(evaluation.date);
      return evalDate >= cutoff;
    });
  };

  const calculateAverages = () => {
    const filtered = filteredEvaluations();
    if (filtered.length === 0)
      return {
        clarity: 0,
        coherence: 0,
        delivery: 0,
        vocabulary: 0,
        overallImpact: 0,
        fluency: 0,
        engagement: 0,
      };

    const totals = filtered.reduce(
      (acc, evaluation) => ({
        clarity: acc.clarity + (evaluation.scores.clarity || 0),
        coherence: acc.coherence + (evaluation.scores.coherence || 0),
        delivery: acc.delivery + (evaluation.scores.delivery || 0),
        vocabulary: acc.vocabulary + (evaluation.scores.vocabulary || 0),
        overallImpact:
          acc.overallImpact + (evaluation.scores.overallImpact || 0),
        fluency: acc.fluency + (evaluation.scores.fluency || 0),
        engagement: acc.engagement + (evaluation.scores.engagement || 0),
      }),
      {
        clarity: 0,
        coherence: 0,
        delivery: 0,
        vocabulary: 0,
        overallImpact: 0,
        fluency: 0,
        engagement: 0,
      }
    );

    return {
      clarity: totals.clarity / filtered.length,
      coherence: totals.coherence / filtered.length,
      delivery: totals.delivery / filtered.length,
      vocabulary: totals.vocabulary / filtered.length,
      overallImpact: totals.overallImpact / filtered.length,
      fluency: totals.fluency / filtered.length,
      engagement: totals.engagement / filtered.length,
    };
  };

  // Method to toggle metrics selection
  const toggleMetric = (metric: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric]
    );
  };

  // Add a function to handle toggling the "All" option
  const toggleAllMetrics = () => {
    setShowAllMetrics((prev) => !prev);
    // If turning on "All", we clear individual selections
    if (!showAllMetrics) {
      setSelectedMetrics([]);
    }
    // If turning off "All", we default to overall impact
    else {
      setSelectedMetrics(["overallImpact"]);
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 dark:bg-gray-900 min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900/50 dark:border-red-600 dark:text-red-300">
        {error}
      </div>
    );
  }

  const averages = calculateAverages();
  return (
    <div className="container mx-auto px-4 py-8 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center dark:text-white">
        Your Speaking Progress
      </h1>

      {evaluations.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center dark:bg-gray-800 dark:shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 dark:text-white">No Evaluations Yet</h2>          <p className="mb-4 dark:text-gray-300">
            You haven't recorded any speech evaluations yet.
          </p>
          <a
            href="/evaluate"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Record Your First Speech
          </a>
        </div>
      ) : (
        <>          {/* Controls */}
          <div className="mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:shadow-lg">
              <h2 className="text-lg font-semibold mb-4 dark:text-white">Chart Options</h2>

              {/* Metric selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Select Metrics to Display
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    onClick={toggleAllMetrics}
                    className={`px-3 py-1 rounded-full text-sm ${
                      showAllMetrics
                        ? "bg-blue-600 text-white dark:bg-blue-500"
                        : "bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200"
                    }`}
                  >
                    All Metrics
                  </button>
                </div>

                {/* Only show individual metrics if "All" is not selected */}
                {!showAllMetrics && (
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "clarity", label: "Clarity" },
                      { id: "coherence", label: "Coherence" },
                      { id: "delivery", label: "Delivery" },
                      { id: "vocabulary", label: "Vocabulary" },
                      { id: "fluency", label: "Fluency" },
                      { id: "engagement", label: "Engagement" },
                      { id: "overallImpact", label: "Overall Impact" },
                    ].map((metric) => (
                      <button
                        key={metric.id}
                        onClick={() => toggleMetric(metric.id)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          selectedMetrics.includes(metric.id)
                            ? "bg-blue-600 text-white dark:bg-blue-500"
                            : "bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200"
                        }`}
                      >
                        {metric.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Timeframe selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Timeframe
                </label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400 dark:focus:border-blue-400"
                >
                  <option value="all">All Time</option>
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                  <option value="year">Past Year</option>
                </select>
              </div>
            </div>
          </div>

          {/* Chart Component */}
          <div className="mb-8">
            <ProgressChart
              evaluations={filteredEvaluations()}
              selectedMetrics={selectedMetrics}
              timeframe={timeframe}
              allMetrics={showAllMetrics}
            />
          </div>          {/* Summary */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8 dark:bg-gray-800 dark:shadow-lg">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Performance Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Clarity</h3>
                <p className="text-2xl font-bold dark:text-white">
                  {averages.clarity.toFixed(1)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Coherence</h3>
                <p className="text-2xl font-bold dark:text-white">
                  {averages.coherence.toFixed(1)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Delivery</h3>
                <p className="text-2xl font-bold dark:text-white">
                  {averages.delivery.toFixed(1)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Vocabulary
                </h3>
                <p className="text-2xl font-bold dark:text-white">
                  {averages.vocabulary.toFixed(1)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Overall</h3>
                <p className="text-2xl font-bold dark:text-white">
                  {averages.overallImpact.toFixed(1)}
                </p>
              </div>
            </div>
          </div>          {/* Recent Evaluations */}
          <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:shadow-lg">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Recent Evaluations</h2>
            <div className="space-y-4">
              {filteredEvaluations()
                .slice(-3)
                .reverse()
                .map((evaluation, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 dark:border-gray-600 dark:bg-gray-700"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium dark:text-white">
                        Speech on{" "}
                        {new Date(evaluation.date).toLocaleDateString()}
                      </h3>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Overall Score: {evaluation.scores.overallImpact}/10
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 dark:text-gray-400">
                      {evaluation.transcript}
                    </p>
                    <div className="mt-2">
                      <button
                        onClick={() => navigate(`/evaluation/${evaluation.id}`)}
                        className="text-blue-600 text-sm font-medium hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProgressTracker;
