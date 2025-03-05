import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  // Replace this with your actual authentication check
  const isAuthenticated = localStorage.getItem("token") !== null;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;