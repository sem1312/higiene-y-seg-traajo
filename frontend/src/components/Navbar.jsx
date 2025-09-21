import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../assets/logo.png";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";

const Navbar = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => setIsLogged(localStorage.getItem("auth") === "true");
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleScroll = (e, id) => {
    e.preventDefault();
    const section = document.getElementById(id);
    if (section) {
      const offset = section.offsetTop - 80;
      window.scrollTo({ top: offset, behavior: "smooth" });
    }
  };

  // ✅ Ajuste aquí: incluimos /dashboardepp
  if (location.pathname === "/dashboard" || location.pathname === "/dashboardepp") {
    return (
      <nav className="navbar">
        <div className="navbar-logo">
          <Link to="/">
            <img src={logo} alt="Logo EPP" className="logo-img" />
          </Link>
        </div>

        <ul className="navbar-links" style={{ paddingRight: "50px" }}>
          {isLogged && (
            <>
              <li>
                <Link to="/dashboard" className="navbar-login">Dashboard</Link>
              </li>
              <li>
                <Link to="/dashboardepp" className="navbar-login">EPP</Link>
              </li>
              <li>
                <button
                  className="navbar-login"
                  onClick={() => {
                    localStorage.removeItem("auth");
                    localStorage.removeItem("jefe_id");
                    setIsLogged(false);
                  }}
                >
                  Cerrar sesión
                </button>
              </li>
            </>
          )}
          {!isLogged && (
            <li>
              <Link to="/" className="navbar-login">Volver al Landing</Link>
            </li>
          )}
        </ul>
      </nav>
    );
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo">
          <Link to="/">
            <img src={logo} alt="Logo EPP" className="logo-img" />
          </Link>
        </div>

        <ul className="navbar-links" style={{ paddingRight: "50px" }}>
          <li>
            <a href="#hero" onClick={(e) => handleScroll(e, "hero")}>Inicio</a>
          </li>
          <li>
            <a href="#sobre" onClick={(e) => handleScroll(e, "sobre")}>Sobre la app</a>
          </li>
          <li>
            <a href="#beneficios" onClick={(e) => handleScroll(e, "beneficios")}>Beneficios</a>
          </li>
          <li>
            <a href="#contacto" onClick={(e) => handleScroll(e, "contacto")}>Contacto</a>
          </li>

          {!isLogged && (
            <>
              <li>
                <button className="navbar-login" onClick={() => setShowLogin(true)}>
                  Iniciar sesión
                </button>
              </li>
              <li>
                <button className="navbar-login" onClick={() => setShowRegister(true)}>
                  Registrar jefe
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>

      <LoginModal
        show={showLogin}
        onClose={() => setShowLogin(false)}
        onLoginSuccess={() => setIsLogged(true)}
      />
      <RegisterModal
        show={showRegister}
        onClose={() => setShowRegister(false)}
      />
    </>
  );
};

export default Navbar;
