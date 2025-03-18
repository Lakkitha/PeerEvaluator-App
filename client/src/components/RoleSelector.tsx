import { useState } from "react";
import { Link } from "react-router-dom";

interface RoleSelectorProps {
  mode: "login" | "signup";
}

const RoleSelector = ({ mode }: RoleSelectorProps) => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          {mode === "login" ? "Log In" : "Get Started"} with PeerEvaluator
        </h1>

        <p className="text-center text-gray-600 mb-8">
          Please select your role to continue
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Club Coordinator Button */}
          <button
            onClick={() => handleRoleSelect("coordinator")}
            className={`p-6 rounded-lg border-2 transition duration-200 ${
              selectedRole === "coordinator"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
            }`}
          >
            <div className="flex flex-col items-center">
              <svg
                className="w-12 h-12 text-blue-600 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
              <h2 className="text-xl font-semibold">Club Coordinator</h2>
              <p className="text-sm text-gray-500 text-center mt-2">
                Manage club members and review evaluations
              </p>
            </div>
          </button>

          {/* Member Button */}
          <button
            onClick={() => handleRoleSelect("member")}
            className={`p-6 rounded-lg border-2 transition duration-200 ${
              selectedRole === "member"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
            }`}
          >
            <div className="flex flex-col items-center">
              <svg
                className="w-12 h-12 text-blue-600 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                ></path>
              </svg>
              <h2 className="text-xl font-semibold">Member</h2>
              <p className="text-sm text-gray-500 text-center mt-2">
                Get evaluations and track your speaking progress
              </p>
            </div>
          </button>
        </div>

        <div className="flex justify-center">
          <Link
            to={
              mode === "login"
                ? `/${selectedRole === "coordinator" ? "admin/" : ""}login`
                : `/${selectedRole === "coordinator" ? "admin/" : ""}signup`
            }
            className={`px-8 py-3 bg-blue-600 text-white rounded-md font-semibold transition ${
              selectedRole
                ? "hover:bg-blue-700"
                : "opacity-50 cursor-not-allowed"
            }`}
            onClick={(e) => !selectedRole && e.preventDefault()}
          >
            Continue
          </Link>
        </div>

        <div className="mt-6 text-center">
          {mode === "login" ? (
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/role-select/signup"
                className="text-blue-600 hover:underline"
              >
                Sign up
              </Link>
            </p>
          ) : (
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/role-select/login"
                className="text-blue-600 hover:underline"
              >
                Log in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
