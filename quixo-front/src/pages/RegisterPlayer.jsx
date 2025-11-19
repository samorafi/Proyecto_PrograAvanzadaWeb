// src/pages/RegisterPlayer.jsx
import { useState } from "react";
import { jugadores } from "../services/api";

export default function RegisterPlayer() {
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    const n = name.trim();
    if (!n) return setMsg("Ingresa un nombre.");

    try {
      const ex = await jugadores.exists(n);
      if (ex.data?.exists) {
        setMsg(`El nombre "${n}" ya existe. Prueba otro.`);
        return;
      }
      const res = await jugadores.create(n);
      setMsg(`Jugador creado: ${res.data?.nombre}.`);

      setName("");
    } catch {
      setMsg("No se pudo registrar el jugador.");
    }
  }

  return (
    <div className="panel" style={{ maxWidth: 520, margin: "0 auto" }}>
      <h2 style={{ marginTop: 0 }}>Registrar jugador</h2>
      <form onSubmit={submit} className="grid gap-3">
        <label>Nombre del jugador</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ej: Karla"
          className="input"
        />
        <button className="btn" type="submit">Guardar</button>
      </form>
      {msg && <div className="mt-3" style={{ color: "#9ec1ff" }}>{msg}</div>}
    </div>
  );
}
