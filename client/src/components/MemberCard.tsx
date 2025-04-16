import React from "react";

// Interface for member data
interface MemberCardProps {
  id?: string; // Make id optional since we're not using it directly in the component
  name: string;
  profilePicture?: string | null;
  level: "beginner" | "intermediate" | "expert";
  score: number;
  maxScore?: number;
}

const MemberCard: React.FC<MemberCardProps> = ({
  // id is excluded from props destructuring since it's not used
  name,
  profilePicture,
  level,
  score,
  maxScore = 100,
}) => {
  // Function to get level color based on skill level
  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-yellow-100 text-yellow-800";
      case "intermediate":
        return "bg-blue-100 text-blue-800";
      case "expert":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to get user initials for avatar fallback
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Calculate percentage for progress bar
  const scorePercentage = Math.min(100, (score / maxScore) * 100);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex">
      {/* Left Section (40%) - Profile Picture */}
      <div className="w-2/5 p-4 flex items-center justify-center bg-blue-50 dark:bg-gray-700">
        {profilePicture ? (
          <img
            src={profilePicture}
            alt={name}
            className="w-20 h-20 rounded-full object-cover border-2 border-blue-100 dark:border-gray-600"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center border-2 border-blue-100 dark:border-gray-600">
            <span className="text-xl font-bold text-blue-600 dark:text-blue-300">
              {getUserInitials(name)}
            </span>
          </div>
        )}
      </div>

      {/* Right Section (60%) - Member Info */}
      <div className="w-3/5 p-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 truncate">
          {name}
        </h3>

        <div className="flex items-center mb-3">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(
              level
            )}`}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </span>
        </div>

        <div className="mb-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Score: {score}/{maxScore}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
              style={{ width: `${scorePercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberCard;
