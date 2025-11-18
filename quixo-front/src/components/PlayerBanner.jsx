export default function EncabezadoJugadores({arriba,abajo}){
  return (
    <div className="grid" style={{gap:6}}>
      <div style={{textAlign:"center",fontWeight:800}}>⬆ {arriba} (O)</div>
      <div style={{textAlign:"center",fontWeight:800}}>⬇ {abajo} (X)</div>
    </div>
  );
}
