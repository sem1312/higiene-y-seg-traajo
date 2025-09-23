import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import AddEppModal from "./AddEppModal";

function DashboardEpp() {
  const [epps, setEpps] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editEpp, setEditEpp] = useState(null);

  const compania_id = localStorage.getItem("compania_id");

  useEffect(() => {
    if (!compania_id) return;

    fetch(`http://localhost:5000/api/epps?compania_id=${compania_id}`)
      .then(res => res.json())
      .then(data => setEpps(data))
      .catch(err => console.error(err));
  }, [compania_id]);

  const categorias = epps.reduce((acc, epp) => {
    if (!acc[epp.tipo]) acc[epp.tipo] = [];
    acc[epp.tipo].push(epp);
    return acc;
  }, {});

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro querés eliminar este EPP?")) return;
    try {
      await fetch(`http://localhost:5000/api/epp/${id}`, { method: "DELETE" });
      setEpps(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <h1>Elementos de Protección Personal</h1>

        <button
          onClick={() => { setEditEpp(null); setShowAddModal(true); }}
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

        {Object.keys(categorias).length === 0 && <p>No hay EPP registrados.</p>}

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
                    width: "250px",
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
                  <p><strong>Marca:</strong> {epp.marca || "N/A"}</p>
                  <p><strong>Certificación:</strong> {epp.posee_certificacion ? "✅" : "❌"}</p>
                  <p><strong>Stock:</strong> {epp.stock}</p>
                  <p><strong>Vida útil:</strong> {epp.vida_util_meses} meses</p>

                  <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "10px" }}>
                    <button onClick={() => { setEditEpp(epp); setShowAddModal(true); }}>Editar</button>
                    <button onClick={() => handleDelete(epp.id)}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <AddEppModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        compania_id={compania_id}
        epp={editEpp}
        onAdded={(nuevo) => {
          setEpps(prev => {
            const exists = prev.find(e => e.id === nuevo.id);
            if (exists) {
              return prev.map(e => e.id === nuevo.id ? nuevo : e);
            } else {
              return [...prev, nuevo];
            }
          });
        }}
      />
    </div>
  );
}

export default DashboardEpp;
