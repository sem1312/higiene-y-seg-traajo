import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../assets/logo.png";
import LoginModal from "./LoginModal";

const Navbar = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo">
          <Link to="/">
            <img src={logo} alt="Logo EPP" className="logo-img" />
          </Link>
        </div>

        <ul className="navbar-links">
          <li><a href="#hero">Inicio</a></li>
          <li><a href="#sobre">Sobre la app</a></li>
          <li><a href="#beneficios">Beneficios</a></li>
          <li><a href="#contacto">Contacto</a></li>
          <li>
            <button className="navbar-login" onClick={() => setShowLogin(true)}>
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
