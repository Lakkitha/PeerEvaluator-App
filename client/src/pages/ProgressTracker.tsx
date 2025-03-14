import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

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
  };
  feedback: string;
}

const ProgressTracker = () => {
  const [evaluations, setEvaluations] = useState<EvaluationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string>("overallImpact");
  const [timeframe, setTimeframe] = useState<string>("all");

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

  // Fix the filter function - replace 'eval' with 'evaluation'
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

  // Fix in calculateAverages function
  const calculateAverages = () => {
    const filtered = filteredEvaluations();
    if (filtered.length === 0)
      return {
        clarity: 0,
        coherence: 0,
        delivery: 0,
        vocabulary: 0,
        overallImpact: 0,
      };

    const totals = filtered.reduce(
      (acc, evaluation) => ({
        clarity: acc.clarity + evaluation.scores.clarity,
        coherence: acc.coherence + evaluation.scores.coherence,
        delivery: acc.delivery + evaluation.scores.delivery,
        vocabulary: acc.vocabulary + evaluation.scores.vocabulary,
        overallImpact: acc.overallImpact + evaluation.scores.overallImpact,
      }),
      { clarity: 0, coherence: 0, delivery: 0, vocabulary: 0, overallImpact: 0 }
    );

    return {
      clarity: totals.clarity / filtered.length,
      coherence: totals.coherence / filtered.length,
      delivery: totals.delivery / filtered.length,
      vocabulary: totals.vocabulary / filtered.length,
      overallImpact: totals.overallImpact / filtered.length,
    };
  };

  // Fix the map function in renderMockChart to use 'evaluation' instead of 'eval'
  const renderMockChart = () => {
    const filtered = filteredEvaluations();
    if (filtered.length === 0) {
      return (
        <div className="p-8 text-center text-gray-600">
          No data available for the selected timeframe
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">
          Progress Chart for {selectedMetric}
        </h3>
        <div className="h-64 border border-gray-200 rounded-lg flex items-end justify-around p-4 bg-gray-50">
          {filtered.map((evaluation, index) => {
            const value =
              evaluation.scores[
                selectedMetric as keyof typeof evaluation.scores
              ] * 10; // Scale to percentage of height
            const date = new Date(evaluation.date).toLocaleDateString();

            return (
              <div key={index} className="flex flex-col items-center">
                <div
                  className="bg-blue-600 w-8"
                  style={{ height: `${value}%` }}
                  title={`Score: ${
                    evaluation.scores[
                      selectedMetric as keyof typeof evaluation.scores
                    ]
                  }/10`}
                ></div>
                <span className="text-xs mt-2">{date}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  const averages = calculateAverages();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Your Speaking Progress
      </h1>

      {evaluations.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-semibold mb-4">No Evaluations Yet</h2>
          <p className="mb-4">
            You haven't recorded any speech evaluations yet.
          </p>
          <a
            href="/evaluate"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Record Your First Speech
          </a>
        </div>
      ) : (
        <>
          {/* Controls */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-md flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Metric
              </label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="clarity">Clarity</option>
                <option value="coherence">Coherence</option>
                <option value="delivery">Delivery</option>
                <option value="vocabulary">Vocabulary</option>
                <option value="overallImpact">Overall Impact</option>
              </select>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeframe
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Time</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="year">Past Year</option>
              </select>
            </div>
          </div>

          {/* Charts */}
          <div className="mb-8">{renderMockChart()}</div>

          {/* Summary */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-bold mb-4">Performance Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Clarity</h3>
                <p className="text-2xl font-bold">
                  {averages.clarity.toFixed(1)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Coherence</h3>
                <p className="text-2xl font-bold">
                  {averages.coherence.toFixed(1)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Delivery</h3>
                <p className="text-2xl font-bold">
                  {averages.delivery.toFixed(1)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">
                  Vocabulary
                </h3>
                <p className="text-2xl font-bold">
                  {averages.vocabulary.toFixed(1)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Overall</h3>
                <p className="text-2xl font-bold">
                  {averages.overallImpact.toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Evaluations */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Recent Evaluations</h2>
            <div className="space-y-4">
              {filteredEvaluations()
                .slice(-3)
                .reverse()
                .map((evaluation, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">
                        Speech on{" "}
                        {new Date(evaluation.date).toLocaleDateString()}
                      </h3>
                      <span className="text-sm text-gray-600">
                        Overall Score: {evaluation.scores.overallImpact}/10
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {evaluation.transcript}
                    </p>
                    <div className="mt-2">
                      <button className="text-blue-600 text-sm font-medium hover:text-blue-800">
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
