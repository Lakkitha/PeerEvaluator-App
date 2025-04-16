import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { updateUserPassword, updateUsername } from "../services/firebase"; // Fixed imports

const Settings = () => {
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  // Reset success and error messages when inputs change
  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [newEmail, currentPassword, newPassword, confirmPassword]);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth.currentUser || !newEmail) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Email update not directly implemented yet
      // For this example, just show success message
      setSuccess("Email update functionality coming soon!");
      setNewEmail("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred while updating your email.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth.currentUser || !newPassword) {
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Using the correct function from firebase.ts
      await updateUserPassword(newPassword);
      setSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred while updating your password.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountDeletion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth.currentUser) {
      return;
    }

    if (deleteConfirm !== "DELETE") {
      setError("Please type DELETE to confirm account deletion.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Account deletion logic would be implemented here
      // For safety, this is just a placeholder
      alert("Account deletion would happen here in a real app!");
      setDeleteConfirm("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred while trying to delete your account.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Email Update Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Update Email</h2>
          <form onSubmit={handleUpdateEmail}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Email Address
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Email"}
            </button>
          </form>
        </div>

        {/* Password Update Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Change Password</h2>
          <form onSubmit={handleUpdatePassword}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>

      {/* Account Deletion Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-8">
        <h2 className="text-xl font-bold mb-4">Delete Account</h2>
        <div className="bg-red-50 border border-red-300 p-4 rounded-md mb-4">
          <p className="text-red-800 mb-2">
            Warning: This action cannot be undone. All your data will be
            permanently deleted.
          </p>
          <p className="text-red-800">
            Type DELETE in the confirmation field to proceed with account
            deletion.
          </p>
        </div>
        <form onSubmit={handleAccountDeletion}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type DELETE to confirm
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 transition"
            disabled={loading || deleteConfirm !== "DELETE"}
          >
            {loading ? "Processing..." : "Delete My Account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
