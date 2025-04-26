import React from "react";

interface ScoreCardProps {
  label: string;
  icon: string;
  description: string;
  score: number;
}

const ScoreCard: React.FC<ScoreCardProps> = ({
  label,
  icon,
  description,
  score,
}) => {
  // Calculate color based on score
  const getColorClass = (score: number) => {
    if (score >= 8)
      return "bg-green-50 border-green-200 hover:bg-green-100 dark:bg-gray-800 dark:border-green-700 dark:hover:bg-gray-700";
    if (score >= 6)
      return "bg-blue-50 border-blue-200 hover:bg-blue-100 dark:bg-gray-800 dark:border-blue-700 dark:hover:bg-gray-700";
    if (score >= 4)
      return "bg-yellow-50 border-yellow-200 hover:bg-yellow-100 dark:bg-gray-800 dark:border-yellow-700 dark:hover:bg-gray-700";
    return "bg-red-50 border-red-200 hover:bg-red-100 dark:bg-gray-800 dark:border-red-700 dark:hover:bg-gray-700";
  };

  // Calculate progress bar color
  const getProgressColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-blue-500";
    if (score >= 4) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div
      className={`block p-6 border rounded-lg shadow-sm ${getColorClass(
        score
      )}`}
    >
      <div className="flex justify-between items-center mb-2">
        <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center">
          <span className="mr-2">{icon}</span> {label}
        </h5>
        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {score}/10
        </span>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-400 mb-3">
        {description}
      </p>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1 dark:bg-gray-700">
        <div
          className={`h-2.5 rounded-full ${getProgressColor(score)}`}
          style={{ width: `${(score / 10) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ScoreCard;
