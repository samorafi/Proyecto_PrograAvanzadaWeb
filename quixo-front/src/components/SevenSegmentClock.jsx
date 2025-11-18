import { fmtHMS } from "../hooks/useTimer";
export default function SevenSegmentClock({ seconds }) {
  return <span className="sevenseg">{fmtHMS(seconds)}</span>;
}
