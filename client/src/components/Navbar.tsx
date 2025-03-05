import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold">PeerEvaluator</Link>
          <div className="flex space-x-4">
            <Link to="/" className="hover:text-blue-200">Home</Link>
            <Link to="/about" className="hover:text-blue-200">About</Link>
            <Link to="/contact" className="hover:text-blue-200">Contact</Link>
            <Link to="/login" className="hover:text-blue-200">Login</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;