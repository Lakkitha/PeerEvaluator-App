import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const goToSpeechEvaluation = () => {
    navigate("/evaluate");
  };

  const goToProgressTracking = () => {
    navigate("/progress");
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to PeerEvaluator</h1>
      <p className="text-xl mb-8 text-center max-w-2xl">
        An AI-based evaluation and progress tracking system for public speaking
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">AI Speech Evaluation</h2>
          <p className="mb-4">
            Get objective feedback on your speeches using advanced AI
            technology.
          </p>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={goToSpeechEvaluation}
          >
            Learn More
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Progress Tracking</h2>
          <p className="mb-4">
            Visualize your improvement over time with detailed analytics.
          </p>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={goToProgressTracking}
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
