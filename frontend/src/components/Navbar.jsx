import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../assets/logo.png";
import LoginModal from "./LoginModal";

const Navbar = () => {
  const [showLogin, setShowLogin] = useState(false);

  const handleScroll = (e, id) => {
    e.preventDefault();
    const section = document.getElementById(id);
    if (section) {
      const offset = section.offsetTop - 80; // ajusta 80px según altura real de tu navbar
      window.scrollTo({
        top: offset,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo">
          <Link to="/">
            <img src={logo} alt="Logo EPP" className="logo-img" />
          </Link>
        </div>

        <ul className="navbar-links">
          <li>
            <a href="#hero" onClick={(e) => handleScroll(e, "hero")}>
              Inicio
            </a>
          </li>
          <li>
            <a href="#sobre" onClick={(e) => handleScroll(e, "sobre")}>
              Sobre la app
            </a>
          </li>
          <li>
            <a href="#beneficios" onClick={(e) => handleScroll(e, "beneficios")}>
              Beneficios
            </a>
          </li>
          <li>
            <a href="#contacto" onClick={(e) => handleScroll(e, "contacto")}>
              Contacto
            </a>
          </li>
          <li>
            <button
              className="navbar-login"
              onClick={() => setShowLogin(true)}
            >
              Iniciar sesión
            </button>
          </li>
        </ul>
      </nav>

      <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
};

export default Navbar;
