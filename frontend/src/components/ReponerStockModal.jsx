import React, { useState } from "react";

function ReponerStockModal({ show, onClose, epp, onReponer }) {
    const [cantidad, setCantidad] = useState(1);
    const [loading, setLoading] = useState(false);

    if (!show || !epp) return null;

    const handleSubmit = async () => {
        if (cantidad <= 0) return alert("Ingresa una cantidad válida");
        try {
            setLoading(true);
            const res = await fetch(`http://localhost:5000/api/reponer_stock/${epp.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cantidad: Number(cantidad) }),
            });
            const data = await res.json();
            if (data.success) {
                onReponer(data.nuevo_stock);
                onClose();
            } else {
                alert(data.message || "Error al reponer stock");
            }
        } catch (err) {
            console.error(err);
            alert("Error de conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
            justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
            <div style={{
                background: "#fff", borderRadius: "8px", padding: "25px",
                width: "360px", boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                display: "flex", flexDirection: "column", gap: "15px"
            }}>
                <h3>Reponer stock: {epp.nombre}</h3>

                <label>
                    Cantidad a reponer:
                    <input
                        type="number"
                        min={1}
                        value={cantidad}
                        onChange={e => setCantidad(e.target.value)}
                        style={{ width: "80px", marginLeft: "10px" }}
                    />
                </label>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                    <button onClick={onClose} disabled={loading}>Cancelar</button>
                    <button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Reponiendo..." : "Reponer"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ReponerStockModal;
