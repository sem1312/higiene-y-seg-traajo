import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import AddEppModal from "./AddEppModal";

function Epp() {
  const [epps, setEpps] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const compania_id = localStorage.getItem("compania_id");

  useEffect(() => {
    if (!compania_id) return;

    fetch(`http://localhost:5000/api/epps?compania_id=${compania_id}`)
      .then(res => res.json())
      .then(data => setEpps(data))
      .catch(err => console.error(err));
  }, [compania_id]);

  // Agrupar EPPs por tipo
  const categorias = epps.reduce((acc, epp) => {
    if (!acc[epp.tipo]) acc[epp.tipo] = [];
    acc[epp.tipo].push(epp);
    return acc;
  }, {});

  return (
    <div>
      {/* ✅ Navbar incluida */}
      <Navbar />

      <div style={{ padding: "20px" }}>
        <h1>Elementos de Protección Personal</h1>

        {/* Botón para agregar */}
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            margin: "10px 0",
            padding: "10px 20px",
            background: "#1890ff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          + Agregar EPP
        </button>

        {/* Render categorías */}
        {Object.keys(categorias).map(cat => (
          <div key={cat} style={{ marginBottom: "30px" }}>
            <h2>{cat}</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
              {categorias[cat].map(epp => (
                <div
                  key={epp.id}
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    padding: "15px",
                    width: "220px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    background: "#fff",
                    textAlign: "center"
                  }}
                >
                  {epp.imagen_url && (
                    <img
                      src={`http://localhost:5000/${epp.imagen_url}`}
                      alt={epp.nombre}
                      style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "6px" }}
                    />
                  )}
                  <h3>{epp.nombre}</h3>
                  <p><strong>Compra:</strong> {new Date(epp.fecha_de_compra).toLocaleDateString()}</p>
                  <p><strong>Vence:</strong> {new Date(epp.fecha_de_venc).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal para agregar EPP */}
      <AddEppModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        compania_id={compania_id}
        onAdded={(nuevo) => setEpps(prev => [...prev, nuevo])}
      />
    </div>
  );
}

export default Epp;
