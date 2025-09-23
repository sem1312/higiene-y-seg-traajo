import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "./Navbar";

function EditarEpps() {
  const { id } = useParams();
  const trabajadorId = parseInt(id, 10);

  const [epps, setEpps] = useState([]);
  const [trabajadorEpps, setTrabajadorEpps] = useState([]);
  const [fechasVencimiento, setFechasVencimiento] = useState({});
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const companiaId = localStorage.getItem("compania_id");
    const jefeId = localStorage.getItem("jefe_id");

    // Traer todos los EPPs de la compañía
    fetch(`http://localhost:5000/api/epps?compania_id=${companiaId}`)
      .then(res => res.json())
      .then(data => setEpps(data))
      .catch(err => console.error("Error obteniendo EPPs:", err));

    // Traer EPPs asignados al trabajador
    fetch(`http://localhost:5000/api/trabajadores?jefe_id=${jefeId}`)
      .then(res => res.json())
      .then(data => {
        const t = data.find(t => t.id === trabajadorId);
        if (t && t.epps_asignados) {
          setTrabajadorEpps(t.epps_asignados.map(e => e.id));
          const fechas = {};
          t.epps_asignados.forEach(e => {
            fechas[e.id] = e.fecha_vencimiento || "";
          });
          setFechasVencimiento(fechas);
        }
      })
      .catch(err => console.error("Error obteniendo trabajador:", err));
  }, [trabajadorId]);

  const toggleEpp = (eppId) => {
    setTrabajadorEpps(prev =>
      prev.includes(eppId)
        ? prev.filter(id => id !== eppId)
        : [...prev, eppId]
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/actualizar_epps_trabajador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trabajador_id: trabajadorId,
          epp_ids: trabajadorEpps,
          fechas_vencimiento: fechasVencimiento
        }),
      });

      if (!res.ok) throw new Error("Respuesta del servidor no OK");
      const data = await res.json();

      if (data.success) {
        alert("✅ EPPs actualizados correctamente");
      } else {
        alert(data.message || "⚠️ Error al actualizar EPPs");
      }
    } catch (err) {
      console.error("Error en la actualización:", err);
      alert("❌ Error en la conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ padding: "20px", marginTop: "60px" }}>
        <Link
          to="/dashboard"
          style={{
            display: "inline-block",
            marginBottom: "20px",
            padding: "8px 12px",
            backgroundColor: "#1890ff",
            color: "#fff",
            borderRadius: "4px",
            textDecoration: "none"
          }}
        >
          ← Volver al Dashboard
        </Link>

        <h2>Editar EPPs del trabajador</h2>

        {epps.length === 0 && <p>No hay EPPs disponibles</p>}

        {epps.map(e => (
          <div key={e.id} style={{ marginBottom: "10px" }}>
            <label style={{ cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={trabajadorEpps.includes(e.id)}
                onChange={() => toggleEpp(e.id)}
                style={{ marginRight: "8px" }}
              />
              {e.nombre} ({e.tipo})
            </label>

            {/* Input de fecha de vencimiento si está seleccionado */}
            {trabajadorEpps.includes(e.id) && (
              <div style={{ marginTop: "4px" }}>
                <label>
                  Fecha de vencimiento:{" "}
                  <input
                    type="date"
                    value={fechasVencimiento[e.id] || ""}
                    onChange={(ev) =>
                      setFechasVencimiento(prev => ({ ...prev, [e.id]: ev.target.value }))
                    }
                  />
                </label>
              </div>
            )}
          </div>
        ))}

        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            marginTop: "20px",
            padding: "8px 16px",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </>
  );
}

export default EditarEpps;
