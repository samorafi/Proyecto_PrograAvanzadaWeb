// src/components/Board5x5.jsx
export default function Board5x5({ board, onPickEdge, disabled }) {
  return (
    <div style={{
      display:"grid",
      gridTemplateColumns:"repeat(5, 64px)",
      gridAutoRows:"64px",
      gap:"12px",
      justifyContent:"center"
    }}>
      {board.map((cell, i) => {
        const sym = cell; // 'N', 'O', 'X'
        const isEdge = [0,1,2,3,4, 20,21,22,23,24, 5,10,15, 9,14,19].includes(i) || 
                       true; 

        const clickable = isEdge && !disabled;
        return (
          <button
            key={i}
            onClick={() => clickable && onPickEdge(i)}
            disabled={!clickable}
            style={{
              position:"relative",
              width:64, height:64,
              borderRadius:12,
              border:"1px solid #2a2f3f",
              background:"#0f1424",
              color:"#e5e7eb",
              opacity: clickable ? 1 : .6
            }}
            title={clickable ? "Retirar cubo" : ""}
          >
            {/* símbolo */}
            {sym !== "N" && (
              <span style={{ fontSize:28, fontWeight:900, opacity:.9 }}>
                {sym}
              </span>
            )}

            {/* puntito */}
            <span style={{
              position:"absolute", width:6, height:6, borderRadius:"50%",
              background:"#cbd5e1", opacity:.9, left:"50%", top:"50%",
              transform:"translate(-50%, -50%)"
            }} />
          </button>
        );
      })}
    </div>
  );
}
