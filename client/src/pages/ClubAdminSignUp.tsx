import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import {
  doc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
} from "firebase/firestore";

const ClubAdminSignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedClub, setSelectedClub] = useState("");
  const [clubs, setClubs] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingClubs, setFetchingClubs] = useState(true); // Add loading state for clubs fetch
  const navigate = useNavigate();

  // Fetch clubs on component mount
  useEffect(() => {
    const fetchClubs = async () => {
      setFetchingClubs(true);
      try {
        // Get clubs that don't have an admin assigned yet
        const clubsCollection = collection(db, "clubs");
        const clubSnapshot = await getDocs(clubsCollection);

        const availableClubs = clubSnapshot.docs
          .filter((doc) => !doc.data().clubAdminID) // Only clubs without admins
          .map((doc) => ({
            id: doc.id,
            name: doc.data().clubName,
          }));

        setClubs(availableClubs);
      } catch (error) {
        console.error("Error fetching clubs:", error);
        setError("Failed to load available clubs. Please try again later.");
      } finally {
        setFetchingClubs(false);
      }
    };

    fetchClubs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    // Validate password strength
    if (password.length < 6) {
      return setError("Password should be at least 6 characters");
    }

    // Validate club selection
    if (!selectedClub) {
      return setError("Please select a club");
    }

    setLoading(true);

    try {
      // Check if email is already registered as a club admin
      const adminQuery = query(
        collection(db, "Club_Admins"),
        where("email", "==", email)
      );

      try {
        const adminSnapshot = await getDocs(adminQuery);
        if (!adminSnapshot.empty) {
          setLoading(false);
          return setError("This email is already registered as a club admin");
        }
      } catch (error) {
        console.log("Error checking existing admin - continuing signup", error);
        // We'll continue anyway even if this check fails due to permissions
      }

      // Create the user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update profile with display name
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: name,
        });
      }

      const now = new Date().toISOString();

      // Create a club admin document in Firestore
      await setDoc(doc(db, "Club_Admins", userCredential.user.uid), {
        adminName: name,
        email,
        clubID: selectedClub,
        createdAt: now,
        updatedAt: now,
      });

      // Update the club with this admin's ID
      try {
        await updateDoc(doc(db, "clubs", selectedClub), {
          clubAdminID: userCredential.user.uid,
          updatedAt: now,
        });
      } catch (updateError) {
        console.error("Error updating club with admin ID:", updateError);
        // Continue anyway - we can fix this association later if needed
      }

      // Success! Redirect to admin dashboard
      navigate("/admin/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to create account");
        console.error("Signup error:", err);
      } else {
        setError("Failed to create account");
        console.error("Unknown signup error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg dark:bg-gray-800">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6 dark:text-blue-400">
          Register as Club Coordinator
        </h1>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900 dark:border-red-700 dark:text-red-300"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {fetchingClubs ? (
          <div className="flex justify-center my-6">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Form fields remain the same... */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label
                htmlFor="club"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Select Club to Administer
              </label>
              <select
                id="club"
                value={selectedClub}
                onChange={(e) => setSelectedClub(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="">Select a club</option>
                {clubs.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.name}
                  </option>
                ))}
              </select>
              {clubs.length === 0 && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                  No clubs available. All clubs already have coordinators.
                </p>
              )}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-600"
                required
              />
              <label
                htmlFor="terms"
                className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
              >
                I agree to the{" "}
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  Terms and Conditions
                </a>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Creating Account..." : "Register as Coordinator"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Already a coordinator?{" "}
            <Link
              to="/admin/login"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClubAdminSignUp;
