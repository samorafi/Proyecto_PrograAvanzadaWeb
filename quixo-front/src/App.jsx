import { Outlet, Link, useLocation } from "react-router-dom";
import "./styles/base.css";

export default function App(){
  const { pathname } = useLocation();
  const active = (p)=> ({ fontWeight: pathname===p ? 800 : 500, opacity: pathname===p?1:.8 });
  return (
    <div className="container">
      <header style={{display:"flex",gap:16,alignItems:"center",marginBottom:16}}>
        <div style={{fontWeight:800,letterSpacing:".08em"}}>🧩 Quixo</div>
        <nav style={{marginLeft:"auto",display:"flex",gap:14}}>
          <Link to="/" style={active("/")}>Inicio</Link>
          <Link to="/new-2p" style={active("/new-2p")}>Nueva partida</Link>
          <Link to="/finalized-2p" style={active("/finalized-2p")}>Finalizadas</Link>
          <Link to="/stats" style={active("/stats")}>Estadísticas</Link>
        </nav>
      </header>
      <Outlet />
      <footer style={{marginTop:24,opacity:.6,fontSize:12}}>© 2025 — Proyecto Quixo</footer>
    </div>
  );
}
