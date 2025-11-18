import { useEffect, useRef, useState } from "react";

//named export
export function useTimer(running = true) {
  const [seconds, setSeconds] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(ref.current);
  }, [running]);

  const reset = () => setSeconds(0);
  return { seconds, reset };
}

// named export
export const fmtHMS = (t) => {
  const h = String(Math.floor(t / 3600)).padStart(2, "0");
  const m = String(Math.floor((t % 3600) / 60)).padStart(2, "0");
  const s = String(t % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
};
