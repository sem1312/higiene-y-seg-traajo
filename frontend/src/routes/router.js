import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Importa tus componentes reales
import Landing from "./components/Landing";
import Dashboard from "./components/Dashboard";
import NotFound from "./components/NotFound";

const AppRouter = () => (
  <Router>
    <Routes>
      {/* Página inicial con navbar y banner */}
      <Route path="/" element={<Landing />} />

      {/* Panel principal después del login */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* 404 para rutas inválidas */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Router>
);

export default AppRouter;
