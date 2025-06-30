import { useState, useEffect } from "react";
import Swal from "sweetalert2";

const ReportForm = () => {
  const [deviceId, setDeviceId] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  // Nuevo estado para controlar la visibilidad del cartel informativo
  const [showInfoBanner, setShowInfoBanner] = useState(false);

  useEffect(() => {
    // Lógica para mostrar el cartel informativo si es la primera visita
    const hasAcceptedBanner = localStorage.getItem("infoBannerAccepted");
    if (!hasAcceptedBanner) {
      setShowInfoBanner(true);
    }

    // Tu lógica existente
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const key = params.get("key");

    if (key) {
      sessionStorage.setItem("authKey", key);
      const cleanUrl =
        window.location.origin +
        window.location.pathname +
        (id ? `?id=${id}` : "");
      window.history.replaceState({}, document.title, cleanUrl);
    } else {
      if (!sessionStorage.getItem("authKey")) {
        Swal.fire({
          icon: "error",
          title: "Acceso denegado",
          text: "No tenés permiso para acceder al formulario.",
        });
      }
    }

    if (id) setDeviceId(id);
  }, []);

  // Nueva función para manejar el clic en el botón del cartel
  const handleAcceptInfoBanner = () => {
    localStorage.setItem("infoBannerAccepted", "true");
    setShowInfoBanner(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!description.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Falta descripción",
        text: "Por favor escribí una breve descripción del problema.",
      });
      setIsLoading(false);
      return;
    }

    const authKey = sessionStorage.getItem("authKey");

    if (!authKey) {
      Swal.fire({
        icon: "error",
        title: "Acceso no autorizado",
        text: "No se encontró la clave de acceso. Por favor escaneá el QR para ingresar.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://kretz-report.onrender.com/api/odoo-report",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deviceId,
            priority,
            description,
            key: authKey,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error en la solicitud al servidor.");
      }

      Swal.fire({
        icon: "success",
        title: "¡Reporte Enviado!",
        text: `El equipo ${deviceId} fue reportado correctamente.`,
        confirmButtonColor: "#007bff",
      });

      setDescription("");
      setPriority(2);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error al Enviar",
        text: err.message || "Hubo un problema al procesar el reporte.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        body {
          background-color: #f8f9fa;
          font-family: 'Segoe UI', sans-serif;
        }

        .form-container {
          max-width: 500px;
          margin: 2rem auto;
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 0 15px rgba(0,0,0,0.1);
          text-align: center;
        }

        .form-container img.logo {
          max-width: 200px;
        }

        h2 {
          margin-bottom: 1.5rem;
          color: #333;
        }

        textarea {
          width: 100%;
          padding: 10px;
          border-radius: 6px;
          border: 1px solid #ccc;
          resize: vertical;
          font-size: 1rem;
          margin-bottom: 1rem;
        }

        .priority-selector {
          display: flex;
          gap: 10px;
          margin: 1rem 0;
        }

        .priority-btn {
          flex: 1;
          padding: 10px;
          border: 1px solid #ccc;
          background-color: #f0f0f0;
          cursor: pointer;
          transition: all 0.2s;
          border-radius: 6px;
        }

        .priority-btn.selected {
          background-color: #007bff;
          color: white;
          border-color: #0056b3;
        }

        .priority-btn:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        button[type="submit"] {
          background-color: #007bff;
          color: white;
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          width: 100%;
          margin-top: 1rem;
          transition: background-color 0.2s ease;
        }

        button[type="submit"]:hover {
          background-color: #0056b3;
        }

        .footer {
          margin-top: 2rem;
          font-size: 0.9rem;
          color: #666;
        }

        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(255,255,255,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
        }

        .spinner {
          border: 6px solid #f3f3f3;
          border-top: 6px solid #007bff;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* --- Nuevos estilos para el cartel informativo --- */
        .info-banner-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000; /* Debe estar por encima del spinner */
          backdrop-filter: blur(4px);
        }

        .info-banner-content {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          max-width: 500px;
          margin: 1rem;
          text-align: left;
          box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        }
        
        .info-banner-content h3 {
          margin-top: 0;
          color: #333;
        }

        .info-banner-content p {
          color: #555;
          line-height: 1.6;
        }
        
        .info-banner-content button {
          background-color: #007bff;
          color: white;
          padding: 10px 25px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          width: 100%;
          margin-top: 1.5rem;
          transition: background-color 0.2s ease;
        }

        .info-banner-content button:hover {
          background-color: #0056b3;
        }
        /* --- Fin de nuevos estilos --- */
      `}</style>

      {/* --- Nuevo cartel informativo --- */}
      {showInfoBanner && (
        <div className="info-banner-overlay">
          <div className="info-banner-content">
            <h3>¡Bienvenido al Sistema de Reportes!</h3>
            <p>
              Esta aplicación te permite reportar fallas en los equipos de forma
              rápida y sencilla. La aplicación carga automaticamente la tarea a ODOO para el
              equipo de infraestructura.
            </p>
            <p>
              Solamente se admiten <b>Fallas de Hardware</b> <br /> Por Ejemplo:
              "Lento Funcionamiento"
            </p>
            <p>
              <strong>¿Cómo funciona?</strong>
              <br />
              1. El equipo a reportar se detecta automáticamente al escanear el
              QR.
              <br />
              2. Seleccioná una prioridad y describí el problema.
              <br />
              3. Hacé clic en "Enviar reporte" para notificar al equipo de
              mantenimiento.
            </p>
            <button onClick={handleAcceptInfoBanner}>¡Entendido!</button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="overlay">
          <div className="spinner"></div>
        </div>
      )}

      <div className="form-container">
        <img
          className="logo"
          src="https://res.cloudinary.com/dpa8t14c2/image/upload/v1750187780/Kretz-Practica/logos/clie3e7edfxtuydw9pyd.png"
          alt="Logo"
        />

        <h2>Reporte de Falla</h2>

        <p>
          <strong>📦 Equipo:</strong> {deviceId || "No detectado"}
        </p>

        <label>⭐ Prioridad:</label>
        <div className="priority-selector">
          <button
            type="button"
            onClick={() => setPriority(1)}
            className={`priority-btn ${priority === 1 ? "selected" : ""}`}
            disabled={isLoading}
          >
            Baja
          </button>
          <button
            type="button"
            onClick={() => setPriority(2)}
            className={`priority-btn ${priority === 2 ? "selected" : ""}`}
            disabled={isLoading}
          >
            Media
          </button>
          <button
            type="button"
            onClick={() => setPriority(3)}
            className={`priority-btn ${priority === 3 ? "selected" : ""}`}
            disabled={isLoading}
          >
            Alta
          </button>
        </div>

        <label>📝 Descripción del problema:</label>
        <textarea
          rows={4}
          placeholder="Describí brevemente la falla observada..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          disabled={isLoading}
        />

        <button type="submit" disabled={isLoading} onClick={handleSubmit}>
          {isLoading ? "Enviando..." : "Enviar reporte"}
        </button>

        <div className="footer">
          © {new Date().getFullYear()} Todos los derechos reservados.
        </div>
      </div>
    </>
  );
};

export default ReportForm;
