import React, { useState } from "react";
import Navbar from "./Navbar";
import "../styles/Register.css";

const Register = () => {
    const [formData, setFormData] = useState({
        nombre_completo: "",
        email: "",
        telefono: "",
        dni: "",
        cargo: "",
        contrasena: "",
        compania: "",
    });

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:5000/api/registrar_cuenta", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (data.success) {
                setMessage("Cuenta creada correctamente! Ya podés iniciar sesión.");
                setFormData({
                    nombre_completo: "",
                    email: "",
                    telefono: "",
                    dni: "",
                    cargo: "",
                    contrasena: "",
                    compania: "",
                });
            } else {
                setMessage(`Error: ${data.message}`);
            }
        } catch (err) {
            console.error(err);
            setMessage("Error de conexión al servidor");
        }
    };

    return (
        <>
            <Navbar />
            <div className="register-container">
                <h2>Registrar nueva cuenta</h2>
                {message && <p className="message">{message}</p>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="nombre_completo"
                        placeholder="Nombre completo"
                        value={formData.nombre_completo}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="telefono"
                        placeholder="Teléfono"
                        value={formData.telefono}
                        onChange={handleChange}
                    />
                    <input
                        type="text"
                        name="dni"
                        placeholder="DNI"
                        value={formData.dni}
                        onChange={handleChange}
                    />
                    <input
                        type="text"
                        name="cargo"
                        placeholder="Cargo"
                        value={formData.cargo}
                        onChange={handleChange}
                    />
                    <input
                        type="password"
                        name="contrasena"
                        placeholder="Contraseña"
                        value={formData.contrasena}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="compania"
                        placeholder="Compañía"
                        value={formData.compania}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit">Registrar</button>
                </form>
            </div>
        </>
    );
};

export default Register;
