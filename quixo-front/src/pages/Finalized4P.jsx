import { useEffect, useState } from "react";
import { jugadores, partidas4p, partidasFinalizadas } from "../services/api";
import Board5x5_4P from "../components/Board5x5_4P";
import { emptyBoard4P, pushAndInsert4P, rc4 } from "../utils/board4p";
import { fmtHMS } from "../hooks/useTimer";

function parseHistorial4P(xml) {
  if (!xml || typeof xml !== "string" || !xml.includes("<Jugada")) return [];
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");
    const nodes = Array.from(doc.getElementsByTagName("Jugada"));

    return nodes.map((n, idx) => {
      const jugador = n.getAttribute("jugador") || "";
      const retirado = Number(n.getAttribute("retirado") || "0");
      const eje = n.getAttribute("eje") || "";
      const indice = Number(n.getAttribute("indice") || "0");
      const extremo = n.getAttribute("extremo") || "";
      const simbolo = n.getAttribute("simbolo") || "";
      const punto = n.getAttribute("punto") || null;

      // Calcular casilla de destino
      let destR = 0;
      let destC = 0;

      if (eje === "ROW") {
        destR = indice;
        destC = extremo === "START" ? 0 : 4;
      } else if (eje === "COL") {
        destC = indice;
        destR = extremo === "START" ? 0 : 4;
      }

      const destino = destR * 5 + destC;
      const { r: retR, c: retC } = rc4(retirado);

      return {
        idx,
        jugador,
        retirado,
        eje,
        indice,
        extremo,
        simbolo,
        punto,
        destino,
        destR,
        destC,
        retR,
        retC,
      };
    });
  } catch {
    return [];
  }
}

function buildBoard4P(moves, upto) {
  let b = emptyBoard4P();
  const limit = Math.max(0, Math.min(upto, moves.length));
  for (let i = 0; i < limit; i++) {
    const m = moves[i];
    b = pushAndInsert4P(b, m.eje, m.indice, m.extremo, m.simbolo, m.punto);
  }
  return b;
}

export default function Finalized4P() {
  const [rows, setRows] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  const [selected, setSelected] = useState(null);
  const [moves, setMoves] = useState([]);
  const [currentMove, setCurrentMove] = useState(0);
  const [board, setBoard] = useState(emptyBoard4P());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [players, setPlayers] = useState(new Map());
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");

  // Cargar lista
  useEffect(() => {
    async function load() {
      try {
        setLoadingList(true);
        const r = await partidas4p.finalizadas();
        setRows(r.data || []);
      } catch {
        setRows([]);
      } finally {
        setLoadingList(false);
      }
    }
    load();
  }, []);

  // Cargar jugadores
  useEffect(() => {
    async function loadPlayers() {
      try {
        const list = await jugadores.list();
        const map = new Map();
        list.forEach((j) => map.set(j.jugadorId, j.nombre));
        setPlayers(map);
      } catch {
        setPlayers(new Map());
      }
    }
    loadPlayers();
  }, []);

  // Recalcular tablero + tiempo al cambiar jugada
  useEffect(() => {
    if (!selected) return;

    if (currentMove === 0 || moves.length === 0) {
      setBoard(emptyBoard4P());
      setElapsedSeconds(0);
      return;
    }

    const b = buildBoard4P(moves, currentMove);
    setBoard(b);

    const totalJugadas = moves.length || 1;
    const totalSegundos = selected.duracionSegundos ?? 0;
    const elapsed = Math.round(totalSegundos * (currentMove / totalJugadas));
    setElapsedSeconds(elapsed);
  }, [selected, currentMove, moves]);

  async function handleSelectRow(row) {
    try {
      setLoadingDetail(true);
      setError("");
      const res = await partidas4p.get(row.partidaId);
      const d = res.data || {};

      const detail = {
        partidaId: d.partidaId ?? d.PartidaId,
        modo: d.modo ?? d.Modo,
        fechaCreacion: d.fechaCreacion ?? d.FechaCreacion,
        fechaFinalizada: d.fechaFinalizada ?? d.FechaFinalizada,
        duracionSegundos: d.duracionSegundos ?? d.DuracionSegundos,
        equipoA1Id: d.equipoA1Id ?? d.EquipoA1Id,
        equipoA2Id: d.equipoA2Id ?? d.EquipoA2Id,
        equipoB1Id: d.equipoB1Id ?? d.EquipoB1Id,
        equipoB2Id: d.equipoB2Id ?? d.EquipoB2Id,
        ganadorEquipo: d.ganadorEquipo ?? d.GanadorEquipo,
        tableroFinalXml: d.tableroFinalXml ?? d.TableroFinalXml,
        historialXml: d.historialXml ?? d.HistorialXml,
      };

      const parsedMoves = parseHistorial4P(detail.historialXml);
      setSelected(detail);
      setMoves(parsedMoves);
      setCurrentMove(parsedMoves.length); // ir al final
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar el detalle de la partida.");
      setSelected(null);
      setMoves([]);
      setCurrentMove(0);
      setBoard(emptyBoard4P());
      setElapsedSeconds(0);
    } finally {
      setLoadingDetail(false);
    }
  }

  function handleExportXml(row) {
    const url = partidasFinalizadas.exportXmlUrl(row.partidaId);
    window.open(url, "_blank");
  }

  const totalJugadas = moves.length;
  const nombreA1 = selected
    ? players.get(selected.equipoA1Id) || `Jugador ${selected.equipoA1Id}`
    : "—";
  const nombreA2 = selected
    ? players.get(selected.equipoA2Id) || `Jugador ${selected.equipoA2Id}`
    : "—";
  const nombreB1 = selected
    ? players.get(selected.equipoB1Id) || `Jugador ${selected.equipoB1Id}`
    : "—";
  const nombreB2 = selected
    ? players.get(selected.equipoB2Id) || `Jugador ${selected.equipoB2Id}`
    : "—";

  const canPrev = currentMove > 0 && totalJugadas > 0;
  const canNext = currentMove < totalJugadas && totalJugadas > 0;

  function goPrev() {
    if (!canPrev) return;
    setCurrentMove((m) => Math.max(0, m - 1));
  }

  function goNext() {
    if (!canNext) return;
    setCurrentMove((m) => Math.min(totalJugadas, m + 1));
  }

  return (
    <div className="panel">
      <h3 style={{ marginTop: 0 }}>Partidas finalizadas — Modo 4 jugadores</h3>

      {/* Tabla de partidas */}
      <table
        width="100%"
        cellPadding="8"
        style={{ borderCollapse: "collapse", marginBottom: 16 }}
      >
        <thead style={{ opacity: 0.75 }}>
          <tr>
            <th align="left">ID</th>
            <th align="left">Creación</th>
            <th align="left">Finalizada</th>
            <th align="center">Duración (s)</th>
            <th align="center">Equipo ganador</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => (
            <tr
              key={r.partidaId ?? r.PartidaId}
              style={{
                borderTop: "1px solid var(--border)",
                background:
                  selected &&
                  selected.partidaId === (r.partidaId ?? r.PartidaId)
                    ? "rgba(255,255,255,0.03)"
                    : "transparent",
              }}
            >
              <td>{r.partidaId}</td>
              <td>
                {r.fechaCreacion
                  ? new Date(r.fechaCreacion).toLocaleString()
                  : "-"}
              </td>
              <td>
                {r.fechaFinalizada
                  ? new Date(r.fechaFinalizada).toLocaleString()
                  : "-"}
              </td>
              <td align="center">{r.duracionSegundos ?? "-"}</td>
              <td align="center">{r.ganadorEquipo ?? "-"}</td>
              <td>
                <button
                  className="btn secondary"
                  style={{ marginRight: 8 }}
                  onClick={() => handleSelectRow(r)}
                  disabled={loadingDetail}
                >
                  Ver historial
                </button>
                <button
                  className="btn"
                  onClick={() => handleExportXml(r)}
                >
                  Exportar XML
                </button>
              </td>
            </tr>
          ))}

          {!loadingList && rows.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: 20 }}>
                No hay partidas finalizadas.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {loadingList && <div>Cargando partidas...</div>}
      {error && (
        <div style={{ color: "#ff7676", marginBottom: 8 }}>{error}</div>
      )}

      {/* Detalle / historial */}
      {selected && (
        <div className="panel" style={{ marginTop: 16 }}>
          <h4 style={{ marginTop: 0 }}>
            Detalle de partida #{selected.partidaId} — equipo ganador:{" "}
            <span style={{ fontWeight: 700 }}>
              {selected.ganadorEquipo ?? "—"}
            </span>
          </h4>

          <div style={{ marginBottom: 8, fontSize: 14, opacity: 0.85 }}>
            <div>
              Equipo A: <b>{nombreA1}</b> y <b>{nombreA2}</b> · Equipo B:{" "}
              <b>{nombreB1}</b> y <b>{nombreB2}</b>
            </div>
            <div>
              Creación:{" "}
              <b>
                {selected.fechaCreacion
                  ? new Date(selected.fechaCreacion).toLocaleString()
                  : "-"}
              </b>{" "}
              ·
              Finalizada:{" "}
              <b>
                {selected.fechaFinalizada
                  ? new Date(selected.fechaFinalizada).toLocaleString()
                  : "-"}
              </b>
            </div>
            <div>
              Tiempo total:{" "}
              <b>{fmtHMS(selected.duracionSegundos ?? 0)}</b> · Tiempo
              transcurrido en jugada seleccionada (aprox.):{" "}
              <b>{fmtHMS(elapsedSeconds)}</b>
            </div>
          </div>

          {/* Navegación de jugadas con botones */}
          <div
            style={{
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <button
              className="btn secondary"
              onClick={goPrev}
              disabled={!canPrev}
            >
              ⬅ Jugada anterior
            </button>
            <span style={{ fontSize: 14 }}>
              Jugada:{" "}
              <b>
                {currentMove} / {totalJugadas}
              </b>
            </span>
            <button
              className="btn secondary"
              onClick={goNext}
              disabled={!canNext}
            >
              Siguiente jugada ➜
            </button>
          </div>

          {/* Tablero */}
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <Board5x5_4P board={board} onPickEdge={() => {}} disabled={true} />
          </div>

          {/* Lista textual de jugadas */}
          <div
            style={{
              maxHeight: 200,
              overflowY: "auto",
              fontSize: 13,
              borderTop: "1px solid var(--border)",
              paddingTop: 8,
            }}
          >
            <strong>Historial de jugadas</strong>
            <ol style={{ paddingLeft: 18, marginTop: 6 }}>
              {moves.map((m, idx) => (
                <li
                  key={idx}
                  style={{
                    marginBottom: 4,
                    background:
                      idx + 1 === currentMove
                        ? "rgba(255,255,255,0.06)"
                        : "transparent",
                    borderRadius: 4,
                    padding: "2px 4px",
                  }}
                >
                  El jugador <b>{m.jugador}</b> retiró índice {m.retirado}{" "}
                  ({m.retR + 1},{m.retC + 1}) · {m.eje} {m.indice} desde{" "}
                  {m.extremo} y colocó <b>{m.simbolo}</b> en índice{" "}
                  {m.destino} ({m.destR + 1},{m.destC + 1}) · punto{" "}
                  {m.punto ?? "-"}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
