import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Add useLocation
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  isCurrentUserClubAdmin,
  isCurrentUserWebAdmin,
  getUserClub,
  getClubById,
  getCurrentClubAdmin,
  getAllClubs,
  updateUserClub,
  getClubMembers,
} from "../services/firebase";
import ThemeToggle from "../ThemeToggle";

// Club change request modal component
const ClubChangeModal = ({
  isOpen,
  onClose,
  currentClubId,
  onRequestChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentClubId: string;
  onRequestChange: (newClubId: string) => Promise<void>;
}) => {
  const [clubs, setClubs] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClub, setSelectedClub] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setLoading(true);
        const allClubs = await getAllClubs();
        // Filter out the current club
        const availableClubs = allClubs
          .filter((club) => club.id !== currentClubId)
          .map((club) => ({
            id: club.id,
            name: club.clubName,
          }));
        setClubs(availableClubs);
      } catch (err) {
        setError("Failed to load clubs");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchClubs();
      setSelectedClub("");
      setError("");
    }
  }, [isOpen, currentClubId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClub) {
      setError("Please select a club");
      return;
    }

    setSubmitting(true);
    try {
      await onRequestChange(selectedClub);
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred");
      }
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 m-4 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Request Club Change
          </h3>
          <button
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            onClick={onClose}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : clubs.length === 0 ? (
          <p className="text-gray-700 dark:text-gray-300 py-4">
            There are no other clubs available to join at this time.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label
                htmlFor="club"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Select New Club
              </label>
              <select
                id="club"
                value={selectedClub}
                onChange={(e) => setSelectedClub(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
                disabled={submitting}
              >
                <option value="">-- Select a club --</option>
                {clubs.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-gray-700 dark:text-gray-300 text-sm mb-6">
              <p>
                Your request will be sent to the coordinator of the selected
                club. When approved, you will be moved to the new club.
              </p>
              <p className="mt-2">
                Note: You will need to be verified by the new club coordinator
                before you can access club features.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={submitting || !selectedClub}
              >
                {submitting ? "Submitting..." : "Request Change"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// Manage Members modal component (for club admins)
const ManageMembersModal = ({
  isOpen,
  onClose,
  clubId,
}: {
  isOpen: boolean;
  onClose: () => void;
  clubId: string;
}) => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  useEffect(() => {
    const loadMembers = async () => {
      if (!isOpen || !clubId) return;

      try {
        setLoading(true);
        const clubMembers = await getClubMembers(clubId);
        setMembers(clubMembers);

        // In a real implementation, we'd also load pending club change requests
        // For now, we'll mock this with empty array
        setPendingRequests([]);
      } catch (err) {
        console.error("Error loading club members:", err);
        setError("Failed to load club members");
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [isOpen, clubId]);

  const filteredMembers = members.filter(
    (member) =>
      member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 m-4 max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Manage Club Members
          </h3>
          <button
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            onClick={onClose}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Search bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search members..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="w-5 h-5 absolute right-3 top-2.5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
        </div>

        {/* Club change requests */}
        {pendingRequests.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">
              Pending Club Change Requests
            </h4>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-md p-4 mb-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Requested Date
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {pendingRequests.map((request) => (
                      <tr key={request.id}>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {request.username}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {request.email}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {new Date(request.requestDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <button className="text-green-600 hover:text-green-900 dark:hover:text-green-400 mr-3">
                            Approve
                          </button>
                          <button className="text-red-600 hover:text-red-900 dark:hover:text-red-400">
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Members list */}
        <h4 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">
          Club Members
        </h4>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <p className="text-gray-700 dark:text-gray-300 py-4">
            {searchTerm
              ? "No members match your search."
              : "No members in your club yet."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Joined Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Evaluations
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredMembers.map((member) => (
                  <tr key={member.id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {member.username}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {member.email}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(member.joinedDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {member.evaluationCount}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link
                        to={`/admin/member-progress/${member.id}`}
                        className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 mr-3"
                        onClick={onClose}
                      >
                        View Progress
                      </Link>
                      <button className="text-red-600 hover:text-red-900 dark:hover:text-red-400">
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const [isClubAdmin, setIsClubAdmin] = useState(false);
  const [isWebAdmin, setIsWebAdmin] = useState(false);
  const [userClub, setUserClub] = useState<{
    id: string;
    name: string;
    joinDate?: string;
  } | null>(null);
  const [showClubChangeModal, setShowClubChangeModal] = useState(false);
  const [showManageMembersModal, setShowManageMembersModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const location = useLocation(); // Get current location

  // Function to determine if a nav item is active
  const isActive = (path: string) => {
    if (path === "/home" && location.pathname === "/") {
      return true; // Consider home active when on root path
    }
    return location.pathname.startsWith(path);
  };

  // Fetch user's club information
  const fetchUserClubInfo = async () => {
    if (!user) return;

    try {
      if (isClubAdmin) {
        // If club admin, get club info from admin record
        try {
          const adminData = await getCurrentClubAdmin();
          if (adminData && adminData.clubID) {
            const club = await getClubById(adminData.clubID);
            setUserClub({
              id: adminData.clubID,
              name: club.clubName,
              joinDate: adminData.createdAt,
            });
          }
        } catch (adminError) {
          console.log("Not a club admin or admin record issue:", adminError);
          // Don't throw - let the function continue to check normal user path
        }
      }

      // If not a club admin or club admin check failed, try regular user path
      if (!userClub) {
        try {
          const club = await getUserClub();
          if (club) {
            setUserClub({
              id: club.id || club.clubName, // Handle both cases
              name: club.clubName,
            });
          } else {
            // No club found
            setUserClub(null);
          }
        } catch (userError) {
          console.log("Error getting user club info:", userError);
          setUserClub(null);
        }
      }
    } catch (error) {
      console.error("Error fetching user club information:", error);
      setUserClub(null);
    }
  };

  // Monitor authentication state and check admin status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      // Check admin status if user is logged in
      if (currentUser) {
        try {
          const clubAdminStatus = await isCurrentUserClubAdmin();
          setIsClubAdmin(clubAdminStatus);

          const webAdminStatus = await isCurrentUserWebAdmin();
          setIsWebAdmin(webAdminStatus);

          // Fetch club info after determining admin status
          fetchUserClubInfo();
        } catch (error) {
          console.error("Error checking admin status:", error);
        }
      } else {
        setIsClubAdmin(false);
        setIsWebAdmin(false);
        setUserClub(null);
      }
    });

    return () => unsubscribe();
  }, [fetchUserClubInfo]); // Add fetchUserClubInfo as dependency

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsUserDropdownOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get user's initials for the avatar
  const getUserInitial = () => {
    if (user?.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    } else if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const handleRequestClubChange = async (newClubId: string) => {
    try {
      await updateUserClub(newClubId);
      fetchUserClubInfo();
    } catch (error) {
      console.error("Error requesting club change:", error);
      throw error;
    }
  };

  return (
    <>
      <nav className="bg-white border-gray-200 dark:bg-gray-900 fixed w-full z-20 shadow-md">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          {" "}
          <Link
            to="/"
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <img
              src="/src/assets/SpeakSmart-Logo.png"
              alt="SpeakSmart Logo"
              className="h-8 w-8 mr-2"
            />
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
              SpeakSmart
            </span>
          </Link>
          {/* Center the navigation items on desktop */}
          <div
            className={`items-center justify-center ${
              isMobileMenuOpen ? "block" : "hidden"
            } w-full md:flex md:w-auto md:order-1`}
            id="navbar-user"
          >
            {user && (
              <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                <li>
                  <Link
                    to="/home"
                    className={`block py-2 px-3 text-center rounded md:p-0 ${
                      isActive("/home")
                        ? "text-white bg-blue-700 md:bg-transparent md:text-blue-700 md:dark:text-blue-500"
                        : "text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                    }`}
                    aria-current={isActive("/home") ? "page" : undefined}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/evaluate"
                    className={`block py-2 px-3 text-center rounded md:p-0 ${
                      isActive("/evaluate")
                        ? "text-white bg-blue-700 md:bg-transparent md:text-blue-700 md:dark:text-blue-500"
                        : "text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                    }`}
                    aria-current={isActive("/evaluate") ? "page" : undefined}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Evaluation
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    className={`block py-2 px-3 text-center rounded md:p-0 ${
                      isActive("/dashboard")
                        ? "text-white bg-blue-700 md:bg-transparent md:text-blue-700 md:dark:text-blue-500"
                        : "text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                    }`}
                    aria-current={isActive("/dashboard") ? "page" : undefined}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/progress"
                    className={`block py-2 px-3 text-center rounded md:p-0 ${
                      isActive("/progress")
                        ? "text-white bg-blue-700 md:bg-transparent md:text-blue-700 md:dark:text-blue-500"
                        : "text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                    }`}
                    aria-current={isActive("/progress") ? "page" : undefined}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Progress
                  </Link>
                </li>
              </ul>
            )}
          </div>
          <div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            {user ? (
              /* User dropdown button when logged in */
              <div className="relative">
                <button
                  ref={buttonRef}
                  type="button"
                  className="flex text-sm bg-gray-800 rounded-full md:me-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                  id="user-menu-button"
                  aria-expanded={isUserDropdownOpen}
                  onClick={toggleUserDropdown}
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    {getUserInitial()}
                  </div>
                </button>

                {/* User dropdown menu - positioned relative to the button */}
                <div
                  ref={dropdownRef}
                  className={`z-50 ${
                    isUserDropdownOpen ? "block" : "hidden"
                  } absolute right-0 mt-2 w-48 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow-lg dark:bg-gray-700 dark:divide-gray-600`}
                  id="user-dropdown"
                >
                  <div className="px-4 py-3">
                    <span className="block text-sm text-gray-900 dark:text-white">
                      {user.displayName || "User"}
                    </span>
                    <span className="block text-sm text-gray-500 truncate dark:text-gray-400">
                      {user.email}
                    </span>
                  </div>
                  <ul className="py-2" aria-labelledby="user-menu-button">
                    {/* Club information section */}
                    {userClub && (
                      <>
                        <li className="px-4 py-2">
                          <div className="flex items-center mb-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                              Current Club
                            </span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2">
                              <span className="text-xs">🏆</span>
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                              {userClub.name}
                            </span>
                          </div>
                          {userClub.joinDate && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Joined:{" "}
                              {new Date(userClub.joinDate).toLocaleDateString()}
                            </div>
                          )}
                        </li>
                        <li>
                          <hr className="my-1 border-gray-200 dark:border-gray-600" />
                        </li>
                      </>
                    )}

                    <li>
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        Settings
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                    </li>
                    {/* Club management options based on role */}
                    {!isClubAdmin && userClub && (
                      <li>
                        <button
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            setShowClubChangeModal(true);
                          }}
                          className="flex w-full text-left items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                        >
                          <span className="mr-2">✏️</span>
                          Request Club Change
                        </button>
                      </li>
                    )}
                    {isClubAdmin && (
                      <>
                        <li>
                          <Link
                            to="/admin/dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            Club Admin
                          </Link>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              setIsUserDropdownOpen(false);
                              setShowManageMembersModal(true);
                            }}
                            className="flex w-full text-left items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                          >
                            <span className="mr-2">👥</span>
                            Manage Members
                          </button>
                        </li>
                      </>
                    )}
                    {isWebAdmin && (
                      <li>
                        <Link
                          to="/webadmin/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          Web Admin
                        </Link>
                      </li>
                    )}
                    <li>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                      >
                        Sign out
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              /* Login/Signup buttons when not logged in */
              <div className="flex space-x-2">
                <Link
                  to="/role-select/login"
                  className="py-2 px-3 text-sm text-gray-800 bg-gray-200 hover:bg-gray-300 rounded dark:text-white dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  Login
                </Link>
                <Link
                  to="/role-select/signup"
                  className="py-2 px-3 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded"
                >
                  Get Started
                </Link>
              </div>
            )}

            <ThemeToggle />

            <button
              type="button"
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              aria-controls="navbar-user"
              aria-expanded={isMobileMenuOpen}
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 17 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 1h15M1 7h15M1 13h15"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Club Change Modal */}
      <ClubChangeModal
        isOpen={showClubChangeModal}
        onClose={() => setShowClubChangeModal(false)}
        currentClubId={userClub?.id || ""}
        onRequestChange={handleRequestClubChange}
      />

      {/* Manage Members Modal */}
      {isClubAdmin && userClub && (
        <ManageMembersModal
          isOpen={showManageMembersModal}
          onClose={() => setShowManageMembersModal(false)}
          clubId={userClub.id}
        />
      )}
    </>
  );
};

export default Navbar;
