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
      {/* Hero Jumbotron */}
      <section className="w-full bg-white dark:bg-gray-900 bg-[url('https://flowbite.s3.amazonaws.com/docs/jumbotron/hero-pattern.svg')] dark:bg-[url('https://flowbite.s3.amazonaws.com/docs/jumbotron/hero-pattern-dark.svg')]">
        <div className="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 z-10 relative">
          <a
            href="#"
            className="inline-flex justify-between items-center py-1 px-1 pe-4 mb-7 text-sm text-blue-700 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800"
          >
            <span className="text-xs bg-blue-600 rounded-full text-white px-4 py-1.5 me-3">
              New
            </span>
            <span className="text-sm font-medium">
              Peer Evaluation 2.0 is here! Try the new features
            </span>
            <svg
              className="w-2.5 h-2.5 ms-2 rtl:rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 6 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 9 4-4-4-4"
              />
            </svg>
          </a>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
            Empowering Team Growth Through Feedback
          </h1>
          <p className="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 lg:px-48 dark:text-gray-200">
            Our peer evaluation system helps teams provide constructive
            feedback, recognize contributions, and foster professional
            development in a transparent and meaningful way.
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                goToSpeechEvaluation();
              }}
              className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
            >
              Start Evaluation
              <svg
                className="w-3.5 h-3.5 ms-2 rtl:rotate-180"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 5h12m0 0L9 1m4 4L9 9"
                />
              </svg>
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                goToProgressTracking();
              }}
              className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-gray-900 rounded-lg border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
            >
              Learn More
            </a>
          </div>
        </div>
        <div className="bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-900 w-full h-full absolute top-0 left-0 z-0"></div>
      </section>

      <div className="mt-16 mb-4">
        <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-50">
          Welcome to PeerEvaluator
        </h1>
        <p className="text-xl mb-8 text-center max-w-2xl text-gray-700 dark:text-gray-300">
          An AI-based evaluation and progress tracking system for public
          speaking
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mb-16">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            AI Speech Evaluation
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            Get objective feedback on your speeches using advanced AI
            technology.
          </p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-200 dark:bg-blue-500 dark:hover:bg-blue-600"
            onClick={goToSpeechEvaluation}
          >
            Learn More
          </button>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Progress Tracking
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            Visualize your improvement over time with detailed analytics.
          </p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-200 dark:bg-blue-500 dark:hover:bg-blue-600"
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
