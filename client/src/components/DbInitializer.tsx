import { useState } from "react";
import { initializeDatabase } from "../utils/dbInit";

const DbInitializer = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleInitialize = async () => {
    if (
      !confirm(
        "Are you sure you want to initialize the database? This should only be done once."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await initializeDatabase();
      setResult("Database initialized successfully");
    } catch (error) {
      setResult(
        error instanceof Error ? error.message : "Failed to initialize database"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-center mb-4">
        Database Initializer
      </h2>

      <div className="text-sm text-red-700 mb-4">
        <p>
          <strong>Warning:</strong> Only use this button once during initial
          setup.
        </p>
        <p>It will create default clubs and admin accounts.</p>
      </div>

      <div className="flex justify-center mb-6">
        <button
          onClick={handleInitialize}
          disabled={loading}
          className={`px-4 py-2 rounded text-white font-medium focus:outline-none ${
            loading ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {loading ? "Initializing..." : "Initialize Database"}
        </button>
      </div>

      {result && (
        <div className="mt-4 p-4 rounded bg-blue-100 text-blue-700">
          <p>{result}</p>
        </div>
      )}
    </div>
  );
};

export default DbInitializer;
