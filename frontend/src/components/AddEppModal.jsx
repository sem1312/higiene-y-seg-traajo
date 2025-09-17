import React, { useState } from "react";

function AddEppModal({ show, onClose, compania_id, onAdded }) {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("Casco");
  const [fechaCompra, setFechaCompra] = useState("");
  const [stock, setStock] = useState(1);
  const [imagen, setImagen] = useState(null);
  const [error, setError] = useState("");

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!nombre || !tipo || !fechaCompra || stock < 1) {
      return setError("Por favor completa todos los campos obligatorios correctamente");
    }

    try {
      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("tipo", tipo);
      formData.append("compania_id", Number(compania_id)); // 🔹 convertir a número
      formData.append("fecha_compra", fechaCompra);
      formData.append("stock", Number(stock)); // 🔹 convertir a número
      if (imagen) formData.append("imagen", imagen);

      const res = await fetch("http://localhost:5000/api/epp", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        onAdded(data);
        onClose();
        setNombre("");
        setTipo("Casco");
        setFechaCompra("");
        setStock(1);
        setImagen(null);
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
        padding: "25px",
        width: "420px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        display: "flex",
        flexDirection: "column",
        gap: "15px"
      }}>
        <h2 style={{ textAlign: "center", marginBottom: "10px" }}>Agregar EPP</h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <label>Categoria:</label>
          <select value={tipo} onChange={e => setTipo(e.target.value)} required>
            <option value="Casco">Casco</option>
            <option value="Guantes">Guantes</option>
            <option value="Lentes">Lentes</option>
            <option value="Protección Auditiva">Protección Auditiva</option>
            <option value="Respiradores">Respiradores</option>
            <option value="Ropa de Seguridad">Ropa de Seguridad</option>
            <option value="Arnés">Arnés</option>
            <option value="Calzado de Seguridad">Calzado de Seguridad</option>
          </select>

          <label>Nombre del EPP:</label>
          <input type="text" placeholder="Ej: Casco Industrial" value={nombre} onChange={e => setNombre(e.target.value)} required />

          <label>Fecha de Compra:</label>
          <input type="date" value={fechaCompra} onChange={e => setFechaCompra(e.target.value)} required />

          <label>Stock:</label>
          <input type="number" min={1} value={stock} onChange={e => setStock(e.target.value)} required />

          <label>Imagen (opcional):</label>
          <input type="file" accept="image/*" onChange={e => setImagen(e.target.files[0])} />

          {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit">Agregar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEppModal;
