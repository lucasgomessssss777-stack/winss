import { useEffect, useState } from "react";

export function Odometer({
  value,
  duration = 1400,
  prefix = "",
}: {
  value: number;
  duration?: number;
  prefix?: string;
}) {
  const [display, setDisplay] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let raf = 0;
    setFinished(false);
    const start = performance.now();
    const from = 0;
    const to = value;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setFinished(true);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return (
    <span
      className={`inline-block font-number tabular-nums tracking-[-0.04em] ${
        finished ? "odometer-finish" : ""
      }`}
      style={{ fontFamily: "var(--font-number)" }}
    >
      {prefix}
      {display.toLocaleString("pt-BR")}
    </span>
  );
}
