import React, { useState } from "react";

function AddEppModal({ show, onClose, compania_id, onAdded }) {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("Casco");
  const [fechaCompra, setFechaCompra] = useState("");
  const [fechaVenc, setFechaVenc] = useState("");
  const [error, setError] = useState("");

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validación mínima de fechas
    if (fechaCompra && fechaVenc && new Date(fechaVenc) < new Date(fechaCompra)) {
      return setError("La fecha de vencimiento no puede ser anterior a la fecha de compra");
    }

    try {
      const body = {
        nombre,
        tipo,
        compania_id,
        fecha_compra: fechaCompra,
        fecha_vencimiento: fechaVenc,
      };

      const res = await fetch("http://localhost:5000/api/epp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        onAdded(data); // devuelve info del EPP creado
        onClose();
        setNombre("");
        setTipo("Casco");
        setFechaCompra("");
        setFechaVenc("");
      } else {
        setError(data.message || "Error al agregar el EPP");
      }
    } catch (err) {
      console.error(err);
      setError("Error en la conexión con el servidor");
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex", justifyContent: "center", alignItems: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "8px",
        padding: "20px",
        width: "400px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
      }}>
        <h2>Agregar EPP</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            type="text"
            placeholder="Nombre del EPP"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
          />

          <select value={tipo} onChange={e => setTipo(e.target.value)}>
            <option value="Casco">Casco</option>
            <option value="Guantes">Guantes</option>
            <option value="Lentes">Lentes</option>
            <option value="Protección Auditiva">Protección Auditiva</option>
            <option value="Respiradores">Respiradores</option>
            <option value="Ropa de Seguridad">Ropa de Seguridad</option>
            <option value="Arnés">Arnés</option>
            <option value="Calzado de Seguridad">Calzado de Seguridad</option>
          </select>

          <label>Fecha de Compra:</label>
          <input
            type="date"
            value={fechaCompra}
            onChange={e => setFechaCompra(e.target.value)}
            required
          />

          <label>Fecha de Vencimiento:</label>
          <input
            type="date"
            value={fechaVenc}
            onChange={e => setFechaVenc(e.target.value)}
            required
          />

          {error && <p style={{ color: "red" }}>{error}</p>}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit" style={{ background: "#4CAF50", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "4px" }}>
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEppModal;
