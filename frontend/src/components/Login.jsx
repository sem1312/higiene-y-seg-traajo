import React, { useState } from 'react'; 
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [nombre, setNombre] = useState('');
  const [contrasena, setContrasena] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nombre, contrasena })
      });

      const data = await res.json();

      if (data.success) {
        onLoginSuccess();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error al hacer login", err);
      alert("Error del servidor");
    }
  };

  return (
   <div className='app-container'>
    <h1 className="app-title">CONTROL DE EPP+</h1>
    <h2 className="app-subtitle">La app que cuida a tu equipo</h2>
    <h3 className="app-description">En el trabajo, la seguridad no es opcional: es una prioridad. “Seguro que estás seguro” es una aplicación diseñada para ayudar a las empresas a verificar que sus empleados utilicen siempre los Elementos de Protección Personal (EPP) adecuados, de manera práctica y eficiente.   
    </h3>
    <p className="app-text">Con esta herramienta, supervisores y responsables de seguridad pueden:</p>
    <ul className="app-list">
      <li>Monitorear en tiempo real el cumplimiento de las normas de seguridad.</li>
      <li>Detectar y registrar incumplimientos en el uso de EPP.</li>
      <li>Generar reportes claros y automatizados para mejorar la toma de decisiones.</li>
      <li>Fomentar una cultura de prevención en toda la organización.</li>
    </ul>
    
    <div className="login-container">
      <h2 className="login-title">Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <label className="login-label">Nombre:</label>
        <input
          type="text"
          className="login-input"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        
        <label className="login-label">Contraseña:</label>
        <input
          type="password"
          className="login-input"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          required
        />
        
        <button type="submit" className="login-button">Entrar</button>
      </form>
    </div>
    </div>
  );
};

export default Login;
