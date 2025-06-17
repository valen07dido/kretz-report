import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import equipoConfig from "./equipoConfig.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/odoo-report", async (req, res) => {
  const { deviceId, description, priority, key } = req.body;
  const numero = deviceId?.split("-")?.[2]; // "KRETZ-AIO-036" → "036"
  const equipoInfo = equipoConfig.find((eq) => eq.name === deviceId);
  if (key !== process.env.REPORT_KEY) {
    return res.status(401).json({ error: "Acceso no autorizado" });
  }

  if (!equipoInfo) {
    return res.status(400).json({ error: "Equipo no reconocido" });
  }
  function detectarCategoria(deviceId) {
    if (!deviceId) return null;
    if (deviceId.includes("AIO")) return 1;
    if (deviceId.includes("NB")) return 2;
    if (deviceId.includes("TAB")) return 3;
    return null;
  }

  const bodyData = {
    name: `Falla en ${deviceId}`,
    maintenance_type: "corrective",
    request_date: new Date().toISOString(),
    priority: priority?.toString() || "2",
    category_id: detectarCategoria(deviceId),
    description,
    equipment_id: equipoInfo.id,
    maintenance_team_id: 5,
    employee_id: Array.isArray(equipoInfo.employee_id)
      ? equipoInfo.employee_id[0]
      : false,
  };
  console.log("Datos del reporte:", bodyData);
  const response = await fetch(process.env.ODOO_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "object",
        method: "execute_kw",
        args: [
          process.env.ODOO_DB,
          process.env.ODOO_USER_ID,
          process.env.ODOO_PASSWORD,
          "maintenance.request",
          "create",
          [bodyData],
        ],
      },
    }),
  });

  const result = await response.json();
  res.status(200).json(result);
});

app.listen(process.env.PORT, () =>
  console.log(
    `Servidor backend escuchando en http://localhost:${process.env.PORT}`
  )
);
