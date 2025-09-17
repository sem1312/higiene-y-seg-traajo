import React from "react";
import "../styles/LoginModal.css"; // Reutiliza los estilos del login

const ConfirmModal = ({ show, onClose, onConfirm, message }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={onClose}>✖</button>
        <h2>Confirmar acción</h2>
        <p>{message}</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
          <button
            onClick={onClose}
            style={{ padding: "8px 12px", borderRadius: "4px", border: "1px solid #ccc", background: "#fff", cursor: "pointer", color: "black" }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{ padding: "8px 12px", borderRadius: "4px", border: "none", background: "#ff4d4f", color: "#fff", cursor: "pointer" }}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
