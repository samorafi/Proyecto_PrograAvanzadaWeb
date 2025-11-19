export default function Board5x5({ board, onPickEdge, disabled }) {
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
        const r = Math.floor(i / 5);
        const c = i % 5;
        const isEdge = r === 0 || r === 4 || c === 0 || c === 4;
        const clickable = isEdge && !disabled;

        const sym = cell; // 'N' | 'O' | 'X'
        const showDot = sym !== "N";

        return (
          <button
            key={i}
            onClick={() => clickable && onPickEdge(i)}
            disabled={!clickable}
            title={clickable ? "Retirar cubo" : ""}
            style={{
              position: "relative",
              width: 72,
              height: 72,
              borderRadius: 12,
              border: "1px solid #2a2f3f",
              background: "#0f1424",
              color: "#e5e7eb",
              opacity: clickable ? 1 : 0.6,
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)",
            }}
          >
            {showDot && (
              <span
                style={{
                  position: "absolute",
                  left: "50%",
                  top: sym === "X" ? "68%" : "50%",
                  transform: "translate(-50%, -50%)",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#cbd5e1",
                  opacity: 0.9,
                  pointerEvents: "none",
                }}
              />
            )}

            {/* Símbolo */}
            {sym !== "N" && (
              <span
                style={{
                  fontSize: 30,
                  fontWeight: 900,
                  letterSpacing: 1,
                  pointerEvents: "none",
                }}
              >
                {sym}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
