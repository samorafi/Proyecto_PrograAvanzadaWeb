import { Link } from "react-router-dom";

export default function Inicio() {
  return (
    <div className="grid" style={{ gap: 20 }}>
      {/* HERO */}
      <div className="hero">
        <div style={{ fontSize: 60, lineHeight: 1 }}>🟫</div>
        <div>
          <h1>Juego Quixo</h1>
          <p>¡Crea una línea de 5! Modos 2 y 4 jugadores, historial y estadísticas.</p>
        </div>
      </div>

      {/* TARJETAS PRINCIPALES */}
      <div className="grid grid-4">
        {/* Registrar jugador */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}>👤</span>
            <h3>Registrar jugador</h3>
          </div>
          <p>Crea un jugador por su nombre para usarlo en partidas.</p>
          <div className="actions">
            <Link to="/registrar">
              <button className="btn">Registrar</button>
            </Link>
          </div>
        </div>

        {/* Nueva partida 2 jugadores */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}>🎮</span>
            <h3>Jugar una partida (2 jugadores)</h3>
          </div>
          <p>Tablero 5×5, reloj y turnos O/X.</p>
          <div className="actions">
            <Link to="/new-2p">
              <button className="btn">Nueva partida 2J</button>
            </Link>
          </div>
        </div>

        {/* Nueva partida 4 jugadores */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}>🎮🎮</span>
            <h3>Jugar una partida (4 jugadores)</h3>
          </div>
          <p>Dos equipos, orientación de puntos y reglas avanzadas.</p>
          <div className="actions">
            <Link to="/new-4p">
              <button className="btn">Nueva partida 4J</button>
            </Link>
          </div>
        </div>

        {/* Partidas finalizadas 2 jugadores */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}>📄</span>
            <h3>Partidas finalizadas (2 jugadores)</h3>
          </div>
          <p>Historial completo y exportable a XML.</p>
          <div className="actions">
            <Link to="/finalized-2p">
              <button className="btn">Ver finalizadas 2J</button>
            </Link>
          </div>
        </div>

        {/* Partidas finalizadas 4 jugadores */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}>📄📄</span>
            <h3>Partidas finalizadas (4 jugadores)</h3>
          </div>
          <p>Historial completo y exportable a XML.</p>
          <div className="actions">
            <Link to="/finalized-4p">
              <button className="btn">Ver finalizadas 4J</button>
            </Link>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}>📊</span>
            <h3>Mostrar estadísticas</h3>
          </div>
          <p>Efectividad y victorias por jugador (2J y 4J próximamente).</p>
          <div className="actions">
            <Link to="/stats">
              <button className="btn">Ver estadísticas</button>
            </Link>
          </div>
        </div>
      </div>

      {/* Reglas rápidas */}
      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Reglas clave del turno</h3>
        <div className="grid" style={{ gap: 12 }}>
          <div className="kpi ok">✔ Primera vuelta: retirar <b>neutros</b>.</div>
          <div className="kpi warn">↔ Empuja por los <b>extremos</b> de la fila/columna.</div>
          <div className="kpi bad">⛔ No retires del <b>símbolo rival</b> ni devuelvas al mismo hueco.</div>
        </div>
      </div>
    </div>
  );
}