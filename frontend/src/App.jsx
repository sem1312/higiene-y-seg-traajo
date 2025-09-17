import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./components/Landing";
import Dashboard from "./components/Dashboard";
import EditarEpps from "./components/EditarEpps";
import AddEpp from "./components/AddEppModal";
import RegisterPage from "./components/RegisterPage";

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

        <Route path="/register" element={<RegisterPage />} />

        {/* Editar EPPs */}
        <Route
          path="/editar-epps/:trabajadorId"
          element={loggedIn ? <EditarEpps /> : <Navigate to="/" replace />}
        />

        {/* Agregar EPP */}
        <Route
  path="/addepp"
  element={loggedIn ? <AddEpp
    compania_id={localStorage.getItem("compania_id")}
    jefe_id={localStorage.getItem("jefe_id")}
  /> : <Navigate to="/" replace />}
/>



        {/* Redirigir cualquier ruta inválida al inicio */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
