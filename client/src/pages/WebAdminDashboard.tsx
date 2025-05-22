import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  isCurrentUserWebAdmin,
  getAllClubs,
  createClubAdmin,
  createClub,
  getAllClubAdmins,
  deleteClub, // Import the new function
} from "../services/firebase";
import { useToast } from "../context/ToastContext";
import ConfirmModal from "../components/ConfirmModal";
import { handleFirebaseError } from "../utils/firebaseErrorHandler"; // Import the Firebase error handler

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
  const [deletingClub, setDeletingClub] = useState<string | null>(null); // Track which club is being deleted
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
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [clubToDelete, setClubToDelete] = useState<string | null>(null);
  const [confirmMessage, setConfirmMessage] = useState(
    "Are you sure you want to delete this club? All members will be unverified and admins unlinked."
  );
  const [showNewUserForm, setShowNewUserForm] = useState(false); // State to toggle new user form
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "",
  });
  const [isLoading, setIsLoading] = useState(false); // Loading state for adding user

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

  const handleNewUserChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
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

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      setError("");
      // Call your API or service to add the user here
      // For example: await addUser(newUser);
      console.log("New User Data:", newUser);
      // Reset form
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "",
      });
      showToast("User added successfully!", "success");
      setShowNewUserForm(false); // Hide form after successful addition
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add user";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const initiateDeleteClub = (clubId: string, clubName: string) => {
    setClubToDelete(clubId);
    setConfirmMessage(
      `Are you sure you want to delete "${clubName}"? All members will be unverified and admins unlinked.`
    );
    setConfirmModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clubToDelete) return;

    setConfirmModalOpen(false);
    setDeletingClub(clubToDelete);

    try {
      setError("");
      await deleteClub(clubToDelete);
      await loadAllData(); // Refresh data after deletion
      showToast("Club deleted successfully", "success");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete club";
      console.error("Delete club error:", err);

      // Check for specific error types
      if (
        err instanceof Error &&
        err.message.includes("Missing or insufficient permissions")
      ) {
        setError(
          "Permission error: Some related data couldn't be updated, but the club was deleted successfully."
        );
        showToast(
          "Club deleted, but with some warnings. Check console for details.",
          "warning"
        );

        // Try to reload the data anyway since the club might have been deleted
        await loadAllData();
      } else {
        setError(errorMessage);
        showToast(errorMessage, "error");
      }
    } finally {
      setDeletingClub(null);
      setClubToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setConfirmModalOpen(false);
    setClubToDelete(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 dark:text-white">
      <h1 className="text-3xl font-bold mb-8 text-center dark:text-white">
        Web Administration Dashboard
      </h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900 dark:border-red-800 dark:text-red-200">
          {error}
        </div>
      )}{" "}
      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              onClick={() => setActiveTab("users")}
              className={`inline-block p-4 ${
                activeTab === "users"
                  ? "text-blue-600 border-b-2 border-blue-600 rounded-t-lg dark:text-blue-300 dark:border-blue-300"
                  : "border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
              }`}
            >
              Users
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab("clubs")}
              className={`inline-block p-4 ${
                activeTab === "clubs"
                  ? "text-blue-600 border-b-2 border-blue-600 rounded-t-lg dark:text-blue-300 dark:border-blue-300"
                  : "border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
              }`}
            >
              Clubs
            </button>
          </li>
        </ul>
      </div>
      {activeTab === "clubs" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {" "}
          {/* Clubs List */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">
              All Clubs
            </h2>
            {clubs.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300">
                No clubs registered yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Admin Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {clubs.map((club) => (
                      <tr key={club.id} className="dark:text-white">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {club.clubName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {club.clubAdminID ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Has Admin
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              Needs Admin
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(club.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() =>
                              initiateDeleteClub(club.id, club.clubName)
                            }
                            disabled={deletingClub === club.id}
                            className={`text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 ${
                              deletingClub === club.id
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            {deletingClub === club.id ? (
                              <span className="flex items-center">
                                <svg
                                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600"
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
                                Deleting...
                              </span>
                            ) : (
                              "Delete"
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>{" "}
          {/* Create Club Form */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">
              Create New Club
            </h2>
            <form onSubmit={handleCreateClub}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Club Name
                </label>{" "}
                <input
                  type="text"
                  value={newClubName}
                  onChange={(e) => setNewClubName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
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
      ) : activeTab === "users" ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold dark:text-white">
              Manage Users
            </h2>
            <button
              onClick={() => setShowNewUserForm(!showNewUserForm)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              {showNewUserForm ? "Cancel" : "Add New User"}
            </button>
          </div>
          {showNewUserForm && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6 dark:bg-gray-800 dark:border dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">
                Add New User
              </h3>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={newUser.firstName}
                      onChange={handleNewUserChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={newUser.lastName}
                      onChange={handleNewUserChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleNewUserChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={newUser.password}
                    onChange={handleNewUserChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={newUser.role}
                    onChange={handleNewUserChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="coordinator">Club Coordinator</option>
                    <option value="evaluator">Evaluator</option>
                    <option value="speaker">Speaker</option>
                  </select>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded dark:bg-blue-700 dark:hover:bg-blue-800"
                  >
                    {isLoading ? "Adding..." : "Add User"}
                  </button>
                </div>
              </form>
            </div>
          )}{" "}
          {/* Users List - You'd need to implement getAllUsers in firebase.ts */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">
              All Users
            </h2>
            {/* Replace this with your actual users data */}
            <div className="overflow-x-auto">
              {isUsersLoading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-gray-300"></div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
                  <div className="mb-4 p-6">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                        >
                          Email
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                        >
                          Role
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                      {filteredUsers.map((user) => (
                        <tr
                          key={user._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{`${user.firstName} ${user.lastName}`}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-300">
                              {user.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-300">
                              {user.role}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.isActive
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              }`}
                            >
                              {user.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowEditUserModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 mr-3 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(user)}
                              className="text-yellow-600 hover:text-yellow-900 mr-3 dark:text-yellow-400 dark:hover:text-yellow-300"
                            >
                              {user.isActive ? "Deactivate" : "Activate"}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUserId(user._id);
                                setShowDeleteConfirmation(true);
                              }}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Delete
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {" "}
          {/* Club Admins List - You'd need to implement getAllClubAdmins in firebase.ts */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">
              Club Administrators
            </h2>
            {ClubAdmins.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300">
                No club administrators yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Club
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {" "}
                    {ClubAdmins.map((admin) => (
                      <tr key={admin.id} className="dark:text-white">
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
      <ConfirmModal
        isOpen={confirmModalOpen}
        title="Delete Club"
        message={confirmMessage}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        icon="warning"
      />
    </div>
  );
};

export default WebAdminDashboard;
