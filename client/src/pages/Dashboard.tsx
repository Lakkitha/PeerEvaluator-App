import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  getCurrentUser,
  getCurrentUserEvaluations,
  getUserClub,
} from "../services/firebase";
import ProgressChart from "../components/ProgressChart";

interface Evaluation {
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

interface ClubAnnouncement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  isPinned: boolean;
}

const Dashboard = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [announcements, setAnnouncements] = useState<ClubAnnouncement[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch user data and evaluations
  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);

        // Get user data
        const user = await getCurrentUser();
        setUserData(user);

        // Get user evaluations
        const userEvaluations = await getCurrentUserEvaluations();
        setEvaluations(userEvaluations);

        // Mock club announcements - in a real app, these would come from Firestore
        // For future implementation: Fetch from a 'clubAnnouncements' collection
        setAnnouncements([
          {
            id: "1",
            title: "Upcoming Club Meeting",
            content: "Don't forget our weekly meeting this Thursday at 6 PM!",
            createdAt: new Date(
              Date.now() - 2 * 24 * 60 * 60 * 1000
            ).toISOString(),
            isPinned: true,
          },
          {
            id: "2",
            title: "Speech Contest Registration Open",
            content:
              "Register now for our annual speech contest. Deadline is next Friday.",
            createdAt: new Date(
              Date.now() - 5 * 24 * 60 * 60 * 1000
            ).toISOString(),
            isPinned: true,
          },
          {
            id: "3",
            title: "New Evaluation Criteria",
            content:
              "We've updated our speech evaluation criteria. Check them out on the club portal.",
            createdAt: new Date(
              Date.now() - 10 * 24 * 60 * 60 * 1000
            ).toISOString(),
            isPinned: false,
          },
        ]);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load your dashboard. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // For ProgressChart component
  const selectedMetrics = ["overallImpact", "clarity"];
  const timeframe = "month";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Recent Evaluations */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Recent Evaluations</h2>
              <Link
                to="/progresstracking"
                className="text-blue-600 hover:text-blue-800"
              >
                View All
              </Link>
            </div>

            {evaluations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  You haven't completed any evaluations yet.
                </p>
                <Link
                  to="/evaluate"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Start Your First Evaluation
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {evaluations.slice(0, 3).map((evaluation) => (
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
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {evaluation.feedback.substring(0, 100)}...
                    </p>
                    <Link
                      to={`/evaluation/${evaluation.id}`}
                      className="text-blue-600 text-sm font-medium hover:text-blue-800"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Progress Overview */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Progress Overview</h2>
              <Link
                to="/progresstracking"
                className="text-blue-600 hover:text-blue-800"
              >
                Detailed Analysis
              </Link>
            </div>

            {evaluations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Complete evaluations to see your progress over time.
              </p>
            ) : (
              <>
                {/* Progress Chart */}
                <ProgressChart
                  evaluations={evaluations}
                  selectedMetrics={selectedMetrics}
                  timeframe={timeframe}
                />

                {/* Key Insights - In a real app, these would be generated from AI analysis */}
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Key Insights:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>
                      Your clarity scores have improved by 15% in the last
                      month.
                    </li>
                    <li>
                      Vocabulary usage shows consistent improvement over time.
                    </li>
                    <li>
                      Consider focusing on speech delivery for maximum impact.
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column - Club Announcements */}
        <div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Club Announcements</h2>

            {announcements.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No announcements at this time.
              </p>
            ) : (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className={`border ${
                      announcement.isPinned
                        ? "border-blue-200 bg-blue-50"
                        : "border-gray-200"
                    } rounded-lg p-4`}
                  >
                    <div className="flex items-center mb-2">
                      {announcement.isPinned && (
                        <svg
                          className="w-4 h-4 text-blue-600 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V5z"></path>
                          <path d="M3 7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"></path>
                        </svg>
                      )}
                      <h3 className="font-medium">{announcement.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {announcement.content}
                    </p>
                    <span className="text-xs text-gray-500">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/evaluate"
                className="block w-full py-2 px-4 bg-blue-600 text-white text-center rounded hover:bg-blue-700 transition"
              >
                Start New Evaluation
              </Link>
              <Link
                to="/profile"
                className="block w-full py-2 px-4 bg-gray-200 text-gray-800 text-center rounded hover:bg-gray-300 transition"
              >
                View Profile
              </Link>
              <Link
                to="/settings"
                className="block w-full py-2 px-4 bg-gray-200 text-gray-800 text-center rounded hover:bg-gray-300 transition"
              >
                Account Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
