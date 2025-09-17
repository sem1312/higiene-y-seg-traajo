import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import AddWorkerModal from "./AddTrabajadorModal";

function Dashboard() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const jefe_id = localStorage.getItem("jefe_id");
  const compania_id = localStorage.getItem("compania_id");

  useEffect(() => {
    if (!jefe_id) return;
    fetch(`http://localhost:5000/api/trabajadores?jefe_id=${jefe_id}`)
      .then(res => res.json())
      .then(data => setTrabajadores(data))
      .catch(err => console.error(err));
  }, [jefe_id]);

  const handleDelete = (id) => {
    if (!window.confirm("¿Desea eliminar este trabajador?")) return;
    fetch(`http://localhost:5000/api/trabajadores/${id}`, { method: "DELETE" })
      .then(res => res.json())
      .then(data => {
        if (data.success) setTrabajadores(prev => prev.filter(t => t.id !== id));
      })
      .catch(err => console.error(err));
  };

  const filteredTrabajadores = trabajadores.filter(t =>
    (t.nombre + " " + t.apellido).toLowerCase().includes(searchTerm.toLowerCase())
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
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            padding: "8px 12px",
            marginBottom: "20px",
            width: "100%",
            maxWidth: "400px",
            fontSize: "16px",
            borderRadius: "4px",
            border: "1px solid #ccc"
          }}
        />

        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
          {filteredTrabajadores.map(t => (
            <div key={t.id} style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "15px",
              width: "240px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}>
              <h3>{t.nombre} {t.apellido}</h3>
              <p><strong>DNI:</strong> {t.dni}</p>
              <p><strong>Tel:</strong> {t.telefono}</p>
              <p><strong>Email:</strong> {t.email}</p>
              <p><strong>Dirección:</strong> {t.direccion}</p>

              <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
                <Link
                  to={`/editar-epps/${t.id}`}
                  style={{
                    background: "#1890ff",
                    color: "#fff",
                    borderRadius: "4px",
                    cursor: "pointer",
                    padding: "4px 8px",
                    flex: 1,
                    textAlign: "center",
                    textDecoration: "none"
                  }}
                >
                  Editar EPPs
                </Link>

                <button
                  onClick={() => handleDelete(t.id)}
                  style={{
                    background: "#ff4d4f",
                    color: "#fff",
                    borderRadius: "4px",
                    cursor: "pointer",
                    padding: "4px 8px",
                    flex: 0.5
                  }}
                >
                  X
                </button>
              </div>
            </div>
          ))}

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
              cursor: "pointer"
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
        onAdded={(nuevo) => setTrabajadores(prev => [...prev, nuevo])}
      />
    </div>
  );
}

export default Dashboard;
