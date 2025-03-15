import { BrowserRouter, Routes, Route } from "react-router-dom";

// Page Imports
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import SpeechEvaluation from "./pages/SpeechEvaluation";
import ProgressTracker from "./pages/ProgressTracker";
import ClubAdminDashboard from "./pages/ClubAdminDashboard";
import WebAdminDashboard from "./pages/WebAdminDashboard";
import DbInitializer from "./pages/DbInitializer";

// Components
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import WebAdminRoute from "./components/WebAdminRoute";
import RoleSelector from "./components/RoleSelector";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />

          {/* Role Selection Routes */}
          <Route path="/role-select/login" element={<RoleSelector mode="login" />} />
          <Route path="/role-select/signup" element={<RoleSelector mode="signup" />} />

          {/* Regular Login/Signup Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Admin Login/Signup Routes - we'll need to create these pages */}
          <Route path="/admin/login" element={<Login isAdminLogin={true} />} />
          <Route path="/admin/signup" element={<SignUp isAdminSignup={true} />} />

          <Route path="/init" element={<DbInitializer />} />

          {/* Protected User Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/evaluate" element={<SpeechEvaluation />} />
            <Route path="/progress" element={<ProgressTracker />} />
            {/* <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} /> */}
          </Route>

          {/* Club Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<ClubAdminDashboard />} />
          </Route>

          {/* Web Admin Routes */}
          <Route element={<WebAdminRoute />}>
            <Route path="/webadmin/dashboard" element={<WebAdminDashboard />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
