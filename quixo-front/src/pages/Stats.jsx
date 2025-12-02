import { useEffect, useState } from "react";
import { stats } from "../services/api";

export default function StatsPage() {
  const [stats2p, setStats2p] = useState([]);
  const [stats4p, setStats4p] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const [s2, s4] = await Promise.all([
          stats.jugadores2p(),
          stats.equipos4p(),
        ]);
        setStats2p(Array.isArray(s2) ? s2 : []);
        setStats4p(Array.isArray(s4) ? s4 : []);
      } catch (e) {
        console.error(e);
        setError("No se pudieron cargar las estadísticas.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="grid" style={{ gap: 20 }}>
      <div className="hero">
        <div style={{ fontSize: 48, lineHeight: 1 }}>📊</div>
        <div>
          <h1>Estadísticas</h1>
          <p>
            Efectividad y cantidad de partidas ganadas en modo 2 jugadores y modo 4 jugadores.
          </p>
        </div>
      </div>

      {error && (
        <div className="panel" style={{ color: "#ff7676" }}>
          {error}
        </div>
      )}

      {loading && <div className="panel">Cargando estadísticas...</div>}

      {!loading && (
        <>
          {/* Modo 2 jugadores */}
          <div className="panel">
            <h3 style={{ marginTop: 0 }}>Modo para dos jugadores</h3>
            <table
              width="100%"
              cellPadding="8"
              style={{ borderCollapse: "collapse" }}
            >
              <thead style={{ opacity: 0.8 }}>
                <tr>
                  <th align="left">Jugador</th>
                  <th align="right">Efectividad</th>
                  <th align="right">Ganadas</th>
                  <th align="right">Jugadas</th>
                </tr>
              </thead>
              <tbody>
                {stats2p.map((row) => (
                  <tr
                    key={row.jugadorId}
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    <td>{row.nombre}</td>
                    <td align="right">
                      {row.efectividadPorc?.toFixed
                        ? row.efectividadPorc.toFixed(2)
                        : row.efectividadPorc}
                      %
                    </td>
                    <td align="right">{row.ganadas}</td>
                    <td align="right">{row.jugadas}</td>
                  </tr>
                ))}
                {stats2p.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: 16 }}>
                      Aún no hay partidas finalizadas en modo 2 jugadores.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Modo 4 jugadores */}
          <div className="panel">
            <h3 style={{ marginTop: 0 }}>Modo para cuatro jugadores (equipos)</h3>
            <table
              width="100%"
              cellPadding="8"
              style={{ borderCollapse: "collapse" }}
            >
              <thead style={{ opacity: 0.8 }}>
                <tr>
                  <th align="left">Equipo</th>
                  <th align="right">Efectividad</th>
                  <th align="right">Ganadas</th>
                  <th align="right">Jugadas</th>
                </tr>
              </thead>
              <tbody>
                {stats4p.map((row) => (
                  <tr
                    key={row.equipo}
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    <td>Equipo {row.equipo}</td>
                    <td align="right">
                      {row.efectividadPorc?.toFixed
                        ? row.efectividadPorc.toFixed(2)
                        : row.efectividadPorc}
                      %
                    </td>
                    <td align="right">{row.ganadas}</td>
                    <td align="right">{row.jugadas}</td>
                  </tr>
                ))}
                {stats4p.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: 16 }}>
                      Aún no hay partidas finalizadas en modo 4 jugadores.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
