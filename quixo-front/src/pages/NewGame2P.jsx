// src/pages/NewGame2P.jsx
import { useState } from "react";
import { jugadores, partidas2p } from "../services/api";
import { useTimer, fmtHMS } from "../hooks/useTimer";
import Board5x5 from "../components/Board5x5";
import { emptyBoard, rc, pushAndInsert, hasFive } from "../utils/board";

export default function NewGame2P() {
  // ===== Estado de partida =====
  const [players, setPlayers] = useState({ oId:null, xId:null, oName:"—", xName:"—" });
  const [pid, setPid] = useState(null);
  const [finished, setFinished] = useState(false);
  const [board, setBoard] = useState(emptyBoard()); // ['N'|'O'|'X'] * 25
  const [turn, setTurn] = useState("O");            // 'O' | 'X'
  const [histXml, setHistXml] = useState("<Historial/>");
  const { seconds, reset } = useTimer(pid !== null && !finished);
  const [msg, setMsg] = useState("");

  // ===== Modal de inicio / selección de modo =====
  const [showStart, setShowStart] = useState(false);
  const [mode, setMode] = useState(null); // "2P" | "4P"
  const [nameO, setNameO] = useState("");
  const [nameX, setNameX] = useState("");
  const [formErr, setFormErr] = useState("");

  // ===== Selector de extremo para la jugada =====
  const [pending, setPending] = useState(null);

  // ===== Helpers XML =====
  const totalJugadas = (xml) => (xml.match(/<Jugada /g) || []).length;
  const addJugada = (xml, jx) =>
    xml.trim() === "<Historial/>" ? `<Historial>${jx}</Historial>` : xml.replace("</Historial>", `${jx}</Historial>`);
  const tabXml = (b) => `<Tablero>${b.map((s,i)=>`<Celda i="${i}" simbolo="${s}" />`).join("")}</Tablero>`;

  // ===== Casilla retirada (3 en borde, 2 en esquina) =====
  function legalOptionsFor(r, c) {
    let opts = [
      { eje: "ROW", extremo: "START", label: "← Izquierdo (fila)" },
      { eje: "ROW", extremo: "END",   label: "Derecho → (fila)"   },
      { eje: "COL", extremo: "START", label: "↑ Superior (columna)" },
      { eje: "COL", extremo: "END",   label: "Inferior ↓ (columna)" },
    ];
    // Evitar devolver al mismo hueco:
    if (r === 0) opts = opts.filter(o => !(o.eje === "COL" && o.extremo === "START")); // quitaste arriba
    if (r === 4) opts = opts.filter(o => !(o.eje === "COL" && o.extremo === "END"));   // quitaste abajo
    if (c === 0) opts = opts.filter(o => !(o.eje === "ROW" && o.extremo === "START")); // quitaste izquierda
    if (c === 4) opts = opts.filter(o => !(o.eje === "ROW" && o.extremo === "END"));   // quitaste derecha
    return opts; // devolverá 3 (borde) o 2 (esquina)
  }

  // ===== Abrir modal inicio =====
  function abrirInicio() {
    if (pid && !finished) return; // no abrir si ya se juega
    setShowStart(true);
    setMode(null);
    setNameO(""); setNameX(""); setFormErr("");
  }

  // ===== Validación de nombres =====
  async function validarNombres() {
    if (!nameO.trim() || !nameX.trim()) return "Debes ingresar ambos nombres.";
    if (nameO.trim().toLowerCase() === nameX.trim().toLowerCase()) return "Los nombres deben ser diferentes.";
    const [exO, exX] = await Promise.all([
      jugadores.exists(nameO.trim()),
      jugadores.exists(nameX.trim()),
    ]);
    if (exO.data?.exists) return `Nombre ya existente: "${nameO.trim()}". Ingresa un nombre diferente.`;
    if (exX.data?.exists) return `Nombre ya existente: "${nameX.trim()}". Ingresa un nombre diferente.`;
    return "";
  }

  // ===== Confirmar y crear partida 2J =====
  async function confirmar2P() {
    const err = await validarNombres();
    if (err) { setFormErr(err); return; }

    try {
      const [o, x] = await Promise.all([
        jugadores.create(nameO.trim()),
        jugadores.create(nameX.trim()),
      ]);
      const res = await partidas2p.create(o.data.jugadorId, x.data.jugadorId);

      setPlayers({ oId:o.data.jugadorId, xId:x.data.jugadorId, oName:o.data.nombre, xName:x.data.nombre });
      setPid(res.data.partidaId);
      setFinished(false);
      setBoard(emptyBoard());
      setTurn("O");
      setHistXml("<Historial/>");
      reset();
      setMsg("¡Partida creada! Turno: O");
      setShowStart(false);
    } catch {
      setFormErr("No se pudo crear la partida.");
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

  // ===== Clic en un cubo de periferia -> abrir selector de extremo =====
  async function clickPeriferia(i) {
    if (!pid || finished) return;

    const { r, c } = rc(i);
    const esPeriferia = r===0 || r===4 || c===0 || c===4;
    if (!esPeriferia) return setMsg("Solo puedes retirar de la periferia.");

    const jugadas = totalJugadas(histXml);
    if (jugadas < 25 && board[i] !== "N") return setMsg("Primera vuelta: solo cubos neutros.");
    if (board[i] === (turn === "O" ? "X" : "O")) return setMsg("No puedes retirar del símbolo rival.");

    const options = legalOptionsFor(r, c); // 3 o 2, según borde/esquina
    setPending({ i, r, c, options });
    setMsg(`Elige un extremo para empujar (${options.length} opción${options.length===1?"":"es"}).`);
  }

  // ===== Confirmar extremo -> realizar jugada =====
  async function confirmarExtremo(eje, extremo) {
    if (!pending) return;
    const { i } = pending;
    const { r, c } = rc(i);
    const index = (eje === "COL") ? c : r;

    try {
      const nb = pushAndInsert(board, eje, index, extremo, turn);
      setBoard(nb);

      const jugadas = totalJugadas(histXml);
      const jugada = `<Jugada turno="${jugadas+1}" jugador="${turn}" retiro="${i}" eje="${eje}" extremo="${extremo}" horaUtc="${new Date().toISOString()}" />`;
      const nuevoHist = addJugada(histXml, jugada);
      setHistXml(nuevoHist);
      await partidas2p.jugada(pid, nuevoHist, tabXml(nb));

      const rival = turn === "O" ? "X" : "O";
      // Si por el desplazamiento aparece línea del rival - se pierde
      if (hasFive(nb, rival)) {
        const ganadorNombre = rival === "O" ? players.oName : players.xName;
        setMsg(`¡Gana ${ganadorNombre} (${rival})!`);
        await partidas2p.finalizar(pid, seconds, rival, tabXml(nb));
        setFinished(true);
        return;
      }
      // Si aparece tu propia línea - se gana
      if (hasFive(nb, turn)) {
        const ganadorNombre = turn === "O" ? players.oName : players.xName;
        setMsg(`¡Gana ${ganadorNombre} (${turn})!`);
        await partidas2p.finalizar(pid, seconds, turn, tabXml(nb));
        setFinished(true);
        return;
      }

      // Cambiar turno
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
    <div style={{ display:"grid", gap:16 }}>
      {/* Toolbar */}
      <div style={{
        display:"flex", gap:12, alignItems:"center",
        background:"linear-gradient(180deg,#161922,#1b2030)",
        border:"1px solid #2a2f3f", borderRadius:16, padding:16
      }}>
        {!jugando && <button className="btn" onClick={abrirInicio}>Iniciar partida</button>}
        <button className="btn secondary" onClick={reiniciar} disabled={!pid || finished}>Reiniciar</button>
        <div style={{ marginLeft:"auto" }}>Tiempo: <b>{fmtHMS(seconds)}</b></div>
      </div>

      {/* Encabezados / Tablero */}
      <div style={{ textAlign:"center", fontWeight:800, fontSize:18 }}>⬆ {players.oName} (O)</div>
      <Board5x5 board={board} onPickEdge={clickPeriferia} disabled={!pid || finished} />
      <div style={{ textAlign:"center", fontWeight:800, fontSize:18 }}>⬇ {players.xName} (X)</div>

      <div style={{ minHeight:24, color:"#9ec1ff" }}>{msg}</div>

      {/* Reglas rápidas */}
      <div className="panel">
        <h3 style={{marginTop:0}}>Reglas — Modo 2 jugadores</h3>
        <ul style={{margin:"8px 0 0 18px", lineHeight:1.6}}>
          <li>Primera vuelta: solo <b>neutros</b>.</li>
          <li>Retira únicamente desde la <b>periferia</b>.</li>
          <li>No retires un cubo del <b>símbolo contrario</b>.</li>
          <li>Al colocar, se <b>empuja</b> por un extremo y el cubo pasa a tu símbolo.</li>
          <li>Las esquinas tienen <b>2 movimientos</b> y el resto del borde <b>3</b>.</li>
          <li>No devuelvas el cubo al <b>mismo hueco</b>.</li>
          <li>Gana quien forme una <b>línea de 5</b> (H/V/D).</li>
        </ul>
      </div>

      {/* Modal de inicio (modo + nombres) */}
      {showStart && (
        <div style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,.55)",
          display:"grid", placeItems:"center", zIndex:50
        }}>
          <div style={{
            width:"min(720px, 92vw)", background:"#111827", color:"#e5e7eb",
            border:"1px solid #2a2f3f", borderRadius:16, padding:18,
            boxShadow:"0 18px 40px rgba(0,0,0,.5)"
          }}>
            <div style={{display:"flex", alignItems:"center", gap:12}}>
              <h3 style={{margin:"0 0 8px 0"}}>Iniciar partida</h3>
              {mode && <span style={{
                marginLeft:8, padding:"4px 10px", background:"#243044",
                borderRadius:999, fontSize:12, border:"1px solid #2a2f3f"
              }}>Modo: {mode}</span>}
              <button onClick={()=>setShowStart(false)} className="btn secondary" style={{marginLeft:"auto"}}>Cerrar</button>
            </div>

            <div style={{display:"grid", gap:12, marginTop:8}}>
              <div style={{display:"flex", gap:12, flexWrap:"wrap"}}>
                <button onClick={()=>setMode("2P")} className="btn" style={{opacity: mode==="2P"?1:.92}}>
                  Modo 2 jugadores
                </button>
                <button disabled title="Próximamente" className="btn secondary" style={{opacity:.6,cursor:"not-allowed"}}>
                  Modo 4 jugadores
                </button>
              </div>

              {mode==="2P" && (
                <div className="panel" style={{padding:14}}>
                  <div style={{display:"grid", gap:12}}>
                    <div>
                      <label>Nombre jugador O (arriba)</label>
                      <input value={nameO} onChange={e=>setNameO(e.target.value)} placeholder="Ej: Ana" style={inputStyle}/>
                    </div>
                    <div>
                      <label>Nombre jugador X (abajo)</label>
                      <input value={nameX} onChange={e=>setNameX(e.target.value)} placeholder="Ej: Luis" style={inputStyle}/>
                    </div>
                    {formErr && <div style={{color:"#ff8fa3", fontWeight:700}}>{formErr}</div>}
                    <div style={{display:"flex", gap:10}}>
                      <button className="btn" onClick={confirmar2P}>Comenzar</button>
                      <button className="btn secondary" onClick={()=>setShowStart(false)}>Cancelar</button>
                    </div>
                  </div>
                </div>
              )}

              {!mode && <div style={{opacity:.75}}>Selecciona un modo para continuar.</div>}
            </div>
          </div>
        </div>
      )}

      {/* Selector de extremo con 2–3 opciones */}
      {pending && (
        <div style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,.55)",
          display:"grid", placeItems:"center", zIndex:60
        }}>
          <div style={{
            background:"#111827", color:"#e5e7eb", padding:16, borderRadius:12,
            border:"1px solid #2a2f3f", width:360
          }}>
            <h4 style={{margin:"0 0 10px 0"}}>Elegir extremo</h4>
            <p style={{margin:"0 0 12px 0", opacity:.85}}>
              Este cubo tiene {pending.options.length} movimiento{pending.options.length===1?"":"s"} posible{pending.options.length===1?"":"s"}.
            </p>
            <div style={{display:"grid", gap:10}}>
              {pending.options.map((o, idx) => (
                <button key={idx} className="btn" onClick={() => confirmarExtremo(o.eje, o.extremo)}>
                  {o.label}
                </button>
              ))}
            </div>
            <div style={{marginTop:12}}>
              <button className="btn secondary" onClick={()=>setPending(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width:"100%", padding:"10px 12px", borderRadius:10, border:"1px solid #2a2f3f",
  background:"#0f1424", color:"#e5e7eb", outline:"none"
};
