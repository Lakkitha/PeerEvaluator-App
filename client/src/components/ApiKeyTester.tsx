import { useState } from "react";
import { testApiKey } from "../services/openai";

const ApiKeyTester = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ valid: boolean; message: string } | null>(null);

  const handleTestApiKey = async () => {
    setIsLoading(true);
    try {
      const testResult = await testApiKey();
      setResult(testResult);
    } catch (error) {
      setResult({
        valid: false,
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-center mb-4">OpenAI API Key Test</h2>

      <div className="flex justify-center mb-6">
        <button
          onClick={handleTestApiKey}
          disabled={isLoading}
          className={`px-4 py-2 rounded text-white font-medium focus:outline-none ${
            isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isLoading ? "Testing..." : "Test API Key"}
        </button>
      </div>

      {result && (
        <div className={`mt-4 p-4 rounded ${result.valid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          <p className="font-medium">{result.valid ? "Success!" : "Error"}</p>
          <p>{result.message}</p>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p>This tool tests your OpenAI API key configuration.</p>
        <p className="mt-1">If the test fails, check your .env file and make sure the VITE_OPEN_AI_API_KEY is correct.</p>
      </div>
    </div>
  );
};

export default ApiKeyTester;