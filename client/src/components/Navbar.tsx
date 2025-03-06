import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const Navbar = () => {
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-blue-600 text-white shadow-lg z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to={user ? "/home" : "/"} className="text-xl font-bold">
            PeerEvaluator
          </Link>
          <div className="flex space-x-4">
            {user ? (
              <>
                <Link to="/home" className="hover:text-blue-200">
                  Home
                </Link>
                <Link to="/evaluate" className="hover:text-blue-200">
                  Speech Evaluation
                </Link>
                {/* Additional protected links */}
                <button
                  onClick={handleLogout}
                  className="hover:text-blue-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/" className="hover:text-blue-200">
                  Login
                </Link>
                <Link to="/signup" className="hover:text-blue-200">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;