import { Link } from "react-router-dom";

export default function Inicio(){
  return (
    <div className="grid" style={{gap:20}}>
      {/* HERO */}
      <div className="hero">
        <div style={{fontSize:60,lineHeight:1}}>🟫</div>
        <div>
          <h1>Juego Quixo</h1>
          <p>¡Crea una línea de 5! Modo 2 jugadores, historial y estadísticas.</p>
        </div>
      </div>

      {/* TARJETAS PRINCIPALES */}
      <div className="grid grid-3">
        <div className="card">
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:22}}>🎮</span>
            <h3>Jugar una partida nueva</h3>
          </div>
          <p>Inicia un tablero 5×5 con cubos neutros, reloj y turnos O/X.</p>
          <div className="actions">
            <Link to="/new-2p"><button className="btn">Nueva partida</button></Link>
          </div>
        </div>

        <div className="card">
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:22}}>📄</span>
            <h3>Mostrar y exportar una partida finalizada</h3>
          </div>
          <p>Revisa partidas cerradas y descarga su XML (historial + tablero).</p>
          <div className="actions">
            <Link to="/finalized-2p"><button className="btn secondary">Ver finalizadas</button></Link>
          </div>
        </div>

        <div className="card">
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:22}}>📊</span>
            <h3>Mostrar estadísticas</h3>
          </div>
          <p>Efectividad y victorias por jugador (modo 2J).</p>
          <div className="actions">
            <Link to="/stats"><button className="btn">Ver estadísticas</button></Link>
          </div>
        </div>
      </div>

      {/* BLOQUE INFORMATIVO (opcional) */}
      <div className="panel">
        <h3 style={{marginTop:0}}>Reglas clave del turno</h3>
        <div className="grid" style={{gap:12}}>
          <div className="kpi ok">✔ Primera vuelta: retirar <b>neutros</b>.</div>
          <div className="kpi warn">↔ Empuja por los <b>extremos</b> de la fila/columna.</div>
          <div className="kpi bad">⛔ No retires del <b>símbolo rival</b> ni devuelvas al mismo hueco.</div>
        </div>
      </div>
    </div>
  );
}
