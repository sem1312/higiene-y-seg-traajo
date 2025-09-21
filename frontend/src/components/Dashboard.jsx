import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import AddWorkerModal from "./AddTrabajadorModal"; // nuevo modal

function Dashboard() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // <-- estado de búsqueda

  const jefe_id = localStorage.getItem("jefe_id");
  const compania_id = localStorage.getItem("compania_id");

  useEffect(() => {
    if (!jefe_id) return;

    fetch(`http://localhost:5000/api/trabajadores?jefe_id=${jefe_id}`)
      .then(res => res.json())
      .then(data => setTrabajadores(data))
      .catch(err => console.error(err));
  }, [jefe_id]);

  const handleChange = (id, field, value) => {
    fetch(`http://localhost:5000/api/trabajadores/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    })
      .then(res => res.json())
      .then(() => {
        setTrabajadores(prev =>
          prev.map(t => (t.id === id ? { ...t, [field]: value } : t))
        );
      })
      .catch(err => console.error(err));
  };

  const handleDelete = (id) => {
    if (!window.confirm("¿Desea eliminar este trabajador?")) return;

    fetch(`http://localhost:5000/api/trabajadores/${id}`, { method: "DELETE" })
      .then(res => res.json())
      .then(data => {
        if (data.success) setTrabajadores(prev => prev.filter(t => t.id !== id));
      })
      .catch(err => console.error(err));
  };

  // Filtrado en tiempo real
  const filteredTrabajadores = trabajadores.filter(t =>
    t.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Navbar />
      <div style={{ padding: "20px" }}>
        <h1>Trabajadores</h1>

        {/* Barra de búsqueda */}
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
              width: "200px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              position: "relative"
            }}>
              <h3>{t.nombre}</h3>
              {["casco", "guantes", "lentes", "botas", "zapatos_seg"].map(epp => (
                <div key={epp}>
                  <label>
                    <input
                      type="checkbox"
                      checked={t[epp]}
                      onChange={e => handleChange(t.id, epp, e.target.checked)}
                    /> {epp.charAt(0).toUpperCase() + epp.slice(1)}
                  </label>
                </div>
              ))}

              <button onClick={() => handleDelete(t.id)} style={{
                position: "absolute",
                top: "5px",
                right: "5px",
                background: "#ff4d4f",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                padding: "2px 6px"
              }}>X</button>
            </div>
          ))}

          {/* Botón para agregar trabajador */}
          <div onClick={() => setShowAddModal(true)} style={{
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
          }}>+</div>
        </div>
      </div>

      {/* Modal para agregar trabajador */}
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
