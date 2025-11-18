import { useEffect, useState } from "react";
import { partidas2p } from "../services/api";

export default function PartidasFinalizadas2J(){
  const [rows,setRows]=useState([]);
  useEffect(()=>{ partidas2p.finalizadas().then(r=>setRows(r.data||[])); },[]);
  return (
    <div className="panel">
      <h3 style={{marginTop:0}}>Partidas finalizadas</h3>
      <table width="100%" cellPadding="8" style={{borderCollapse:"collapse"}}>
        <thead style={{opacity:.7}}>
          <tr><th align="left">ID</th><th align="left">Creación/Sobrescrita</th><th align="left">Finalizada</th><th>Duración (s)</th><th>Ganador</th></tr>
        </thead>
        <tbody>
          {rows.map(r=>(
            <tr key={r.partidaId} style={{borderTop:"1px solid var(--border)"}}>
              <td>{r.partidaId}</td>
              <td>{new Date(r.fechaLista).toLocaleString()}</td>
              <td>{new Date(r.fechaFinalizada).toLocaleString()}</td>
              <td align="center">{r.duracionSegundos ?? "-"}</td>
              <td align="center">{r.ganadorSimbolo ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
