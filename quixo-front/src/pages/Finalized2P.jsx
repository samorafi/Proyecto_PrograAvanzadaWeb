import { useEffect, useState } from "react";
import { jugadores, partidas2p, partidasFinalizadas } from "../services/api";
import Board5x5 from "../components/Board5x5";
import { emptyBoard, rc, pushAndInsert } from "../utils/board2p";
import { fmtHMS } from "../hooks/useTimer";

function parseHistorial2P(xml) {
  if (!xml || typeof xml !== "string" || !xml.includes("<Jugada")) {
    return { moves: [], hasSnapshots: false };
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");

    const turnNodes = Array.from(doc.getElementsByTagName("Turno"));

    if (turnNodes.length > 0) {
      const moves = turnNodes.map((t, idx) => {
        const jugada = t.getElementsByTagName("Jugada")[0];
        const tab = t.getElementsByTagName("Tablero")[0];

        const turno = Number(jugada?.getAttribute("turno") || idx + 1);
        const jugador = jugada?.getAttribute("jugador") || "";
        const retiro = Number(jugada?.getAttribute("retiro") || "0");
        const eje = jugada?.getAttribute("eje") || "";
        const extremo = jugada?.getAttribute("extremo") || "";
        const horaUtc = jugada?.getAttribute("horaUtc") || null;

        // snapshot del tablero
        let boardSnapshot = emptyBoard();
        if (tab) {
          const celdas = Array.from(tab.getElementsByTagName("Celda"));
          const b = [...boardSnapshot];
          celdas.forEach((c) => {
            const i = Number(c.getAttribute("i") || "0");
            const s = c.getAttribute("simbolo") || "N";
            if (i >= 0 && i < 25) b[i] = s;
          });
          boardSnapshot = b;
        }

        // destino calculado
        const { r, c } = rc(retiro);
        let destR = r;
        let destC = c;
        if (eje === "ROW") destC = extremo === "START" ? 0 : 4;
        else if (eje === "COL") destR = extremo === "START" ? 0 : 4;
        const destino = destR * 5 + destC;

        return {
          idx,
          turno,
          jugador,
          retiro,
          eje,
          extremo,
          horaUtc,
          destino,
          destR,
          destC,
          boardSnapshot,
        };
      });

      return { moves, hasSnapshots: true };
    }

    const nodes = Array.from(doc.getElementsByTagName("Jugada"));
    const moves = nodes.map((n, idx) => {
      const turno = Number(n.getAttribute("turno") || idx + 1);
      const jugador = n.getAttribute("jugador") || "";
      const retiro = Number(n.getAttribute("retiro") || "0");
      const eje = n.getAttribute("eje") || "";
      const extremo = n.getAttribute("extremo") || "";
      const horaUtc = n.getAttribute("horaUtc") || null;

      const { r, c } = rc(retiro);
      let destR = r;
      let destC = c;
      if (eje === "ROW") destC = extremo === "START" ? 0 : 4;
      else if (eje === "COL") destR = extremo === "START" ? 0 : 4;
      const destino = destR * 5 + destC;

      return {
        idx,
        turno,
        jugador,
        retiro,
        eje,
        extremo,
        horaUtc,
        destino,
        destR,
        destC,
        boardSnapshot: null,
      };
    });

    return { moves, hasSnapshots: false };
  } catch {
    return { moves: [], hasSnapshots: false };
  }
}

// reconstrucción a partir de jugadas
function buildBoard2P(moves, upto) {
  let b = emptyBoard();
  const limit = Math.max(0, Math.min(upto, moves.length));
  for (let i = 0; i < limit; i++) {
    const m = moves[i];
    const { r, c } = rc(m.retiro);
    const index = m.eje === "COL" ? c : r;
    b = pushAndInsert(b, m.eje, index, m.extremo, m.jugador);
  }
  return b;
}

export default function PartidasFinalizadas2J() {
  const [rows, setRows] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  const [selected, setSelected] = useState(null);
  const [moves, setMoves] = useState([]);
  const [hasSnapshots, setHasSnapshots] = useState(false);
  const [currentMove, setCurrentMove] = useState(0);
  const [board, setBoard] = useState(emptyBoard());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [players, setPlayers] = useState(new Map());
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");

  // Cargar lista de partidas finalizadas
  useEffect(() => {
    async function load() {
      try {
        setLoadingList(true);
        const r = await partidas2p.finalizadas();
        const data = r.data || [];
        setRows(data);
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

  // Recalcular tablero + tiempo cuando cambia jugada seleccionada
  useEffect(() => {
    if (!selected) return;

    if (currentMove === 0 || moves.length === 0) {
      setBoard(emptyBoard());
      setElapsedSeconds(0);
      return;
    }

    const idx = currentMove - 1;
    const m = moves[idx];

    if (hasSnapshots && m?.boardSnapshot) {
      setBoard(m.boardSnapshot);
    } else {
      const b = buildBoard2P(moves, currentMove);
      setBoard(b);
    }

    let elapsed = 0;
    if (m?.horaUtc && selected.fechaCreacion) {
      try {
        const t0 = new Date(selected.fechaCreacion);
        const tN = new Date(m.horaUtc);
        elapsed = Math.max(0, Math.round((tN.getTime() - t0.getTime()) / 1000));
      } catch {
        elapsed = 0;
      }
    }
    setElapsedSeconds(elapsed);
  }, [selected, currentMove, moves, hasSnapshots]);

  async function handleSelectRow(row) {
    try {
      setLoadingDetail(true);
      setError("");
      const res = await partidas2p.get(row.partidaId);
      const d = res.data || {};

      const detail = {
        partidaId: d.partidaId ?? d.PartidaId,
        modo: d.modo ?? d.Modo,
        fechaCreacion: d.fechaCreacion ?? d.FechaCreacion,
        fechaFinalizada: d.fechaFinalizada ?? d.FechaFinalizada,
        duracionSegundos: d.duracionSegundos ?? d.DuracionSegundos,
        jugadorOid: d.jugadorOid ?? d.JugadorOid,
        jugadorXid: d.jugadorXid ?? d.JugadorXid,
        ganadorSimbolo: d.ganadorSimbolo ?? d.GanadorSimbolo,
        tableroFinalXml: d.tableroFinalXml ?? d.TableroFinalXml,
        historialXml: d.historialXml ?? d.HistorialXml,
      };

      const { moves: parsedMoves, hasSnapshots } = parseHistorial2P(
        detail.historialXml
      );
      setSelected(detail);
      setMoves(parsedMoves);
      setHasSnapshots(hasSnapshots);
      setCurrentMove(parsedMoves.length);
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar el detalle de la partida.");
      setSelected(null);
      setMoves([]);
      setHasSnapshots(false);
      setCurrentMove(0);
      setBoard(emptyBoard());
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
  const jugadorOName = selected
    ? players.get(selected.jugadorOid) || `Jugador ${selected.jugadorOid}`
    : "—";
  const jugadorXName = selected
    ? players.get(selected.jugadorXid) || `Jugador ${selected.jugadorXid}`
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
      <h3 style={{ marginTop: 0 }}>Partidas finalizadas — Modo 2 jugadores</h3>

      {/* Tabla de partidas */}
      <table
        width="100%"
        cellPadding="8"
        style={{ borderCollapse: "collapse", marginBottom: 16 }}
      >
        <thead style={{ opacity: 0.75 }}>
          <tr>
            <th align="left">ID</th>
            <th align="left">Creación / sobrescrita</th>
            <th align="left">Finalizada</th>
            <th>Duración (s)</th>
            <th>Ganador</th>
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
                {r.fechaLista
                  ? new Date(r.fechaLista).toLocaleString()
                  : "-"}
              </td>
              <td>
                {r.fechaFinalizada
                  ? new Date(r.fechaFinalizada).toLocaleString()
                  : "-"}
              </td>
              <td align="center">{r.duracionSegundos ?? "-"}</td>
              <td align="center">{r.ganadorSimbolo ?? "-"}</td>
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
            Detalle de partida #{selected.partidaId} — ganador:{" "}
            <span style={{ fontWeight: 700 }}>
              {selected.ganadorSimbolo ?? "—"}
            </span>
          </h4>

          <div style={{ marginBottom: 8, fontSize: 14, opacity: 0.85 }}>
            <div>
              Jugador O: <b>{jugadorOName}</b> — Jugador X:{" "}
              <b>{jugadorXName}</b>
            </div>
            <div>
              Creación:{" "}
              <b>
                {selected.fechaCreacion
                  ? new Date(selected.fechaCreacion).toLocaleString()
                  : "-"}
              </b>{" "}
              · Finalizada:{" "}
              <b>
                {selected.fechaFinalizada
                  ? new Date(selected.fechaFinalizada).toLocaleString()
                  : "-"}
              </b>
            </div>
            <div>
              Tiempo total:{" "}
              <b>{fmtHMS(selected.duracionSegundos ?? 0)}</b> · Tiempo
              transcurrido en jugada seleccionada:{" "}
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

          {/* Tablero en el estado de la jugada seleccionada */}
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>
              ⬆ {jugadorOName} (O)
            </div>
            <Board5x5 board={board} onPickEdge={() => {}} disabled={true} />
            <div style={{ fontWeight: 700, marginTop: 4 }}>
              ⬇ {jugadorXName} (X)
            </div>
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
                  Turno {m.turno}: El jugador <b>{m.jugador}</b> retiró
                  índice {m.retiro} · {m.eje} / {m.extremo} y colocó en
                  índice {m.destino} (fila {m.destR + 1}, col{" "}
                  {m.destC + 1})
                  {m.horaUtc && (
                    <>
                      {" "}
                      · hora UTC:{" "}
                      <span style={{ fontFamily: "monospace" }}>
                        {new Date(m.horaUtc).toLocaleString()}
                      </span>
                    </>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
