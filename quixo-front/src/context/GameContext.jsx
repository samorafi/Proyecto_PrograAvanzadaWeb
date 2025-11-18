import { createContext, useContext, useState } from "react";

const GameCtx = createContext(null);

export function GameProvider({ children }) {
  const [playing, setPlaying] = useState(false); // hay partida en curso
  const [winner, setWinner]   = useState(null); 

  const value = { playing, setPlaying, winner, setWinner };
  return <GameCtx.Provider value={value}>{children}</GameCtx.Provider>;
}

export function useGame() {
  const ctx = useContext(GameCtx);
  if (!ctx) throw new Error("useGame debe usarse dentro de <GameProvider>");
  return ctx;
}
