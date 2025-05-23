import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { isCurrentUserWebAdmin } from "../services/firebase";

const WebAdminSignup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();

  // Add a ADMIN_SECRET_KEY constant for development
  const ADMIN_SECRET_KEY = "auth_key_2023_peer_c";

  const checkAuthorization = async () => {
    // Skip admin check if not logged in
    if (!auth.currentUser) {
      // Just check the secret key
      if (secretKey === ADMIN_SECRET_KEY) {
        setAuthorized(true);
      } else {
        setError("Invalid secret key. Web admin creation is restricted.");
      }
      return;
    }

    // Only try to check admin status if already logged in
    try {
      const isWebAdmin = await isCurrentUserWebAdmin();
      if (isWebAdmin) {
        setAuthorized(true);
      } else if (secretKey === ADMIN_SECRET_KEY) {
        setAuthorized(true);
      } else {
        setError("Invalid secret key. Web admin creation is restricted.");
      }
    } catch (error) {
      console.error("Error checking admin status:", error);

      // Fall back to secret key verification if admin check fails
      if (secretKey === ADMIN_SECRET_KEY) {
        setAuthorized(true);
      } else {
        setError("Invalid secret key. Web admin creation is restricted.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // First, if not already authorized, verify secret key
    if (!authorized) {
      await checkAuthorization();
      return;
    }

    // Validation checks
    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    if (password.length < 8) {
      return setError(
        "Password should be at least 8 characters for administrators"
      );
    }

    setLoading(true);

    try {
      // Sign out any existing user first to avoid permission conflicts
      if (auth.currentUser) {
        await auth.signOut();
      }

      // Create new user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update profile with name
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      const now = new Date().toISOString();

      // Create web admin document
      try {
        await setDoc(doc(db, "Web_Admin", userCredential.user.uid), {
          adminName: name,
          email: email,
          createdAt: now,
          updatedAt: now,
        });

        // Success - redirect to dashboard
        navigate("/webadmin/dashboard");
      } catch (error) {
        // If creating admin doc fails, delete the auth user to avoid orphaned accounts
        console.error("Failed to create admin document:", error);
        await userCredential.user.delete();
        throw new Error(
          "Failed to create admin record. Account creation aborted."
        );
      }
    } catch (error: unknown) {
      console.error("Error creating web admin:", error);
      if (error instanceof Error) {
        setError(error.message || "Failed to create account");
      } else {
        setError("Failed to create account");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Register Web Administrator
        </h1>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!authorized ? (
            <div>
              <div className="mb-4">
                <label
                  htmlFor="secretKey"
                  className="block text-sm font-medium text-gray-700"
                >
                  Secret Key
                </label>
                <input
                  type="password"
                  id="secretKey"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="text-sm text-gray-600 mb-4">
                <p>
                  You need a secret key to register as a Web Administrator. This
                  is a restricted role with system-wide privileges.
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                Verify
              </button>
            </div>
          ) : (
            <>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  required
                />
                <label
                  htmlFor="terms"
                  className="ml-2 block text-sm text-gray-900"
                >
                  I agree to the{" "}
                  <a href="#" className="text-blue-600 hover:text-blue-500">
                    Terms and Conditions
                  </a>
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {loading
                    ? "Creating Account..."
                    : "Register as Web Administrator"}
                </button>
              </div>
            </>
          )}
        </form>

        <div className="mt-6">
          <p className="text-center text-sm text-gray-600">
            Already a Web Administrator?{" "}
            <a
              href="/web-admin"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Log in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WebAdminSignup;
