import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import ReponerStockModal from "./ReponerStockModal";

function Alertas() {
    const [alertasTrabajadores, setAlertasTrabajadores] = useState([]);
    const [alertasEpp, setAlertasEpp] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [eppSeleccionado, setEppSeleccionado] = useState(null);

    const compania_id = localStorage.getItem("compania_id");
    const jefe_id = localStorage.getItem("jefe_id");

    const ALERTA_3MESES = 90;
    const ALERTA_1MES = 30;
    const ALERTA_1SEM = 7;

    useEffect(() => {
        const fetchAlertas = async () => {
            try {
                // EPPs asignados a trabajadores
                const resTrab = await fetch(`http://localhost:5000/api/trabajadores?jefe_id=${jefe_id}`);
                const dataTrab = await resTrab.json();

                let trabAlertas = [];
                dataTrab.forEach(t => {
                    t.epps_asignados?.forEach(epp => {
                        const fechaVenc = new Date(epp.fecha_vencimiento);
                        const diffDias = Math.ceil((fechaVenc - new Date()) / (1000 * 60 * 60 * 24));
                        if (diffDias <= ALERTA_3MESES) {
                            let color = "green";
                            if (diffDias <= ALERTA_1SEM) color = "red";
                            else if (diffDias <= ALERTA_1MES) color = "orange";

                            trabAlertas.push({
                                trabajador: `${t.nombre} ${t.apellido}`,
                                epp: epp.nombre,
                                fecha_vencimiento: fechaVenc,
                                dias_restantes: diffDias,
                                color
                            });
                        }
                    });
                });
                setAlertasTrabajadores(trabAlertas);

                // EPPs inventario
                const resEpp = await fetch(`http://localhost:5000/api/epps?compania_id=${compania_id}`);
                const dataEpp = await resEpp.json();

                const eppAlertas = dataEpp
                    .filter(e => {
                        const fechaCad = new Date(e.fecha_caducidad_real || e.fecha_caducidad_fabricante);
                        const diffDias = Math.ceil((fechaCad - new Date()) / (1000 * 60 * 60 * 24));
                        return diffDias <= ALERTA_3MESES || e.stock <= (e.stock_minima || 0);
                    })
                    .map(e => {
                        const fechaCad = new Date(e.fecha_caducidad_real || e.fecha_caducidad_fabricante);
                        const diffDias = Math.ceil((fechaCad - new Date()) / (1000 * 60 * 60 * 24));
                        let color = "green";
                        if (diffDias <= ALERTA_1SEM) color = "red";
                        else if (diffDias <= ALERTA_1MES) color = "orange";

                        return {
                            ...e,
                            fecha_caducidad: fechaCad,
                            dias_restantes: diffDias,
                            color
                        };
                    });

                setAlertasEpp(eppAlertas);
                setLoading(false);
            } catch (err) {
                console.error("Error cargando alertas:", err);
                setLoading(false);
            }
        };

        fetchAlertas();
    }, [compania_id, jefe_id]);

    const handleReponerClick = (epp) => {
        setEppSeleccionado(epp);
        setShowModal(true);
    };

    const handleActualizarStock = (nuevoStock) => {
        setAlertasEpp(prev => prev.map(e => e.id === eppSeleccionado.id ? { ...e, stock: nuevoStock } : e));
    };

    if (loading) return <p style={{ padding: "20px" }}>Cargando alertas...</p>;

    return (
        <>
            <Navbar />
            <div style={{ padding: "20px", marginTop: "60px" }}>
                <h2 style={{ textAlign: "center", fontSize: "2.5rem", fontWeight: "bold", marginBottom: "20px" }}>
                    Alertas de EPP
                </h2>

                {/* Leyenda centrada */}
                <div style={{ display: "flex", justifyContent: "center", gap: "25px", margin: "20px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <div style={{ width: "20px", height: "20px", backgroundColor: "green", border: "1px solid green" }}></div>
                        <span>Vence en ≤ 3 meses</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <div style={{ width: "20px", height: "20px", backgroundColor: "orange", border: "1px solid orange" }}></div>
                        <span>Vence en ≤ 1 mes</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <div style={{ width: "20px", height: "20px", backgroundColor: "red", border: "1px solid red" }}></div>
                        <span>Vence en ≤ 1 semana</span>
                    </div>
                </div>

                <section style={{ marginTop: "20px", textAlign: "left" }}>
                    <h3 style={{ fontSize: "1.8rem", marginBottom: "15px" }}>Trabajadores - EPP próximos a vencer</h3>
                    {alertasTrabajadores.length === 0 && <p>No hay alertas para trabajadores</p>}
                    {alertasTrabajadores.map((a, i) => (
                        <div key={i} style={{
                            border: `2px solid ${a.color}`,
                            background: "#fff",
                            padding: "15px",
                            marginBottom: "10px",
                            borderRadius: "8px"
                        }}>
                            <p><strong>Trabajador:</strong> {a.trabajador}</p>
                            <p><strong>EPP:</strong> {a.epp}</p>
                            <p><strong>Fecha de vencimiento:</strong> {a.fecha_vencimiento.toLocaleDateString()}</p>
                            <p><strong>Vence en:</strong> {a.dias_restantes} días</p>
                        </div>
                    ))}
                </section>

                <section style={{ marginTop: "40px", textAlign: "left" }}>
                    <h3 style={{ fontSize: "1.8rem", marginBottom: "15px" }}>Inventario - EPP próximos a vencer o stock bajo</h3>
                    {alertasEpp.length === 0 && <p>No hay alertas de inventario</p>}
                    {alertasEpp.map((e, i) => (
                        <div key={i} style={{
                            border: `2px solid ${e.color}`,
                            background: "#fff",
                            padding: "15px",
                            marginBottom: "10px",
                            borderRadius: "8px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <div>
                                <p><strong>{e.nombre}</strong> ({e.tipo}) - Marca: {e.marca || "N/A"}</p>
                                <p><strong>Stock actual:</strong> {e.stock}</p>
                                <p><strong>Fecha de caducidad:</strong> {e.fecha_caducidad.toLocaleDateString()}</p>
                                <p><strong>Vence en:</strong> {e.dias_restantes} días</p>
                            </div>
                            <button onClick={() => handleReponerClick(e)} style={{ height: "35px" }}>Reponer stock</button>
                        </div>
                    ))}
                </section>

                <ReponerStockModal
                    show={showModal}
                    onClose={() => setShowModal(false)}
                    epp={eppSeleccionado}
                    onReponer={handleActualizarStock}
                />
            </div>
        </>
    );
}

export default Alertas;
