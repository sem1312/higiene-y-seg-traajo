import { useState, useEffect } from "react";

function Modal({ show, onClose, image }) {
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true); // Monta el modal
      setTimeout(() => setAnimateIn(true), 10); // Inicia animación de entrada
    } else if (visible) {
      setAnimateIn(false); // Inicia animación de salida
      const timer = setTimeout(() => setVisible(false), 300); // Desmonta después de animación
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!visible) return null;

  return (
    <div
      style={{
        ...overlayStyle,
        opacity: animateIn ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          ...modalStyle,
          transform: animateIn ? "scale(1)" : "scale(0.8)",
          opacity: animateIn ? 1 : 0,
          transition: "transform 0.3s ease, opacity 0.3s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button style={closeBtnStyle} onClick={onClose}>
          X
        </button>
        <img src={image} alt="Pop-up" style={{ maxWidth: "100%", borderRadius: "8px" }} />
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "10px",
  maxWidth: "400px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
  position: "relative",
};

const closeBtnStyle = {
  position: "absolute",
  top: "10px",
  right: "10px",
  border: "none",
  background: "red",
  color: "white",
  borderRadius: "50%",
  width: "30px",
  height: "30px",
  cursor: "pointer",
};

export default Modal;
