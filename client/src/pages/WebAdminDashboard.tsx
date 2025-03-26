import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  isCurrentUserWebAdmin,
  getAllClubs,
  createClubAdmin,
  createClub,
  getAllClubAdmins,
} from "../services/firebase";
import { useToast } from "../context/ToastContext";

interface Club {
  id: string;
  clubName: string;
  clubAdminID: string;
  createdAt: string;
  updatedAt: string;
}

interface ClubAdmin {
  id: string;
  adminName: string;
  email: string;
  clubID: string;
  createdAt: string;
}

const WebAdminDashboard = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [ClubAdmins, setClubAdmins] = useState<ClubAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingClub, setCreatingClub] = useState(false); // Add this for club creation
  const [creatingAdmin, setCreatingAdmin] = useState(false); // Add this for admin creation
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("clubs"); // 'clubs' or 'admins'
  const [formData, setFormData] = useState({
    adminName: "",
    email: "",
    password: "",
    clubID: "",
  });
  const [newClubName, setNewClubName] = useState("");
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    async function checkAdminAndLoadData() {
      try {
        const isWebAdmin = await isCurrentUserWebAdmin();
        if (!isWebAdmin) {
          navigate("/web-admin"); // Redirect to web admin login
          return;
        }

        await loadAllData();
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    checkAdminAndLoadData();
  }, [navigate]);

  const loadAllData = async () => {
    try {
      const clubsData = await getAllClubs();
      setClubs(clubsData);

      // This function was causing the error because it wasn't imported
      const adminsData = await getAllClubAdmins();
      setClubAdmins(adminsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingAdmin(true); // Set loading state to true
    try {
      setError("");
      await createClubAdmin(formData);
      setFormData({
        adminName: "",
        email: "",
        password: "",
        clubID: "",
      });
      await loadAllData(); // Refresh data
      showToast("Club administrator created successfully!", "success");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create club admin";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setCreatingAdmin(false); // Set loading state back to false
    }
  };

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClubName.trim()) {
      setError("Please enter a club name");
      showToast("Please enter a club name", "warning");
      return;
    }

    setCreatingClub(true); // Set loading state to true
    try {
      setError("");
      await createClub(newClubName.trim());
      setNewClubName("");
      await loadAllData(); // Refresh data
      showToast("Club created successfully!", "success");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create club";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setCreatingClub(false); // Set loading state back to false
    }
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
        Web Administration Dashboard
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "clubs"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("clubs")}
        >
          Manage Clubs
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "admins"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("admins")}
        >
          Manage Club Admins
        </button>
      </div>

      {activeTab === "clubs" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Clubs List */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">All Clubs</h2>
            {clubs.length === 0 ? (
              <p className="text-gray-600">No clubs registered yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admin Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clubs.map((club) => (
                      <tr key={club.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {club.clubName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {club.clubAdminID ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Has Admin
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Needs Admin
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(club.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Create Club Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Create New Club</h2>
            <form onSubmit={handleCreateClub}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Club Name
                </label>
                <input
                  type="text"
                  value={newClubName}
                  onChange={(e) => setNewClubName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  disabled={creatingClub} // Disable input while creating
                />
              </div>

              <button
                type="submit"
                disabled={creatingClub} // Disable button while creating
                className={`w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 flex justify-center items-center ${
                  creatingClub ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {creatingClub ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  "Create Club"
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Club Admins List - You'd need to implement getAllClubAdmins in firebase.ts */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Club Administrators</h2>
            {ClubAdmins.length === 0 ? (
              <p className="text-gray-600">No club administrators yet.</p>
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
                        Club
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ClubAdmins.map((admin) => (
                      <tr key={admin.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {admin.adminName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {admin.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {clubs.find((c) => c.id === admin.clubID)?.clubName ||
                            "Unknown Club"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Create Club Admin Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">
              Create Club Administrator
            </h2>
            <form onSubmit={handleCreateAdmin}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Name
                </label>
                <input
                  type="text"
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  disabled={creatingAdmin} // Disable input while creating
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  disabled={creatingAdmin} // Disable input while creating
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  disabled={creatingAdmin} // Disable input while creating
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Club
                </label>
                <select
                  name="clubID"
                  value={formData.clubID}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  disabled={creatingAdmin} // Disable input while creating
                >
                  <option value="">Select a club</option>
                  {clubs
                    .filter((club) => !club.clubAdminID) // Only show clubs without admins
                    .map((club) => (
                      <option key={club.id} value={club.id}>
                        {club.clubName}
                      </option>
                    ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={creatingAdmin} // Disable button while creating
                className={`w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 flex justify-center items-center ${
                  creatingAdmin ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {creatingAdmin ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  "Create Admin"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebAdminDashboard;
