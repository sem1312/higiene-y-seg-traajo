import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";

function Dashboard() {
  const [trabajadores, setTrabajadores] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/trabajadores")
      .then(res => res.json())
      .then(data => setTrabajadores(data))
      .catch(err => console.error(err));
  }, []);

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

  const agregarTrabajador = () => {
    const nombre = prompt("Ingrese el nombre del nuevo trabajador:");
    if (!nombre) return;

    fetch("http://localhost:5000/api/trabajadores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setTrabajadores(prev => [...prev, data.trabajador]);
      })
      .catch(err => console.error(err));
  };

  const eliminarTrabajador = id => {
    const confirmDelete = window.confirm("¿Desea eliminar este trabajador?");
    if (!confirmDelete) return;

    fetch(`http://localhost:5000/api/trabajadores/${id}`, { method: "DELETE" })
      .then(res => res.json())
      .then(data => {
        if (data.success) setTrabajadores(prev => prev.filter(t => t.id !== id));
      })
      .catch(err => console.error(err));
  };

  return (
    <div>
      <Navbar />
      <div style={{ padding: "20px" }}>
        <h1>Trabajadores</h1>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
          {trabajadores.map(t => (
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

              <button onClick={() => eliminarTrabajador(t.id)} style={{
                position: "absolute",
                top: "5px",
                right: "5px",
                background: "#ff4d4f",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                padding: "2px 6px",
              }}>X</button>
            </div>
          ))}

          <div onClick={agregarTrabajador} style={{
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
    </div>
  );
}

export default Dashboard;
