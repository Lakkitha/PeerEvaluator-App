import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  isCurrentUserWebAdmin,
  getAllClubs,
  createClubAdmin,
} from "../services/firebase";

interface Club {
  id: string;
  clubName: string;
  clubAdminID: string;
  createdAt: string;
  updatedAt: string;
}

const WebAdminDashboard = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    adminName: "",
    email: "",
    password: "",
    clubID: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAdminAndLoadData() {
      try {
        const isWebAdmin = await isCurrentUserWebAdmin();
        if (!isWebAdmin) {
          navigate("/home");
          return;
        }

        const clubsData = await getAllClubs();
        setClubs(clubsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    checkAdminAndLoadData();
  }, [navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createClubAdmin(formData);
      setFormData({
        adminName: "",
        email: "",
        password: "",
        clubID: "",
      });
      alert("Club admin created successfully!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create club admin"
      );
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
        Main Web Admin Dashboard
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Clubs Management */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Clubs</h2>
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
                      Admin ID
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
                        {club.clubAdminID || "No admin"}
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

        {/* Create Club Admin */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Create Club Admin</h2>
          <form onSubmit={handleSubmit}>
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
              >
                <option value="">Select a club</option>
                {clubs.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.clubName}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Create Admin
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WebAdminDashboard;
