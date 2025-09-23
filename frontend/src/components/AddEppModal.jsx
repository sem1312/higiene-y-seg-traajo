import React, { useState, useEffect } from "react";

function AddEppModal({ show, onClose, compania_id, onAdded, epp }) {
  const [categoria, setCategoria] = useState("Casco");
  const [nombre, setNombre] = useState("");
  const [marca, setMarca] = useState("");
  const [poseeCertificacion, setPoseeCertificacion] = useState(false);
  const [fechaFabricacion, setFechaFabricacion] = useState("");
  const [fechaCompra, setFechaCompra] = useState("");
  const [vidaUtil, setVidaUtil] = useState("");
  const [fechaCaducidadFabricante, setFechaCaducidadFabricante] = useState("");
  const [stock, setStock] = useState(1);
  const [imagen, setImagen] = useState(null);
  const [error, setError] = useState("");

  const sugerenciasVidaUtil = {
    Casco: 60,
    Lentes: 24,
    Guantes: 12,
    Arnés: 60,
    "Calzado de Seguridad": 36,
    "Ropa de Seguridad": 24,
    "Protección Auditiva": 24,
    Respiradores: 24,
  };

  // 🔹 Cargar datos si es edición
  useEffect(() => {
    if (epp) {
      setCategoria(epp.tipo || "Casco");
      setNombre(epp.nombre || "");
      setMarca(epp.marca || "");
      setPoseeCertificacion(epp.posee_certificacion || false);
      setFechaFabricacion(epp.fecha_fabricacion || "");
      setFechaCompra(epp.fecha_compra || "");
      setVidaUtil(epp.vida_util_meses || sugerenciasVidaUtil[epp.tipo] || 12);
      setFechaCaducidadFabricante(epp.fecha_caducidad_fabricante || "");
      setStock(epp.stock || 1);
      setImagen(null);
    } else {
      // Reset para nuevo
      setCategoria("Casco");
      setNombre("");
      setMarca("");
      setPoseeCertificacion(false);
      setFechaFabricacion("");
      setFechaCompra("");
      setVidaUtil(12);
      setFechaCaducidadFabricante("");
      setStock(1);
      setImagen(null);
    }
  }, [epp, show]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!categoria || !nombre || !marca || !fechaFabricacion || stock < 1) {
      return setError("Completa todos los campos obligatorios correctamente");
    }

    try {
      const formData = new FormData();
      formData.append("tipo", categoria);
      formData.append("nombre", nombre);
      formData.append("marca", marca);
      formData.append("posee_certificacion", poseeCertificacion);
      formData.append("fecha_fabricacion", fechaFabricacion);
      formData.append("fecha_compra", fechaCompra || null);
      formData.append("vida_util_meses", Number(vidaUtil));
      formData.append("fecha_caducidad_fabricante", fechaCaducidadFabricante || null);
      formData.append("stock", Number(stock));
      formData.append("compania_id", Number(compania_id));
      if (imagen) formData.append("imagen", imagen);

      let url = "http://localhost:5000/api/epp";
      let method = "POST";

      if (epp && epp.id) {
        url = `http://localhost:5000/api/epp/${epp.id}`;
        method = "PUT";
      }

      const res = await fetch(url, { method, body: formData });
      const data = await res.json();

      if (data.success) {
        onAdded(data);
        onClose();
      } else {
        setError(data.message || "Error al guardar EPP");
      }
    } catch (err) {
      console.error(err);
      setError("Error en la conexión con el servidor");
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
      justifyContent: "center", alignItems: "center", zIndex: 1000
    }}>
      <div style={{
        background: "#fff", borderRadius: "8px", padding: "25px",
        width: "480px", boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        display: "flex", flexDirection: "column", gap: "15px"
      }}>
        <h2 style={{ textAlign: "center" }}>{epp ? "Editar EPP" : "Agregar EPP"}</h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <label>Categoría:</label>
          <select value={categoria} onChange={e => setCategoria(e.target.value)} required>
            {Object.keys(sugerenciasVidaUtil).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <label>Nombre:</label>
          <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required />

          <label>Marca:</label>
          <input type="text" value={marca} onChange={e => setMarca(e.target.value)} required />

          <label>
            <input type="checkbox" checked={poseeCertificacion} onChange={e => setPoseeCertificacion(e.target.checked)} /> Posee certificación
          </label>

          <label>Fecha Fabricación:</label>
          <input type="date" value={fechaFabricacion} onChange={e => setFechaFabricacion(e.target.value)} required />

          <label>Fecha Compra (opcional):</label>
          <input type="date" value={fechaCompra} onChange={e => setFechaCompra(e.target.value)} />

          <label>Vida útil (meses):</label>
          <input type="number" min={1} value={vidaUtil} onChange={e => setVidaUtil(e.target.value)} required />

          <label>Fecha caducidad fabricante (opcional):</label>
          <input type="date" value={fechaCaducidadFabricante} onChange={e => setFechaCaducidadFabricante(e.target.value)} />

          <label>Stock:</label>
          <input type="number" min={1} value={stock} onChange={e => setStock(e.target.value)} required />

          <label>Imagen (opcional):</label>
          <input type="file" accept="image/*" onChange={e => setImagen(e.target.files[0])} />

          {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit">{epp ? "Guardar cambios" : "Agregar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEppModal;
