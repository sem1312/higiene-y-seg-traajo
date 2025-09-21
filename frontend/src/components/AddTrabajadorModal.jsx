import React, { useState } from "react";
import "../styles/LoginModal.css"; // reutiliza estilos

const AddTrabajadorModal = ({ show, onClose, jefe_id, compania_id, onAdded }) => {
  const [nombre, setNombre] = useState("");
  
  const [asignarBotas, setAsignarBotas] = useState(false);
  const [asignarCasco, setAsignarCasco] = useState(false);
  const [asignarGuantes, setAsignarGuantes] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!nombre ) {
      return setError("Debe ingresar nombre ");
    }

    try {
      const response = await fetch("http://localhost:5000/api/trabajadores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
         
          jefe_id,
          compania_id,
          epp: {
            botas: asignarBotas,
            casco: asignarCasco,
            guantes: asignarGuantes,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        onAdded(data.trabajador);
        onClose();
      } else {
        setError(data.message || "Error al crear trabajador");
      }
    } catch (err) {
      console.error(err);
      setError("Error al conectar con el servidor");
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={onClose}>✖</button>
        <h2>Agregar Trabajador</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre del trabajador"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />

          <div className="epp-options">
            <label>
              <input
                type="checkbox"
                checked={asignarBotas}
                onChange={() => setAsignarBotas(!asignarBotas)}
              />
              Botas
            </label>
            <label>
              <input
                type="checkbox"
                checked={asignarCasco}
                onChange={() => setAsignarCasco(!asignarCasco)}
              />
              Casco
            </label>
            <label>
              <input
                type="checkbox"
                checked={asignarGuantes}
                onChange={() => setAsignarGuantes(!asignarGuantes)}
              />
              Guantes
            </label>
          </div>

          <button type="submit">Agregar</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default AddTrabajadorModal;
