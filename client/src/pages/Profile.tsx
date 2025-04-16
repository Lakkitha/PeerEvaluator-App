import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  getCurrentUser,
  getUserClub,
  getCurrentUserEvaluations,
  updateUserProfilePicture,
} from "../services/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface UserProfile {
  username: string;
  email: string;
  userPicture: string | null;
  userLevel: string;
  clubID: string | null;
  isVerified: boolean;
  joinedDate: string;
}

interface ClubDetails {
  id: string;
  name: string;
  joinDate: string | null;
}

const Profile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [clubDetails, setClubDetails] = useState<ClubDetails | null>(null);
  const [evaluationCount, setEvaluationCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showClubChangeModal, setShowClubChangeModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Fetch user data
  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);

        // Get user profile data
        const userData = await getCurrentUser();
        setUserProfile(userData);
        setEditName(userData.username);

        // Get club information
        if (userData.clubID) {
          const clubData = await getUserClub();
          if (clubData) {
            setClubDetails({
              id: userData.clubID,
              name: clubData.clubName,
              joinDate: userData.createdAt, // Using user creation date as club join date
            });
          }
        }

        // Get evaluation statistics
        const evaluations = await getCurrentUserEvaluations();
        setEvaluationCount(evaluations.length);

        // Calculate average rating if evaluations exist
        if (evaluations.length > 0) {
          const totalRating = evaluations.reduce(
            (sum, eval) => sum + (eval.scores?.overallImpact || 0),
            0
          );
          setAverageRating(totalRating / evaluations.length);
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Failed to load your profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleProfilePictureChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || e.target.files.length === 0 || !auth.currentUser) {
      return;
    }

    try {
      setUploading(true);
      const file = e.target.files[0];

      // Create a storage reference
      const storageRef = ref(db, `profilePictures/${auth.currentUser.uid}`);

      // Upload the file
      await uploadBytes(storageRef, file);

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Update user's profile picture in Firebase
      await updateUserProfilePicture(downloadURL);

      // Update local state
      setUserProfile((prev) =>
        prev ? { ...prev, userPicture: downloadURL } : null
      );

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Error uploading profile picture:", err);
      setError("Failed to update profile picture. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleEditProfile = async () => {
    // In a real app, this would update the user's name in Firebase
    // For now, just close the modal and update local state
    setUserProfile((prev) => (prev ? { ...prev, username: editName } : null));
    setShowEditModal(false);
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
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
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Personal Info Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-6">Personal Information</h2>

          <div className="flex flex-col md:flex-row items-center mb-6">
            <div className="relative mb-4 md:mb-0 md:mr-6">
              {userProfile?.userPicture ? (
                <img
                  src={userProfile.userPicture}
                  alt={userProfile.username}
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center border-2 border-gray-300">
                  <span className="text-2xl font-bold text-blue-600">
                    {userProfile?.username
                      ? getUserInitials(userProfile.username)
                      : "U"}
                  </span>
                </div>
              )}

              <div className="absolute bottom-0 right-0">
                <label
                  htmlFor="profile-picture"
                  className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center cursor-pointer"
                >
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    ></path>
                  </svg>
                </label>
                <input
                  id="profile-picture"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePictureChange}
                  ref={fileInputRef}
                  disabled={uploading}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold">{userProfile?.username}</h3>
              <p className="text-gray-600">{userProfile?.email}</p>
              <div className="mt-2 flex items-center">
                <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-700">
                  {userProfile?.userLevel}
                </span>
                {clubDetails && (
                  <span className="ml-2 px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-700">
                    {clubDetails.name} Member
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowEditModal(true)}
            className="w-full py-2 px-4 bg-blue-600 text-white text-center rounded hover:bg-blue-700 transition"
          >
            Edit Profile
          </button>
        </div>

        {/* Club Assignment & Stats */}
        <div className="space-y-6">
          {/* Club Assignment Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Club Assignment</h2>

            {clubDetails ? (
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center mr-4">
                    <span className="text-xl font-bold text-blue-600">
                      {clubDetails.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{clubDetails.name}</h3>
                    {clubDetails.joinDate && (
                      <p className="text-sm text-gray-600">
                        Member since{" "}
                        {new Date(clubDetails.joinDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {!userProfile?.isVerified && (
                  <div className="mt-3 px-3 py-2 bg-yellow-100 text-yellow-800 rounded text-sm">
                    Your membership is pending verification by the club
                    coordinator.
                  </div>
                )}

                <div className="mt-4">
                  <button
                    onClick={() => setShowClubChangeModal(true)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Request Club Change
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">
                  You're not assigned to any club yet.
                </p>
                <button
                  onClick={() => setShowClubChangeModal(true)}
                  className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Join a Club
                </button>
              </div>
            )}
          </div>

          {/* Stats Overview */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Statistics Overview</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-gray-600 text-sm mb-1">Evaluations</p>
                <p className="text-2xl font-bold">{evaluationCount}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-gray-600 text-sm mb-1">Avg. Rating</p>
                <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
              </div>
            </div>

            <div className="mt-4">
              <Link
                to="/progresstracking"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Detailed Statistics
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Edit Profile</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                value={userProfile?.email || ""}
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                Email can't be changed. Contact support for assistance.
              </p>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleEditProfile}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Club Change Modal */}
      {showClubChangeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Change Club</h3>
            <p className="text-gray-600 mb-4">
              Feature coming soon! This would allow users to request a change to
              a different club.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowClubChangeModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
