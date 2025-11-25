import { Outlet, Link, useLocation } from "react-router-dom";
import "./styles/base.css";

export default function App() {
  const { pathname } = useLocation();
  const active = (p) => ({
    fontWeight: pathname === p ? 800 : 500,
    opacity: pathname === p ? 1 : 0.8,
  });

  return (
    <div className="container">
      <header
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div style={{ fontWeight: 800, letterSpacing: ".08em" }}>🧩 Quixo</div>

        <nav style={{ marginLeft: "auto", display: "flex", gap: 14 }}>
          <Link to="/" style={active("/")}>
            Inicio
          </Link>

          {/* ====== 2 JUGADORES ====== */}
          <Link to="/new-2p" style={active("/new-2p")}>
            Nueva partida 2P
          </Link>
          <Link to="/finalized-2p" style={active("/finalized-2p")}>
            Finalizadas 2P
          </Link>

          {/* ====== 4 JUGADORES ====== */}
          <Link to="/new-4p" style={active("/new-4p")}>
            Nueva partida 4P
          </Link>
          <Link to="/finalized-4p" style={active("/finalized-4p")}>
            Finalizadas 4P
          </Link>

          {/* ====== Estadísticas ====== */}
          <Link to="/stats" style={active("/stats")}>
            Estadísticas
          </Link>
        </nav>
      </header>

      <Outlet />

      <footer style={{ marginTop: 24, opacity: 0.6, fontSize: 12 }}>
        © 2025 — Proyecto Quixo
      </footer>
    </div>
  );
}