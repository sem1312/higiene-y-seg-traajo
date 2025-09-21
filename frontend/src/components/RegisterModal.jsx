import React, { useState, useEffect } from "react";
import "../styles/LoginModal.css"; // usamos el mismo estilo que login

const RegisterModal = ({ show, onClose }) => {
  const [nombre, setNombre] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [companiaId, setCompaniaId] = useState("");
  const [companias, setCompanias] = useState([]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Cargar compañías al abrir el modal
  useEffect(() => {
    if (show) {
      fetch("http://localhost:5000/api/companias") // nueva ruta para traer compañías
        .then(res => res.json())
        .then(data => setCompanias(data))
        .catch(err => console.error("Error al cargar compañías", err));
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!companiaId) return setError("Debes seleccionar una compañía");

    try {
      const res = await fetch("http://localhost:5000/api/registrar_jefe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, contrasena, compania_id: companiaId }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg(data.message);
        setNombre("");
        setContrasena("");
        setCompaniaId("");
      } else {
        setError(data.message || "Error al registrar jefe");
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
        <h2>Registrar Jefe</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Usuario"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
          <select
            value={companiaId}
            onChange={(e) => setCompaniaId(e.target.value)}
            required
          >
            <option value="">-- Selecciona una compañía --</option>
            {companias.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          <button type="submit">Registrar</button>
        </form>
        {error && <p className="error">{error}</p>}
        {successMsg && <p className="success">{successMsg}</p>}
      </div>
    </div>
  );
};

export default RegisterModal;
