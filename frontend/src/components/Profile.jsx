import React, { useEffect, useState } from "react";
import "../styles/Profile.css";
import defaultProfilePic from "../assets/defaultProfilePic.png";
import Navbar from "./Navbar"; // <-- Navbar visible

const Profile = () => {
    const [jefe, setJefe] = useState(null);
    const [foto, setFoto] = useState(null);
    const [loading, setLoading] = useState(true);

    const jefe_id = localStorage.getItem("jefe_id");

    useEffect(() => {
        if (!jefe_id) return;

        fetch(`http://localhost:5000/api/jefe/${jefe_id}`)
            .then(res => res.json())
            .then(data => {
                setJefe(data);
                setFoto(data.foto_url || null);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [jefe_id]);

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("foto", file);

        fetch(`http://localhost:5000/api/jefe/${jefe_id}/foto`, {
            method: "POST",
            body: formData,
        })
            .then(res => res.json())
            .then(data => setFoto(data.foto_url))
            .catch(err => console.error(err));
    };

    if (loading) return <p>Cargando perfil...</p>;
    if (!jefe) return <p>Perfil no encontrado.</p>;

    return (
        <>
            <Navbar />
            <div className="profile-page">
                {/* Título centrado con márgenes */}
                <h1 className="profile-title">Mi Perfil</h1>

                <div className="profile-container">
                    <div className="profile-card">
                        <div className="profile-left">
                            <div className="foto-wrapper">
                                <img
                                    src={foto ? `http://localhost:5000/${foto}` : defaultProfilePic}
                                    alt="Foto de perfil"
                                    className="profile-img"
                                />
                                <div className="foto-overlay">
                                    {foto ? "Cambiar foto" : "Agregar foto"}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="fotoInput"
                                    onChange={handleFotoChange}
                                    style={{ display: "none" }}
                                />
                                <label htmlFor="fotoInput" className="foto-label"></label>
                            </div>
                        </div>

                        <div className="profile-right">
                            <p><strong>Nombre:</strong> {jefe.nombre_completo}</p>
                            <p><strong>Email:</strong> {jefe.email}</p>
                            <p><strong>Teléfono:</strong> {jefe.telefono || "-"}</p>
                            <p><strong>Cargo:</strong> {jefe.cargo || "-"}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;
