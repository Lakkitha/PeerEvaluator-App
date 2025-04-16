import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { getCurrentUser, updateUserPassword } from "../services/firebase";
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";

interface UserSettings {
  shareEvaluations: boolean;
  showInLeaderboards: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

const Settings = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [settings, setSettings] = useState<UserSettings>({
    shareEvaluations: true,
    showInLeaderboards: true,
    emailNotifications: true,
    pushNotifications: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  // Fetch user settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (!auth.currentUser) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);

        // In a real app, these settings would be fetched from Firestore
        // For now, we just set default values
        const user = await getCurrentUser();

        // Mock settings - in a real app, these would come from a settings subcollection
        setSettings({
          shareEvaluations: true,
          showInLeaderboards: true,
          emailNotifications: true,
          pushNotifications: false,
        });
      } catch (err) {
        console.error("Error fetching settings:", err);
        setError("Failed to load your settings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [navigate]);

  const handleSettingChange = (setting: keyof UserSettings) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting],
    });

    // In a real app, this would be saved to Firebase
    setSuccess("Setting updated successfully.");

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate inputs
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (!auth.currentUser || !auth.currentUser.email) {
      setError("You must be logged in to change your password.");
      return;
    }

    try {
      setSaving(true);

      // Re-authenticate user first (required by Firebase for security)
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );

      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update password
      await updatePassword(auth.currentUser, newPassword);

      // Reset form fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setSuccess("Password changed successfully!");
    } catch (err: any) {
      console.error("Error changing password:", err);

      if (err.code === "auth/wrong-password") {
        setError("Current password is incorrect.");
      } else if (err.code === "auth/weak-password") {
        setError("New password is too weak.");
      } else {
        setError("Failed to change password. Please try again later.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    // In a real app, this would delete the user account after confirmation
    alert(
      "This feature would delete your account. Not implemented in this demo."
    );
    setShowDeleteConfirm(false);
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Account Settings */}
        <div>
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-bold mb-6">Account Settings</h2>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 text-white text-center rounded hover:bg-blue-700 transition"
                disabled={saving}
              >
                {saving ? "Updating..." : "Change Password"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Delete Account
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Once you delete your account, all your data will be permanently
                removed. This action cannot be undone.
              </p>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-2 px-4 bg-red-600 text-white text-center rounded hover:bg-red-700 transition"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Privacy & Notification Settings */}
        <div>
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-bold mb-6">Privacy Settings</h2>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    id="share-evaluations"
                    type="checkbox"
                    checked={settings.shareEvaluations}
                    onChange={() => handleSettingChange("shareEvaluations")}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="share-evaluations"
                    className="font-medium text-gray-700"
                  >
                    Share my evaluations with club coordinators
                  </label>
                  <p className="text-gray-500">
                    Allow club coordinators to view your speech evaluations for
                    coaching purposes.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    id="show-leaderboards"
                    type="checkbox"
                    checked={settings.showInLeaderboards}
                    onChange={() => handleSettingChange("showInLeaderboards")}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="show-leaderboards"
                    className="font-medium text-gray-700"
                  >
                    Show my name in club leaderboards
                  </label>
                  <p className="text-gray-500">
                    Allow your name and scores to appear in club performance
                    rankings.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-6">Notification Preferences</h2>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    id="email-notifications"
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={() => handleSettingChange("emailNotifications")}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="email-notifications"
                    className="font-medium text-gray-700"
                  >
                    Email Notifications
                  </label>
                  <p className="text-gray-500">
                    Receive emails about new evaluations, club announcements,
                    and reminders.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    id="push-notifications"
                    type="checkbox"
                    checked={settings.pushNotifications}
                    onChange={() => handleSettingChange("pushNotifications")}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="push-notifications"
                    className="font-medium text-gray-700"
                  >
                    Push Notifications
                  </label>
                  <p className="text-gray-500">
                    Receive browser notifications for important updates and
                    reminders.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Delete Your Account?</h3>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. All your personal data, evaluations,
              and history will be permanently deleted.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
