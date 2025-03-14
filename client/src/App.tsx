import { BrowserRouter, Routes, Route } from "react-router-dom";

// Page Imports
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import SpeechEvaluation from "./pages/SpeechEvaluation";
import ProgressTracker from "./pages/ProgressTracker";
import ClubAdminDashboard from "./pages/ClubAdminDashboard";
import WebAdminDashboard from "./pages/WebAdminDashboard"; // Import the new component
import DbInitializer from "./pages/DbInitializer"; // Import the new component

// Components
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import WebAdminRoute from "./components/WebAdminRoute"; // We'll create this

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/init" element={<DbInitializer />} />{" "}
          {/* Add this route for development */}
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
