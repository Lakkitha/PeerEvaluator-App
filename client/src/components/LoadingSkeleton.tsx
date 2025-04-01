import React from "react";

type SkeletonType = "form" | "text" | "card" | "custom";

interface LoadingSkeletonProps {
  type?: SkeletonType;
  className?: string;
  lines?: number;
  width?: string; // For custom width control e.g., "w-full", "w-1/2"
  height?: string; // For custom height e.g., "h-10", "h-4"
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = "text",
  className = "",
  lines = 5,
  width = "w-full",
  height = "h-2.5",
}) => {
  // Common classes for all skeleton items
  const baseClasses = "bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse";

  // Generate text skeleton (paragraphs with varying widths)
  if (type === "text") {
    return (
      <div role="status" className={`animate-pulse ${className}`}>
        {Array(lines)
          .fill(0)
          .map((_, i) => {
            // Calculate width - make lines different widths for realism
            const widthClass =
              i % 3 === 0 ? "w-full" : i % 2 === 0 ? "w-3/4" : "w-5/6";
            return (
              <div
                key={i}
                className={`${baseClasses} ${height} ${widthClass} mb-2.5`}
              />
            );
          })}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // Generate form skeleton (form fields, labels, button)
  if (type === "form") {
    return (
      <div role="status" className={`w-full animate-pulse ${className}`}>
        {/* Title/Header */}
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4 mx-auto mb-6"></div>

        {/* Form Fields */}
        {Array(lines)
          .fill(0)
          .map((_, i) => (
            <React.Fragment key={i}>
              {/* Label */}
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-24 mb-2"></div>
              {/* Input */}
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-full mb-6"></div>
            </React.Fragment>
          ))}

        {/* Submit Button */}
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-full mt-2"></div>

        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // Card skeleton
  if (type === "card") {
    return (
      <div
        role="status"
        className={`animate-pulse rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}
      >
        {/* Card header */}
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4 mb-4"></div>

        {/* Card content */}
        {Array(lines)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className={`${baseClasses} h-2.5 ${
                i % 2 === 0 ? "w-full" : "w-4/5"
              } mb-2.5`}
            />
          ))}

        {/* Card footer */}
        <div className="flex items-center justify-between mt-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>

        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // Custom skeleton - most flexible
  return (
    <div role="status" className={`animate-pulse ${className}`}>
      {Array(lines)
        .fill(0)
        .map((_, i) => (
          <div key={i} className={`${baseClasses} ${height} ${width} mb-2.5`} />
        ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSkeleton;
