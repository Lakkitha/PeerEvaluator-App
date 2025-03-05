import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-2xl mb-6">Page not found</p>
      <p className="text-gray-600 mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
        Go back to home
      </Link>
    </div>
  );
};

export default NotFound;