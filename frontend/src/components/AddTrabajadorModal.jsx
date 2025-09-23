import React, { useState } from "react";
import "../styles/LoginModal.css";

const AddTrabajadorModal = ({
  show,
  onClose,
  jefe_id,
  compania_id,
  onAdded,
}) => {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    direccion: "",
    dni: "",
    email: "",
    puesto: "",
    fecha_ingreso: "",
    legajo: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.nombre || !form.apellido || !form.dni) {
      return setError("Nombre, apellido y DNI son obligatorios");
    }

    try {
      const response = await fetch("http://localhost:5000/api/trabajadores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          jefe_id,
          compania_id,
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
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
        <h2>Agregar Trabajador</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="nombre"
            placeholder="Nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />
          <input
            name="apellido"
            placeholder="Apellido"
            value={form.apellido}
            onChange={handleChange}
            required
          />
          <input
            name="dni"
            placeholder="DNI"
            value={form.dni}
            onChange={handleChange}
            required
          />
          <input
            name="telefono"
            placeholder="Teléfono"
            value={form.telefono}
            onChange={handleChange}
          />
          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
          <input
            name="direccion"
            placeholder="Dirección"
            value={form.direccion}
            onChange={handleChange}
          />
          <input
            name="legajo"
            placeholder="Legajo"
            value={form.legajo}
            onChange={handleChange}
          />

          <button type="submit">Agregar</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default AddTrabajadorModal;
