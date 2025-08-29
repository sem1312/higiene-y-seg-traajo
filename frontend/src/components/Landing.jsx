import React, { useState } from "react";
import Navbar from "./Navbar";
import LoginModal from "./LoginModal";
import "../styles/Landing.css";

const Landing = ({ onLoginSuccess }) => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="landing-container">
      {/* Navbar recibe función para abrir modal */}
      <Navbar onLoginClick={() => setShowLogin(true)} />

      {/* Hero/banner */}
      <section className="hero">
        <h1 className="app-title">CONTROL DE EPP+</h1>
        <h2 className="app-subtitle">La app que cuida a tu equipo</h2>
        <p className="app-description">
          Sistema de gestión y control de elementos de protección personal.
        </p>
      </section>

      {/* Beneficios / secciones */}
      <section id="sobre" className="benefits">
        <h3>Sobre la app</h3>
        <p>Esta herramienta permite a supervisores y responsables de seguridad:</p>
        <ul>
          <li>Monitorear en tiempo real el cumplimiento de las normas de seguridad.</li>
          <li>Detectar y registrar incumplimientos en el uso de EPP.</li>
          <li>Generar reportes claros y automatizados para mejorar la toma de decisiones.</li>
          <li>Fomentar una cultura de prevención en toda la organización.</li>
        </ul>
      </section>

      <section id="beneficios" className="benefits">
        <h3>Beneficios</h3>
        <ul>
          <li>Control completo de stock de EPP.</li>
          <li>Alertas automáticas de vencimiento.</li>
          <li>Historial detallado de entregas.</li>
        </ul>
      </section>

      <section id="contacto" className="contacto">
        <h3>Contacto</h3>
        <p>Para más información, contacta con tu responsable de Higiene y Seguridad.</p>
      </section>

      <footer className="footer">
        <p>© 2025 CONTROL DE EPP+. Todos los derechos reservados.</p>
      </footer>

      {/* Modal solo se abre desde Navbar */}
      <LoginModal
        show={showLogin}
        onClose={() => setShowLogin(false)}
        onLoginSuccess={onLoginSuccess}
      />
    </div>
  );
};

export default Landing;
