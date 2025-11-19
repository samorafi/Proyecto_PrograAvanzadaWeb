import { useEffect, useState } from "react";
import { jugadores, partidas2p } from "../services/api";
import { useTimer, fmtHMS } from "../hooks/useTimer";
import Board5x5 from "../components/Board5x5";
import { emptyBoard, rc, pushAndInsert, hasFive } from "../utils/board";

export default function NewGame2P() {
  // ===== Estado principal =====
  const [players, setPlayers] = useState({ oId: null, xId: null, oName: "—", xName: "—" });
  const [pid, setPid] = useState(null);
  const [finished, setFinished] = useState(false);
  const [board, setBoard] = useState(emptyBoard()); // ['N'|'O'|'X'] * 25
  const [turn, setTurn] = useState("O");
  const [histXml, setHistXml] = useState("<Historial/>");
  const { seconds, reset } = useTimer(pid !== null && !finished);
  const [msg, setMsg] = useState("");

  // ===== Inicio / modo =====
  const [showStart, setShowStart] = useState(false);
  const [mode, setMode] = useState(null); // "2P" | "4P"

  // ===== Jugadores (dropdowns) =====
  const [allPlayers, setAllPlayers] = useState([]); 
  const [selO, setSelO] = useState(""); 
  const [selX, setSelX] = useState(""); 
  const [formErr, setFormErr] = useState("");
  const [loadingList, setLoadingList] = useState(false);

  // ===== Selector de extremo =====
  // pending = { i, r, c, options: [{eje, extremo, label}] }
  const [pending, setPending] = useState(null);

  // ===== Helpers =====
  const toInt = (v) => (v === "" ? null : parseInt(v, 10));

  function legalOptionsFor(r, c) {
    let opts = [
      { eje: "ROW", extremo: "START", label: "← Izquierdo (fila)" },
      { eje: "ROW", extremo: "END", label: "Derecho → (fila)" },
      { eje: "COL", extremo: "START", label: "↑ Superior (columna)" },
      { eje: "COL", extremo: "END", label: "Inferior ↓ (columna)" },
    ];
    if (r === 0) opts = opts.filter(o => !(o.eje === "COL" && o.extremo === "START"));
    if (r === 4) opts = opts.filter(o => !(o.eje === "COL" && o.extremo === "END"));
    if (c === 0) opts = opts.filter(o => !(o.eje === "ROW" && o.extremo === "START"));
    if (c === 4) opts = opts.filter(o => !(o.eje === "ROW" && o.extremo === "END"));
    return opts;
  }

  const totalJugadas = (xml) => (xml.match(/<Jugada /g) || []).length;
  const addJugada = (xml, jx) =>
    xml.trim() === "<Historial/>" ? `<Historial>${jx}</Historial>` : xml.replace("</Historial>", `${jx}</Historial>`);
  const tabXml = (b) => `<Tablero>${b.map((s, i) => `<Celda i="${i}" simbolo="${s}" />`).join("")}</Tablero>`;

  // ===== Cargar lista de jugadores =====
  async function cargarJugadores() {
    try {
      setLoadingList(true);
      const data = await jugadores.list(); 
      setAllPlayers(data);            
    } catch {
      setAllPlayers([]);
    } finally {
      setLoadingList(false);
    }
  }


  // abrir modal (carga lista)
  function abrirInicio() {
    if (pid && !finished) return; 
    setShowStart(true);
    setMode("2P");
    setSelO("");
    setSelX("");
    setFormErr("");
    cargarJugadores();
  }

  // ===== Confirmar 2P con dropdowns =====
  async function confirmar2P() {
    setFormErr("");

    const idO = toInt(selO);
    const idX = toInt(selX);

    if (!idO || !idX) { setFormErr("Debes seleccionar ambos jugadores."); return; }
    if (idO === idX) { setFormErr("No puedes seleccionar al mismo jugador para O y X."); return; }

    // localizar nombres seleccionados
    const jo = allPlayers.find(p => p.jugadorId === idO);
    const jx = allPlayers.find(p => p.jugadorId === idX);
    if (!jo || !jx) {
      setFormErr(
        <>No se encontraron los jugadores seleccionados. Si no aparecen en la lista, <a className="link" href="/registrar">regístralos aquí</a>.</>
      );
      return;
    }

    try {
      // crear partida
      const res = await partidas2p.create(jo.jugadorId, jx.jugadorId);
      setPlayers({ oId: jo.jugadorId, xId: jx.jugadorId, oName: jo.nombre, xName: jx.nombre });
      setPid(res.data.partidaId);
      setFinished(false);
      setBoard(emptyBoard());
      setTurn("O");
      setHistXml("<Historial/>");
      reset();
      setMsg("¡Partida creada! Turno: O");
      setShowStart(false);
    } catch {
      setFormErr("Error creando la partida. Verifica la API y vuelve a intentar.");
    }
  }

  // ===== Reiniciar =====
  async function reiniciar() {
    if (!pid) return;
    try {
      await partidas2p.reiniciar(pid);
      setBoard(emptyBoard());
      setHistXml("<Historial/>");
      setTurn("O");
      setFinished(false);
      reset();
      setMsg("Partida reiniciada.");
    } catch {
      setMsg("No se pudo reiniciar.");
    }
  }

  // ===== Clic en periferia =====
  async function clickPeriferia(i) {
    if (!pid || finished) return;

    const { r, c } = rc(i);
    const esPeriferia = r === 0 || r === 4 || c === 0 || c === 4;
    if (!esPeriferia) return setMsg("Solo puedes retirar de la periferia.");

    const jugadas = totalJugadas(histXml);
    if (jugadas < 25 && board[i] !== "N") return setMsg("Primera vuelta: solo cubos neutros.");
    if (board[i] === (turn === "O" ? "X" : "O")) return setMsg("No puedes retirar del símbolo rival.");

    const options = legalOptionsFor(r, c);
    setPending({ i, r, c, options });
    setMsg(`Elige un extremo para empujar (${options.length} opción${options.length === 1 ? "" : "es"}).`);
  }

  // ===== Confirmar extremo =====
  function confirmarExtremo(eje, extremo) {
    if (!pending) return;
    const { i } = pending;
    const { r, c } = rc(i);
    const index = (eje === "COL") ? c : r;

    try {
      const nb = pushAndInsert(board, eje, index, extremo, turn);
      setBoard(nb);

      const turnoNum = totalJugadas(histXml) + 1;
      const jugada = `<Jugada turno="${turnoNum}" jugador="${turn}" retiro="${i}" eje="${eje}" extremo="${extremo}" horaUtc="${new Date().toISOString()}" />`;
      const nuevoHist = addJugada(histXml, jugada);
      setHistXml(nuevoHist);
      partidas2p.jugada(pid, nuevoHist, tabXml(nb));

      const rival = turn === "O" ? "X" : "O";
      if (hasFive(nb, rival)) {
        const ganadorNombre = rival === "O" ? players.oName : players.xName;
        setMsg(`¡Gana ${ganadorNombre} (${rival})!`);
        partidas2p.finalizar(pid, seconds, rival, tabXml(nb));
        setFinished(true);
        return;
      }
      if (hasFive(nb, turn)) {
        const ganadorNombre = turn === "O" ? players.oName : players.xName;
        setMsg(`¡Gana ${ganadorNombre} (${turn})!`);
        partidas2p.finalizar(pid, seconds, turn, tabXml(nb));
        setFinished(true);
        return;
      }

      setTurn(rival);
      setMsg(`Turno: ${rival}`);
    } catch {
      setMsg("Error registrando jugada.");
    } finally {
      setPending(null);
    }
  }

  const jugando = !!pid && !finished;

  // ===== UI =====
  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Toolbar */}
      <div style={{
        display: "flex", gap: 12, alignItems: "center",
        background: "linear-gradient(180deg,#161922,#1b2030)",
        border: "1px solid #2a2f3f", borderRadius: 16, padding: 16
      }}>
        {!jugando && <button className="btn" onClick={abrirInicio}>Iniciar partida</button>}
        <button className="btn secondary" onClick={reiniciar} disabled={!pid || finished}>Reiniciar</button>
        <div style={{ marginLeft: "auto" }}>Tiempo: <b>{fmtHMS(seconds)}</b></div>
      </div>

      {/* Encabezados / Tablero */}
      <div style={{ textAlign: "center", fontWeight: 800, fontSize: 18 }}>⬆ {players.oName} (O)</div>
      <Board5x5 board={board} onPickEdge={clickPeriferia} disabled={!pid || finished} />
      <div style={{ textAlign: "center", fontWeight: 800, fontSize: 18 }}>⬇ {players.xName} (X)</div>

      <div style={{ minHeight: 24, color: "#9ec1ff" }}>{msg}</div>

      {/* Reglas rápidas */}
      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Reglas — Modo 2 jugadores</h3>
        <ul style={{ margin: "8px 0 0 18px", lineHeight: 1.6 }}>
          <li>Primera vuelta: solo <b>neutros</b>.</li>
          <li>Retira únicamente desde la <b>periferia</b>.</li>
          <li>No retires un cubo del <b>símbolo contrario</b>.</li>
          <li>Al colocar, se <b>empuja</b> por un extremo y el cubo pasa a tu símbolo.</li>
          <li>Esquinas: <b>2</b> opciones; resto del borde: <b>3</b>.</li>
          <li>No devuelvas el cubo al <b>mismo hueco</b>.</li>
          <li>Gana quien forme una <b>línea de 5</b> (H/V/D).</li>
        </ul>
      </div>

      {/* Modal de inicio */}
      {showStart && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.55)",
          display: "grid", placeItems: "center", zIndex: 50
        }}>
          <div style={{
            width: "min(720px, 92vw)", background: "#111827", color: "#e5e7eb",
            border: "1px solid #2a2f3f", borderRadius: 16, padding: 18,
            boxShadow: "0 18px 40px rgba(0,0,0,.5)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <h3 style={{ margin: "0 0 8px 0" }}>Iniciar partida</h3>
              {mode && <span style={{
                marginLeft: 8, padding: "4px 10px", background: "#243044",
                borderRadius: 999, fontSize: 12, border: "1px solid #2a2f3f"
              }}>Modo: {mode}</span>}
              <button onClick={() => setShowStart(false)} className="btn secondary" style={{ marginLeft: "auto" }}>Cerrar</button>
            </div>

            <div style={{ display: "grid", gap: 12, marginTop: 8 }}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button onClick={() => setMode("2P")} className="btn" style={{ opacity: mode === "2P" ? 1 : .92 }}>
                  Modo 2 jugadores
                </button>
                <button disabled title="Próximamente" className="btn secondary" style={{ opacity: .6, cursor: "not-allowed" }}>
                  Modo 4 jugadores
                </button>
                <button onClick={cargarJugadores} className="btn secondary" title="Actualizar lista" disabled={loadingList}>
                  {loadingList ? "Actualizando..." : "Actualizar"}
                </button>
                <a href="/registrar" className="btn secondary">Registrar jugador</a>
              </div>

              {mode === "2P" && (
                <div className="panel" style={{ padding: 14 }}>
                  <div style={{ display: "grid", gap: 12 }}>
                    <div>
                      <label>Jugador O (arriba)</label>
                      <select className="input" value={selO} onChange={e => setSelO(e.target.value)}>
                        <option value="">— Seleccionar —</option>
                        {allPlayers.map(p => (
                          <option key={p.jugadorId} value={String(p.jugadorId)}>{p.nombre}</option>
                        ))}
                      </select>

                    </div>
                    <div>
                      <label>Jugador X (abajo)</label>
                      <select className="input" value={selX} onChange={e => setSelX(e.target.value)}>
                        <option value="">— Seleccionar —</option>
                        {allPlayers.map(p => (
                          <option key={p.jugadorId} value={String(p.jugadorId)}>{p.nombre}</option>
                        ))}
                      </select>
                    </div>

                    {formErr && <div style={{ color: "#ff8fa3", fontWeight: 700 }}>{formErr}</div>}
                    <div style={{ display: "flex", gap: 10 }}>
                      <button className="btn" onClick={confirmar2P} disabled={loadingList}>Comenzar</button>
                      <button className="btn secondary" onClick={() => setShowStart(false)}>Cancelar</button>
                    </div>
                  </div>
                </div>
              )}

              {!mode && <div style={{ opacity: .75 }}>Selecciona un modo para continuar.</div>}
            </div>
          </div>
        </div>
      )}

      {/* Selector de extremo */}
      {pending && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.55)",
          display: "grid", placeItems: "center", zIndex: 60
        }}>
          <div style={{
            background: "#111827", color: "#e5e7eb", padding: 16, borderRadius: 12,
            border: "1px solid #2a2f3f", width: 360
          }}>
            <h4 style={{ margin: "0 0 10px 0" }}>Elegir extremo</h4>
            <p style={{ margin: "0 0 12px 0", opacity: .85 }}>
              Este cubo tiene {pending.options.length} movimiento{pending.options.length === 1 ? "" : "s"} posible{pending.options.length === 1 ? "" : "s"}.
            </p>
            <div style={{ display: "grid", gap: 10 }}>
              {pending.options.map((o, idx) => (
                <button key={idx} className="btn" onClick={() => confirmarExtremo(o.eje, o.extremo)}>
                  {o.label}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 12 }}>
              <button className="btn secondary" onClick={() => setPending(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
