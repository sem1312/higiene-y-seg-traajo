import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import AddWorkerModal from "./AddTrabajadorModal";

function Dashboard() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedIds, setExpandedIds] = useState([]); // IDs de trabajadores expandidos

  const jefe_id = localStorage.getItem("jefe_id");
  const compania_id = localStorage.getItem("compania_id");

  useEffect(() => {
    if (!jefe_id) return;
    fetch(`http://localhost:5000/api/trabajadores?jefe_id=${jefe_id}`)
      .then((res) => res.json())
      .then((data) => setTrabajadores(data))
      .catch((err) => console.error(err));
  }, [jefe_id]);

  const handleDelete = (id) => {
    if (!window.confirm("¿Desea eliminar este trabajador?")) return;
    fetch(`http://localhost:5000/api/trabajadores/${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success)
          setTrabajadores((prev) => prev.filter((t) => t.id !== id));
      })
      .catch((err) => console.error(err));
  };

  const toggleExpand = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
    );
  };

  const filteredTrabajadores = trabajadores.filter((t) =>
    ((t?.nombre ?? "") + " " + (t?.apellido ?? ""))
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Navbar />
      <div style={{ padding: "20px" }}>
        <h1>Trabajadores</h1>

        <input
          type="text"
          placeholder="Buscar trabajador..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "8px 12px",
            marginBottom: "20px",
            width: "100%",
            maxWidth: "400px",
            fontSize: "16px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />

        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
          {filteredTrabajadores.map((t) => {
            const isExpanded = expandedIds.includes(t.id);
            return (
              <div
                key={t.id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "15px",
                  width: "240px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  transition: "all 0.3s",
                }}
              >
                {/* Nombre y flecha */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h3>
                    {t?.nombre ?? "Sin nombre"} {t?.apellido ?? ""}
                  </h3>
                  <button
                    onClick={() => toggleExpand(t.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "18px",
                    }}
                  >
                    {isExpanded ? "▲" : "▼"}
                  </button>
                </div>

                {/* EPPs asignados siempre visibles */}
                {t.epps_asignados && t.epps_asignados.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <strong>EPPs asignados:</strong>
                    {t.epps_asignados.map((e) => (
                      <span key={e.id}>
                        {e.nombre} ({e.tipo})
                        {e.fecha_vencimiento
                          ? ` - Vence: ${e.fecha_vencimiento}`
                          : ""}
                      </span>
                    ))}
                  </div>
                )}

                {/* Información extra solo al expandir */}
                {isExpanded && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <p>
                      <strong>DNI:</strong> {t?.dni ?? "-"}
                    </p>
                    <p>
                      <strong>Tel:</strong> {t?.telefono ?? "-"}
                    </p>
                    <p>
                      <strong>Email:</strong> {t?.email ?? "-"}
                    </p>
                    <p>
                      <strong>Dirección:</strong> {t?.direccion ?? "-"}
                    </p>
                    <p>
                      <strong>Legajo:</strong> {t?.legajo ?? "-"}
                    </p>
                    

                    <Link
                      to={`/editar-epps/${t?.id}`}
                      style={{
                        background: "#1890ff",
                        color: "#fff",
                        borderRadius: "4px",
                        cursor: "pointer",
                        padding: "6px 10px",
                        textAlign: "center",
                        textDecoration: "none",
                        marginTop: "8px",
                      }}
                    >
                      Editar EPPs
                    </Link>
                  </div>
                )}

                <button
                  onClick={() => handleDelete(t?.id)}
                  style={{
                    background: "#ff4d4f",
                    color: "#fff",
                    borderRadius: "4px",
                    cursor: "pointer",
                    padding: "4px 8px",
                    marginTop: "5px",
                  }}
                >
                  Eliminar
                </button>
              </div>
            );
          })}

          {/* Botón para agregar trabajador */}
          <div
            onClick={() => setShowAddModal(true)}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "1px dashed #888",
              borderRadius: "8px",
              width: "200px",
              height: "150px",
              fontSize: "48px",
              color: "#555",
              cursor: "pointer",
            }}
          >
            +
          </div>
        </div>
      </div>

      <AddWorkerModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        jefe_id={jefe_id}
        compania_id={compania_id}
        onAdded={(nuevo) => setTrabajadores((prev) => [...prev, nuevo])}
      />
    </div>
  );
}

export default Dashboard;
