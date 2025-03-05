import { BrowserRouter, Routes, Route } from "react-router-dom";

// Page Imports (will create these later)
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
// Components
import Layout from "./components/Layout";
// import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />

          {/* Protected User Routes
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/evaluate" element={<SpeechEvaluation />} />
            <Route path="/progress" element={<ProgressTracking />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Route> */}

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;