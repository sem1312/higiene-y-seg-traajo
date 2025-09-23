import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "./Navbar";

function EditarEpps() {
  const { id } = useParams();
  const trabajadorId = parseInt(id, 10);

  const [epps, setEpps] = useState([]);
  const [trabajadorEpps, setTrabajadorEpps] = useState({});
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
          const assigned = {};
          t.epps_asignados.forEach(e => {
            assigned[e.id] = {
              cantidad: e.cantidad || 1,
              fecha_entrega: e.fecha_entrega || new Date().toISOString().split("T")[0],
              fecha_vencimiento: e.fecha_vencimiento || ""
            };
          });
          setTrabajadorEpps(assigned);
        }
      })
      .catch(err => console.error("Error obteniendo trabajador:", err));
  }, [trabajadorId]);

  const handleToggleEpp = (epp) => {
    setTrabajadorEpps(prev => {
      if (prev[epp.id]) {
        const copy = { ...prev };
        delete copy[epp.id];
        return copy;
      } else {
        return {
          ...prev,
          [epp.id]: {
            cantidad: 1,
            fecha_entrega: new Date().toISOString().split("T")[0],
            fecha_vencimiento: calcularVencimiento(new Date(), epp)
          }
        };
      }
    });
  };

  const handleChange = (eppId, field, value) => {
    setTrabajadorEpps(prev => {
      const copy = { ...prev };
      copy[eppId] = { ...copy[eppId], [field]: value };
      if (field === "fecha_entrega") {
        // recalcular fecha de vencimiento
        const epp = epps.find(e => e.id === eppId);
        copy[eppId].fecha_vencimiento = calcularVencimiento(new Date(value), epp);
      }
      return copy;
    });
  };

  const calcularVencimiento = (fechaEntrega, epp) => {
    if (!epp) return "";
    if (epp.fecha_caducidad_fabricante) {
      return epp.fecha_caducidad_fabricante;
    }
    if (epp.vida_util_meses && epp.fecha_fabricacion) {
      const fabricacion = new Date(epp.fecha_fabricacion);
      const fechaCalculada = new Date(fechaEntrega);
      const vidaUtilRestante = Math.max(epp.vida_util_meses - diffMeses(fabricacion, fechaEntrega), 0);
      fechaCalculada.setMonth(fechaCalculada.getMonth() + vidaUtilRestante);
      return fechaCalculada.toISOString().split("T")[0];
    }
    return "";
  };

  const diffMeses = (d1, d2) => {
    const dt2 = new Date(d2);
    return (
      (dt2.getFullYear() - d1.getFullYear()) * 12 + (dt2.getMonth() - d1.getMonth())
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const payload = Object.entries(trabajadorEpps).map(([eppId, data]) => ({
        epp_id: parseInt(eppId),
        cantidad: data.cantidad,
        fecha_entrega: data.fecha_entrega,
        fecha_vencimiento: data.fecha_vencimiento
      }));

      const res = await fetch("http://localhost:5000/api/actualizar_epps_trabajador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trabajador_id: trabajadorId,
          asignaciones: payload
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

        <h2>Asignar/Editar EPPs del trabajador</h2>

        {epps.length === 0 && <p>No hay EPPs disponibles</p>}

        {epps.map(e => {
          const assigned = trabajadorEpps[e.id];
          const stockDisponible = e.stock - (assigned ? assigned.cantidad : 0);
          const vencido = e.fecha_caducidad_real && new Date(e.fecha_caducidad_real) < new Date();

          return (
            <div key={e.id} style={{ marginBottom: "15px", borderBottom: "1px solid #ccc", paddingBottom: "8px" }}>
              <label style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={!!assigned}
                  onChange={() => handleToggleEpp(e)}
                  style={{ marginRight: "8px" }}
                  disabled={vencido || e.stock <= 0}
                />
                {e.nombre} ({e.tipo}) - Stock: {e.stock} - Vencimiento: {e.fecha_caducidad_fabricante || e.fecha_caducidad_real || "N/A"} {vencido && "❌ Vencido"}
              </label>

              {assigned && (
                <div style={{ marginTop: "4px", display: "flex", gap: "10px", alignItems: "center" }}>
                  <label>
                    Cantidad:
                    <input
                      type="number"
                      min={1}
                      max={e.stock}
                      value={assigned.cantidad}
                      onChange={ev => handleChange(e.id, "cantidad", parseInt(ev.target.value))}
                      style={{ width: "60px", marginLeft: "4px" }}
                    />
                  </label>

                  <label>
                    Fecha entrega:
                    <input
                      type="date"
                      value={assigned.fecha_entrega}
                      onChange={ev => handleChange(e.id, "fecha_entrega", ev.target.value)}
                      style={{ marginLeft: "4px" }}
                    />
                  </label>

                  <label>
                    Fecha vencimiento:
                    <input
                      type="date"
                      value={assigned.fecha_vencimiento}
                      readOnly
                      style={{ marginLeft: "4px", backgroundColor: "#eee" }}
                    />
                  </label>
                </div>
              )}
            </div>
          );
        })}

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
