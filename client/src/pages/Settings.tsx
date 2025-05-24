import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { updateUserPassword } from "../services/firebase";

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
    <div className="container mx-auto px-4 py-8 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Account Settings</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900/50 dark:border-red-600 dark:text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 dark:bg-green-900/50 dark:border-green-600 dark:text-green-300">
          {success}
        </div>
      )}      <div className="grid md:grid-cols-2 gap-8">
        {/* Email Update Section */}
        <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:shadow-lg">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Update Email</h2>
          <form onSubmit={handleUpdateEmail}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                New Email Address
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Email"}
            </button>
          </form>
        </div>

        {/* Password Update Section */}
        <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:shadow-lg">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Change Password</h2>
          <form onSubmit={handleUpdatePassword}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Current Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                New Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Confirm New Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>      {/* Account Deletion Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-8 dark:bg-gray-800 dark:shadow-lg">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Delete Account</h2>
        <div className="bg-red-50 border border-red-300 p-4 rounded-md mb-4 dark:bg-red-900/20 dark:border-red-700">
          <p className="text-red-800 mb-2 dark:text-red-300 font-medium">
            Warning: This action cannot be undone. All your data will be
            permanently deleted.
          </p>
          <p className="text-red-800 dark:text-red-300 font-medium">
            Type DELETE in the confirmation field to proceed with account
            deletion.
          </p>
        </div>
        <form onSubmit={handleAccountDeletion}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              Type DELETE to confirm
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-400 dark:focus:border-red-400"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 transition dark:bg-red-500 dark:hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
