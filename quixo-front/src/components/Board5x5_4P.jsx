import { isEdge4P, canPickCube4P } from "../utils/board4p";

export default function Board5x5_4P({ board, currentPlayer, onPickEdge, disabled }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 72px)",
        gridAutoRows: "72px",
        gap: "14px",
        justifyContent: "center",
      }}
    >
      {board.map((cell, i) => {
        const clickable =
          !disabled &&
          isEdge4P(i) &&
          canPickCube4P(cell, currentPlayer);

        const showSymbol = cell.symbol !== "N";

        let dotStyle = {
          position: "absolute",
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "#cbd5e1",
          opacity: cell.point ? 0.9 : 0,
          pointerEvents: "none",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        };

        // Ajustamos ubicación del punto según orientación
        if (cell.point === "A1") {
          dotStyle = { ...dotStyle, top: 8, left: "50%", transform: "translateX(-50%)" };
        }
        if (cell.point === "A2") {
          dotStyle = { ...dotStyle, top: "auto", bottom: 8, left: "50%", transform: "translateX(-50%)" };
        }
        if (cell.point === "B1") {
          dotStyle = { ...dotStyle, left: "auto", right: 8, top: "50%", transform: "translateY(-50%)" };
        }
        if (cell.point === "B2") {
          dotStyle = { ...dotStyle, left: 8, top: "50%", transform: "translateY(-50%)" };
        }

        return (
          <button
            key={i}
            onClick={() => clickable && onPickEdge(i)}
            disabled={!clickable}
            style={{
              position: "relative",
              width: 72,
              height: 72,
              borderRadius: 12,
              border: "1px solid #2a2f3f",
              background: "#0f1424",
              color: "#e5e7eb",
              opacity: clickable ? 1 : 0.6,
              cursor: clickable ? "pointer" : "default",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)",
            }}
          >
            {/* Punto (orientación) */}
            <span style={dotStyle} />

            {/* Símbolo */}
            {showSymbol && (
              <span
                style={{
                  fontSize: 30,
                  fontWeight: 900,
                  letterSpacing: 1,
                  pointerEvents: "none",
                }}
              >
                {cell.symbol}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}