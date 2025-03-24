import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  isCurrentUserClubAdmin,
  getEvaluationsForUser,
  getUserDetails,
} from "../services/firebase";
import ProgressChart from "../components/ProgressChart";

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

interface UserDetails {
  username: string;
  email: string;
  clubID: string;
  isVerified: boolean;
  joinedDate: string;
}

const MemberProgressView = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [evaluations, setEvaluations] = useState<EvaluationData[]>([]);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    "overallImpact",
  ]);
  const [timeframe, setTimeframe] = useState<string>("all");
  const [showAllMetrics, setShowAllMetrics] = useState(false);

  useEffect(() => {
    async function checkPermissionsAndLoadData() {
      try {
        // Verify that current user is a club admin
        const isAdmin = await isCurrentUserClubAdmin();
        if (!isAdmin) {
          navigate("/home");
          return;
        }

        if (!userId) {
          setError("User ID is missing");
          setLoading(false);
          return;
        }

        // Get user details
        const details = await getUserDetails(userId);
        setUserDetails(details);

        // Get user's evaluations
        const evaluationsData = await getEvaluationsForUser(userId);
        setEvaluations(evaluationsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    checkPermissionsAndLoadData();
  }, [userId, navigate]);

  const toggleMetric = (metric: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric]
    );
  };

  const toggleAllMetrics = () => {
    setShowAllMetrics((prev) => !prev);
    if (!showAllMetrics) {
      setSelectedMetrics([]);
    } else {
      setSelectedMetrics(["overallImpact"]);
    }
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  const averages = calculateAverages();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Member Progress: {userDetails?.username || "Unknown"}
        </h1>
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-gray-700"
        >
          Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {evaluations.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-semibold mb-4">No Evaluations Yet</h2>
          <p className="mb-4">
            This member hasn't recorded any speech evaluations yet.
          </p>
        </div>
      ) : (
        <>
          {/* Member Info Card */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-bold mb-4">Member Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{userDetails?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Joined Date</p>
                <p className="font-medium">
                  {userDetails?.joinedDate
                    ? new Date(userDetails.joinedDate).toLocaleDateString()
                    : "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Verification Status</p>
                <p
                  className={`font-medium ${
                    userDetails?.isVerified ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {userDetails?.isVerified ? "Verified" : "Not Verified"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Evaluations</p>
                <p className="font-medium">{evaluations.length}</p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Chart Options</h2>

              {/* Metric selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Metrics to Display
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    onClick={toggleAllMetrics}
                    className={`px-3 py-1 rounded-full text-sm ${
                      showAllMetrics
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-800"
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
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-800"
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
          </div>

          {/* Chart Component */}
          <div className="mb-8">
            <ProgressChart
              evaluations={filteredEvaluations()}
              selectedMetrics={selectedMetrics}
              timeframe={timeframe}
              allMetrics={showAllMetrics}
            />
          </div>

          {/* Summary */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-bold mb-4">Performance Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              {[
                { id: "clarity", label: "Clarity" },
                { id: "coherence", label: "Coherence" },
                { id: "delivery", label: "Delivery" },
                { id: "vocabulary", label: "Vocabulary" },
                { id: "overallImpact", label: "Overall" },
              ].map((metric) => (
                <div key={metric.id} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">
                    {metric.label}
                  </h3>
                  <p className="text-2xl font-bold">
                    {averages[metric.id as keyof typeof averages].toFixed(1)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Evaluations */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Evaluation History</h2>
            <div className="space-y-4">
              {filteredEvaluations()
                .slice()
                .reverse()
                .map((evaluation, index) => (
                  <div
                    key={evaluation.id}
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
                      <button
                        onClick={() => navigate(`/evaluation/${evaluation.id}`)}
                        className="text-blue-600 text-sm font-medium hover:text-blue-800"
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

export default MemberProgressView;
