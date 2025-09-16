import React from "react";
import "../styles/LoginModal.css"; // ✅ usamos los mismos estilos

const LogoutModal = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={onClose}>✖</button>
        <h2>Sesión cerrada</h2>
        <p>Te has deslogueado correctamente.</p>
      </div>
    </div>
  );
};

export default LogoutModal;
