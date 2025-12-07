import { useState } from "react";
import { jugadores, partidas4p } from "../services/api";
import { useTimer, fmtHMS } from "../hooks/useTimer";
import Board5x5_4P from "../components/Board5x5_4P";
import {
  emptyBoard4P,
  rc4,
  pushAndInsert4P,
  hasFive4P,
  board4PToXml,
  appendHistory4P,
  isEdge4P,
} from "../utils/board4p";

export default function NewGame4P() {
  const [players, setPlayers] = useState({
    a1Id: null,
    a2Id: null,
    b1Id: null,
    b2Id: null,
    a1Name: "—",
    a2Name: "—",
    b1Name: "—",
    b2Name: "—",
  });

  const [pid, setPid] = useState(null);
  const [finished, setFinished] = useState(false);
  const [board, setBoard] = useState(emptyBoard4P());
  const [currentPlayer, setCurrentPlayer] = useState("A1"); // "A1" | "B1" | "A2" | "B2"
  const [firstLapDone, setFirstLapDone] = useState(false);
  const [histXml, setHistXml] = useState("<Historial/>");
  const { seconds, reset } = useTimer(pid !== null && !finished);
  const [msg, setMsg] = useState("");

  const [showStart, setShowStart] = useState(false);
  const [allPlayers, setAllPlayers] = useState([]);
  const [selA1, setSelA1] = useState("");
  const [selA2, setSelA2] = useState("");
  const [selB1, setSelB1] = useState("");
  const [selB2, setSelB2] = useState("");
  const [formErr, setFormErr] = useState("");
  const [loadingList, setLoadingList] = useState(false);

  const [pending, setPending] = useState(null);
  const turnOrder = ["A1", "B1", "A2", "B2"];

  const toInt = (v) => (v === "" ? null : parseInt(v, 10));

  function legalOptionsFor(r, c) {
    let opts = [
      { eje: "ROW", extremo: "START", label: "← Izquierdo (fila)" },
      { eje: "ROW", extremo: "END", label: "Derecho → (fila)" },
      { eje: "COL", extremo: "START", label: "↑ Superior (columna)" },
      { eje: "COL", extremo: "END", label: "Inferior ↓ (columna)" },
    ];
    if (r === 0) opts = opts.filter((o) => !(o.eje === "COL" && o.extremo === "START"));
    if (r === 4) opts = opts.filter((o) => !(o.eje === "COL" && o.extremo === "END"));
    if (c === 0) opts = opts.filter((o) => !(o.eje === "ROW" && o.extremo === "START"));
    if (c === 4) opts = opts.filter((o) => !(o.eje === "ROW" && o.extremo === "END"));
    return opts;
  }

  const totalJugadas = (xml) => (xml.match(/<Jugada /g) || []).length;

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

  function abrirInicio() {
    if (pid && !finished) return;
    setShowStart(true);
    setSelA1("");
    setSelA2("");
    setSelB1("");
    setSelB2("");
    setFormErr("");
    cargarJugadores();
  }

  async function confirmar4P() {
    setFormErr("");

    const idA1 = toInt(selA1);
    const idA2 = toInt(selA2);
    const idB1 = toInt(selB1);
    const idB2 = toInt(selB2);

    if (!idA1 || !idA2 || !idB1 || !idB2) {
      setFormErr("Debes seleccionar los 4 jugadores.");
      return;
    }

    const ids = [idA1, idA2, idB1, idB2];
    const uniq = new Set(ids);
    if (uniq.size !== 4) {
      setFormErr("Cada posición debe tener un jugador distinto.");
      return;
    }

    const a1 = allPlayers.find((p) => p.jugadorId === idA1);
    const a2 = allPlayers.find((p) => p.jugadorId === idA2);
    const b1 = allPlayers.find((p) => p.jugadorId === idB1);
    const b2 = allPlayers.find((p) => p.jugadorId === idB2);

    if (!a1 || !a2 || !b1 || !b2) {
      setFormErr(
        <>No se encontraron uno o más jugadores. Si faltan, <a className="link" href="/registrar">regístralos aquí</a>.</>
      );
      return;
    }

    try {
      const res = await partidas4p.create(a1.jugadorId, a2.jugadorId, b1.jugadorId, b2.jugadorId);

      setPlayers({
        a1Id: a1.jugadorId,
        a2Id: a2.jugadorId,
        b1Id: b1.jugadorId,
        b2Id: b2.jugadorId,
        a1Name: a1.nombre,
        a2Name: a2.nombre,
        b1Name: b1.nombre,
        b2Name: b2.nombre,
      });

      setPid(res.data.partidaId);
      setFinished(false);
      setBoard(emptyBoard4P());
      setCurrentPlayer("A1");
      setHistXml("<Historial/>");
      reset();
      setFirstLapDone(false);
      setMsg("¡Partida 4 jugadores creada! Turno: A1");
      setShowStart(false);
    } catch {
      setFormErr("Error creando la partida. Verifica la API y vuelve a intentar.");
    }
  }

  function reiniciar() {
    if (!pid) return;
    setBoard(emptyBoard4P());
    setHistXml("<Historial/>");
    setCurrentPlayer("A1");
    setFinished(false);
    reset();
    setFirstLapDone(false);
    setMsg("Partida reiniciada.");
  }

  function defaultPointTarget(subPlayer) {
    if (subPlayer === "A1") return "A2";
    if (subPlayer === "A2") return "A1";
    if (subPlayer === "B1") return "B2";
    if (subPlayer === "B2") return "B1";
    return subPlayer;
  }

  function clickPeriferia(i) {
    if (!pid || finished) return;

    const { r, c } = rc4(i);

    if (!isEdge4P(i)) {
      setMsg("Solo puedes retirar de la periferia.");
      return;
    }

    if (!firstLapDone && board[i].symbol !== "N") {
      setMsg("Primera vuelta: solo cubos neutros.");
      return;
    }

    const options = legalOptionsFor(r, c);
    const pointTarget = defaultPointTarget(currentPlayer);
    setPending({
      i,
      r,
      c,
      options,
      pointTarget,
    });

    setMsg(
      `Cubo seleccionado. Elige un extremo para empujar (${options.length} opción${options.length === 1 ? "" : "es"
      }).`
    );
  }

  function cambiarOrientacionPunto(nuevo) {
    if (!pending) return;
    setPending({
      ...pending,
      pointTarget: nuevo,
    });
  }

  async function confirmarExtremo(eje, extremo) {
    if (!pending) return;

    const { i, r, c, pointTarget } = pending;
    const index = eje === "COL" ? c : r;

    const myTeam = currentPlayer.startsWith("A") ? "A" : "B";
    const mySymbol = myTeam === "A" ? "O" : "X";
    const enemyTeam = myTeam === "A" ? "B" : "A";
    const enemySymbol = enemyTeam === "A" ? "O" : "X";

    try {
      const nb = pushAndInsert4P(board, eje, index, extremo, mySymbol, pointTarget, i);

      if (!firstLapDone) {
        const peripheryFull = nb.every(
          (cell, idx) => !isEdge4P(idx) || cell.symbol !== "N"
        );
        if (peripheryFull) {
          setFirstLapDone(true);
        }
      }

      setBoard(nb);

      const jugada = {
        jugador: currentPlayer,
        retirado: i,
        eje,
        index,
        extremo,
        symbol: mySymbol,
        point: pointTarget,
      };

      const snapshot = [...nb];
      const nuevoHist = appendHistory4P(histXml, jugada, snapshot);
      setHistXml(nuevoHist);

      const tableroXml = board4PToXml(snapshot);
      await partidas4p.jugada(pid, nuevoHist, tableroXml);

      if (hasFive4P(nb, enemySymbol)) {
        const ganadorEquipo = enemyTeam;
        const ganadorNombres =
          ganadorEquipo === "A"
            ? `${players.a1Name} y ${players.a2Name}`
            : `${players.b1Name} y ${players.b2Name}`;

        setMsg(`¡Gana el equipo ${ganadorEquipo} (${ganadorNombres})!`);
        partidas4p.finalizar(pid, seconds, ganadorEquipo, tableroXml);
        setFinished(true);
        setPending(null);
        return;
      }

      if (hasFive4P(nb, mySymbol)) {
        const ganadorEquipo = myTeam;
        const ganadorNombres =
          ganadorEquipo === "A"
            ? `${players.a1Name} y ${players.a2Name}`
            : `${players.b1Name} y ${players.b2Name}`;

        setMsg(`¡Gana el equipo ${ganadorEquipo} (${ganadorNombres})!`);
        partidas4p.finalizar(pid, seconds, ganadorEquipo, tableroXml);
        setFinished(true);
        setPending(null);
        return;
      }

      const currentIndex = turnOrder.indexOf(currentPlayer);
      const nextPlayer = turnOrder[(currentIndex + 1) % turnOrder.length];
      setCurrentPlayer(nextPlayer);
      setMsg(`Turno: ${nextPlayer}`);
    } catch {
      setMsg("Error registrando jugada.");
    } finally {
      setPending(null);
    }
  }


  const jugando = !!pid && !finished;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          background: "linear-gradient(180deg,#161922,#1b2030)",
          border: "1px solid #2a2f3f",
          borderRadius: 16,
          padding: 16,
        }}
      >
        {!jugando && (
          <button className="btn" onClick={abrirInicio}>
            Iniciar partida 4 jugadores
          </button>
        )}
        <button className="btn secondary" onClick={reiniciar} disabled={!pid || finished}>
          Reiniciar
        </button>
        <div style={{ marginLeft: "auto" }}>
          Tiempo: <b>{fmtHMS(seconds)}</b>
        </div>
      </div>

      <div style={{ textAlign: "center", fontWeight: 800, fontSize: 18 }}>
        ⬆ {players.a1Name} (A1 · O)
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto auto auto",
          alignItems: "center",
          justifyContent: "center",
          columnGap: 24,
        }}
      >
        <div style={{ textAlign: "right", fontWeight: 800, minWidth: 140 }}>
          ⬅ {players.b2Name} (B2 · X)
        </div>

        <Board5x5_4P
          board={board}
          currentPlayer={currentPlayer}
          onPickEdge={clickPeriferia}
          disabled={!pid || finished}
        />

        <div style={{ textAlign: "left", fontWeight: 800, minWidth: 140 }}>
          {players.b1Name} (B1 · X) ➡
        </div>
      </div>

      <div style={{ textAlign: "center", fontWeight: 800, fontSize: 18 }}>
        ⬇ {players.a2Name} (A2 · O)
      </div>

      <div style={{ minHeight: 24, color: "#9ec1ff" }}>{msg}</div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Reglas — Modo 4 jugadores</h3>
        <ul style={{ margin: "8px 0 0 18px", lineHeight: 1.6 }}>
          <li>Equipo A (círculo O): jugadores A1 (arriba) y A2 (abajo).</li>
          <li>Equipo B (cruz X): jugadores B1 (derecha) y B2 (izquierda).</li>
          <li>Turnos en sentido horario: A1 → B1 → A2 → B2 → A1…</li>
          <li>Primera vuelta: cada jugador debe retirar un cubo <b>neutro</b>.</li>
          <li>Solo se retira desde la <b>periferia</b> del tablero.</li>
          <li>No se puede retirar un cubo del <b>símbolo rival</b>.</li>
          <li>
            El <b>punto</b> indica quién del equipo puede volver a jugar ese cubo (A1/A2 o B1/B2).
          </li>
          <li>Al empujar, el cubo jugado pasa a tu símbolo y se orienta al jugador elegido.</li>
          <li>Gana el equipo que forme una <b>línea de 5</b> (H/V/D) de su símbolo.</li>
          <li>
            Si formas una línea completa con el símbolo del equipo contrario, tu equipo <b>pierde</b>.
          </li>
        </ul>
      </div>

      {showStart && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.55)",
            display: "grid",
            placeItems: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              width: "min(780px, 92vw)",
              background: "#111827",
              color: "#e5e7eb",
              border: "1px solid #2a2f3f",
              borderRadius: 16,
              padding: 18,
              boxShadow: "0 18px 40px rgba(0,0,0,.5)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <h3 style={{ margin: "0 0 8px 0" }}>Iniciar partida — Modo 4 jugadores</h3>
              <button
                onClick={() => setShowStart(false)}
                className="btn secondary"
                style={{ marginLeft: "auto" }}
              >
                Cerrar
              </button>
            </div>

            <div className="panel" style={{ marginTop: 10, padding: 14 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                <div>
                  <label>Equipo A — Jugador A1 (arriba)</label>
                  <select
                    className="input"
                    value={selA1}
                    onChange={(e) => setSelA1(e.target.value)}
                  >
                    <option value="">— Seleccionar —</option>
                    {allPlayers.map((p) => (
                      <option key={p.jugadorId} value={String(p.jugadorId)}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Equipo A — Jugador A2 (abajo)</label>
                  <select
                    className="input"
                    value={selA2}
                    onChange={(e) => setSelA2(e.target.value)}
                  >
                    <option value="">— Seleccionar —</option>
                    {allPlayers.map((p) => (
                      <option key={p.jugadorId} value={String(p.jugadorId)}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Equipo B — Jugador B1 (derecha)</label>
                  <select
                    className="input"
                    value={selB1}
                    onChange={(e) => setSelB1(e.target.value)}
                  >
                    <option value="">— Seleccionar —</option>
                    {allPlayers.map((p) => (
                      <option key={p.jugadorId} value={String(p.jugadorId)}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Equipo B — Jugador B2 (izquierda)</label>
                  <select
                    className="input"
                    value={selB2}
                    onChange={(e) => setSelB2(e.target.value)}
                  >
                    <option value="">— Seleccionar —</option>
                    {allPlayers.map((p) => (
                      <option key={p.jugadorId} value={String(p.jugadorId)}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formErr && (
                <div style={{ color: "#ff8fa3", fontWeight: 700, marginTop: 10 }}>{formErr}</div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button className="btn" onClick={confirmar4P} disabled={loadingList}>
                  Comenzar
                </button>
                <button className="btn secondary" onClick={() => setShowStart(false)}>
                  Cancelar
                </button>
                <button
                  className="btn secondary"
                  onClick={cargarJugadores}
                  disabled={loadingList}
                >
                  {loadingList ? "Actualizando..." : "Actualizar lista"}
                </button>
                <a href="/registrar" className="btn secondary">
                  Registrar jugador
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {pending && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.55)",
            display: "grid",
            placeItems: "center",
            zIndex: 60,
          }}
        >
          <div
            style={{
              background: "#111827",
              color: "#e5e7eb",
              padding: 16,
              borderRadius: 12,
              border: "1px solid #2a2f3f",
              width: 420,
            }}
          >
            <h4 style={{ margin: "0 0 10px 0" }}>Elegir extremo y orientación</h4>
            <p style={{ margin: "0 0 12px 0", opacity: 0.85 }}>
              Este cubo tiene {pending.options.length} movimiento
              {pending.options.length === 1 ? "" : "s"} posible
              {pending.options.length === 1 ? "" : "s"}.
            </p>

            <div style={{ marginBottom: 12 }}>
              <label>Orientar el punto hacia:</label>
              <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                {currentPlayer.startsWith("A") ? (
                  <>
                    <button
                      className="btn secondary"
                      style={{
                        opacity: pending.pointTarget === "A1" ? 1 : 0.7,
                      }}
                      onClick={() => cambiarOrientacionPunto("A1")}
                    >
                      A1
                    </button>
                    <button
                      className="btn secondary"
                      style={{
                        opacity: pending.pointTarget === "A2" ? 1 : 0.7,
                      }}
                      onClick={() => cambiarOrientacionPunto("A2")}
                    >
                      A2
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn secondary"
                      style={{
                        opacity: pending.pointTarget === "B1" ? 1 : 0.7,
                      }}
                      onClick={() => cambiarOrientacionPunto("B1")}
                    >
                      B1
                    </button>
                    <button
                      className="btn secondary"
                      style={{
                        opacity: pending.pointTarget === "B2" ? 1 : 0.7,
                      }}
                      onClick={() => cambiarOrientacionPunto("B2")}
                    >
                      B2
                    </button>
                  </>
                )}
              </div>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {pending.options.map((o, idx) => (
                <button
                  key={idx}
                  className="btn"
                  onClick={() => confirmarExtremo(o.eje, o.extremo)}
                >
                  {o.label}
                </button>
              ))}
            </div>

            <div style={{ marginTop: 12 }}>
              <button className="btn secondary" onClick={() => setPending(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}