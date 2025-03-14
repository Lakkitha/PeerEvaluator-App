import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedClub, setSelectedClub] = useState("");
  const [clubs, setClubs] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch clubs on component mount
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const clubsCollection = collection(db, "clubs");
        const clubSnapshot = await getDocs(clubsCollection);
        const clubsList = clubSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().clubName,
        }));
        setClubs(clubsList);
      } catch (error) {
        console.error("Error fetching clubs:", error);
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

      // Create a user document in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        username: name,
        email,
        clubID: selectedClub,
        userLevel: "Beginner",
        userPicture: null,
        isVerified: false,
        createdAt: now,
        updatedAt: now,
      });

      // Create entry in shared data
      await setDoc(doc(db, "sharedData", userCredential.user.uid), {
        userID: userCredential.user.uid,
        username: name,
        clubID: selectedClub,
        userLevel: "Beginner",
      });

      // Redirect to home
      navigate("/home");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to create account");
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
          Create an Account
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
              htmlFor="club"
              className="block text-sm font-medium text-gray-700"
            >
              Select Club
            </label>
            <select
              id="club"
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a club</option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
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
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
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
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
