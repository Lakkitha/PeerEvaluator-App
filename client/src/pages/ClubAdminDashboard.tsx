import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  isCurrentUserClubAdmin,
  getCurrentClubAdmin,
  getUnverifiedUsers,
  verifyUser,
  getEvaluationsForClub,
  getClubById,
} from "../services/firebase";

interface UnverifiedUser {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

interface ClubEvaluation {
  id: string;
  userId: string;
  username: string;
  date: string;
  scores: {
    overallImpact: number;
  };
}

const ClubAdminDashboard = () => {
  const [unverifiedUsers, setUnverifiedUsers] = useState<UnverifiedUser[]>([]);
  const [clubData, setClubData] = useState<{ id: string; name: string } | null>(
    null
  );
  const [recentEvaluations, setRecentEvaluations] = useState<ClubEvaluation[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAdminAndLoadUsers() {
      try {
        const isAdmin = await isCurrentUserClubAdmin();
        if (!isAdmin) {
          navigate("/home");
          return;
        }

        // Get admin data
        const adminData = await getCurrentClubAdmin();

        // Get the actual club name
        const club = await getClubById(adminData.clubID);
        setClubData({
          id: adminData.clubID,
          name: club ? club.clubName : adminData.adminName + "'s Club",
        });

        // Get unverified users
        const users = await getUnverifiedUsers();
        setUnverifiedUsers(users);

        // Get recent evaluations
        const evaluations = await getEvaluationsForClub(adminData.clubID);
        setRecentEvaluations(
          evaluations.slice(0, 5).map((evaluation) => ({
            id: evaluation.id,
            userId: evaluation.userId,
            username: evaluation.username || "Unknown User",
            date: evaluation.date,
            scores: {
              overallImpact: evaluation.scores.overallImpact,
            },
          }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    checkAdminAndLoadUsers();
  }, [navigate]);

  const handleVerifyUser = async (userId: string) => {
    try {
      await verifyUser(userId);
      // Update the local state to remove the verified user
      setUnverifiedUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify user");
    }
  };

  const handleRejectUser = async (userId: string) => {
    // This would typically delete the user or mark them as rejected
    // For now, we'll just show an alert and remove from the list
    alert(`User rejection for ${userId} is not fully implemented yet.`);
    setUnverifiedUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Club Admin Dashboard
        {clubData && (
          <span className="block text-xl font-normal mt-2 text-gray-600">
            {clubData.name}
          </span>
        )}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid gap-8 grid-cols-1">
        {/* Unverified Users Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Unverified Users</h2>

          {unverifiedUsers.length === 0 ? (
            <p className="text-gray-600">No unverified users at this time.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {unverifiedUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleVerifyUser(user.id)}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => handleRejectUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Evaluations Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Recent Evaluations</h2>

          {recentEvaluations.length === 0 ? (
            <p className="text-gray-600">
              No evaluations recorded for your club yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Overall Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentEvaluations.map((evaluation) => (
                    <tr key={evaluation.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {evaluation.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(evaluation.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {evaluation.scores.overallImpact}/10
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() =>
                            navigate(`/evaluation/${evaluation.id}`)
                          }
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClubAdminDashboard;
