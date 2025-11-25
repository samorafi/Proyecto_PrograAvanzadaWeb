import { useEffect, useState } from "react";
import { partidas4p } from "../services/api";

export default function Finalized4P() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    partidas4p
      .finalizadas()
      .then((r) => setRows(r.data || []))
      .catch(() => setRows([]));
  }, []);

  return (
    <div className="panel">
      <h3 style={{ marginTop: 0 }}>Partidas finalizadas — Modo 4 jugadores</h3>

      <table
        width="100%"
        cellPadding="8"
        style={{ borderCollapse: "collapse", width: "100%" }}
      >
        <thead style={{ opacity: 0.75 }}>
          <tr>
            <th align="left">ID</th>
            <th align="left">Creación</th>
            <th align="left">Finalizada</th>
            <th align="center">Duración (s)</th>
            <th align="center">Equipo ganador</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => (
            <tr
              key={r.partidaId}
              style={{
                borderTop: "1px solid var(--border)",
                cursor: "pointer",
              }}
            >
              <td>{r.partidaId}</td>
              <td>{new Date(r.fechaCreacion).toLocaleString()}</td>
              <td>{new Date(r.fechaFinalizada).toLocaleString()}</td>
              <td align="center">{r.duracionSegundos ?? "-"}</td>
              <td align="center">{r.ganadorEquipo ?? "-"}</td>
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: 20 }}>
                No hay partidas finalizadas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}