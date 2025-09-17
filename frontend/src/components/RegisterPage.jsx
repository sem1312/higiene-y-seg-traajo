import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const [nombre, setNombre] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [companiaId, setCompaniaId] = useState("");
  const [dni, setDni] = useState("");
  const [direccion, setDireccion] = useState("");
  const [email, setEmail] = useState("");
  const [companias, setCompanias] = useState([]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/companias")
      .then((res) => res.json())
      .then((data) => setCompanias(data))
      .catch((err) => console.error("Error al cargar compañías", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("http://localhost:5000/api/registrar_jefe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          contrasena,
          compania_id: companiaId,
          dni,
          direccion,
          email,
        }),
      });
      const data = await res.json();

      if (data.success) {
        // Guardar datos de sesión
        localStorage.setItem("auth", "true");
        localStorage.setItem("jefe_id", data.jefe_id);
        localStorage.setItem("compania_id", companiaId);

        // Limpiar campos (opcional)
        setNombre("");
        setContrasena("");
        setCompaniaId("");
        setDni("");
        setDireccion("");
        setEmail("");

        // Navegar al dashboard inmediatamente
        navigate("/dashboard");
      } else {
        setError(data.message || "Error al registrar jefe");
      }
    } catch (err) {
      console.error(err);
      setError("Error al conectar con el servidor");
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "80px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        background: "#fff",
        position: "relative",
      }}
    >
      {/* Botón de volver */}
      <button
        onClick={() => navigate("/")}
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          background: "transparent",
          border: "none",
          fontSize: "18px",
          cursor: "pointer",
        }}
      >
        ← Volver
      </button>

      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Registrar Jefe
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <input
          type="text"
          placeholder="Usuario"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="DNI"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Dirección"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <select
          value={companiaId}
          onChange={(e) => setCompaniaId(e.target.value)}
        >
          <option value="">-- Selecciona una compañía --</option>
          {companias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <button
          type="submit"
          style={{
            background: "#1890ff",
            color: "#fff",
            border: "none",
            padding: "10px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Registrar
        </button>
      </form>

      {error && <p style={{ color: "red", marginTop: "15px" }}>{error}</p>}
      {successMsg && (
        <p style={{ color: "green", marginTop: "15px" }}>{successMsg}</p>
      )}
    </div>
  );
}

export default RegisterPage;
