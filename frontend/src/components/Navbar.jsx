import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom"; // import useLocation
import "../styles/Navbar.css";
import logo from "../assets/logo.png";
import LoginModal from "./LoginModal";

const Navbar = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [isLogged, setIsLogged] = useState(false);

  const location = useLocation(); // obtener la ruta actual

  // Chequear estado de login al montar y cuando cambie localStorage
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

  // Si estamos en /dashboard, mostramos solo un botón al Landing con el mismo estilo
  if (location.pathname === "/dashboard") {
    return (
      <nav className="navbar">
        <div className="navbar-logo">
          <Link to="/">
            <img src={logo} alt="Logo EPP" className="logo-img" />
          </Link>
        </div>

        <ul className="navbar-links" style={{ paddingRight: "50px" }}>
          <li>
            <Link to="/" className="navbar-login">
              Volver al Landing
            </Link>
          </li>
        </ul>
      </nav>
    );
  }

  // Navbar normal para otras rutas
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

          {/* Solo mostramos si NO está logeado */}
          {!isLogged && (
            <li>
              <button
                className="navbar-login"
                onClick={() => setShowLogin(true)}
              >
                Iniciar sesión
              </button>
            </li>
          )}
        </ul>
      </nav>

      <LoginModal
        show={showLogin}
        onClose={() => setShowLogin(false)}
        onLoginSuccess={() => setIsLogged(true)}
      />
    </>
  );
};

export default Navbar;
