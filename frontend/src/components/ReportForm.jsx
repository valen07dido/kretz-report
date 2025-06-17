import { useState, useEffect } from "react";
import Swal from "sweetalert2";

const ReportForm = () => {
  const [deviceId, setDeviceId] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(2);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
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
      const response = await fetch("https://kretz-report.onrender.com/api/odoo-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, priority, description, key: authKey }),
      });

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
      `}</style>

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
