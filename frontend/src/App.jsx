import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./components/Landing";
import Dashboard from "./components/Dashboard";
import DashboardEpp from "./components/DashboardEpp";

function App() {
  const [loggedIn, setLoggedIn] = useState(localStorage.getItem("auth") === "true");

  return (
    <Router>
      <Routes>
        {/* Landing con modal */}
        <Route
          path="/"
          element={<Landing onLoginSuccess={() => setLoggedIn(true)} />}
        />

        {/* Dashboard protegido */}
        <Route
          path="/dashboard"
          element={loggedIn ? <Dashboard /> : <Navigate to="/" replace />}
        />

        {/* EPP protegido */}
        <Route
          path="/dashboardepp"
          element={loggedIn ? <DashboardEpp /> : <Navigate to="/" replace />}
        />


        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
