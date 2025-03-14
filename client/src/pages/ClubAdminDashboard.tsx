import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  isCurrentUserClubAdmin,
  getCurrentClubAdmin,
  getUnverifiedUsers,
  verifyUser,
  getEvaluationsForClub,
} from "../services/firebase";

interface UnverifiedUser {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

const ClubAdminDashboard = () => {
  const [unverifiedUsers, setUnverifiedUsers] = useState<UnverifiedUser[]>([]);
  const [clubData, setClubData] = useState<{ id: string; name: string } | null>(
    null
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
        setClubData({
          id: adminData.clubID,
          name: adminData.adminName + "'s Club", // This should be replaced with actual club name
        });

        const users = await getUnverifiedUsers();
        setUnverifiedUsers(users);
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
    // For now, we'll just show an alert
    alert("Reject functionality not implemented yet");
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
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

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
    </div>
  );
};

export default ClubAdminDashboard;
