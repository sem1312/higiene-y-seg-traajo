import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./components/Landing";
import Dashboard from "./components/Dashboard";
import DashboardEpp from "./components/DashboardEpp";
import Register from "./components/Register";
import Profile from "./components/Profile";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    // Verifica si hay datos de sesión en localStorage
    const jefe_id = localStorage.getItem("jefe_id");
    const compania_id = localStorage.getItem("compania_id");
    if (jefe_id && compania_id) {
      setLoggedIn(true);
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Landing con modal */}
        <Route
          path="/"
          element={<Landing onLoginSuccess={() => setLoggedIn(true)} />}
        />

        {/* Página de registro */}
        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/profile"
          element={loggedIn ? <Profile /> : <Navigate to="/" replace />}
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
