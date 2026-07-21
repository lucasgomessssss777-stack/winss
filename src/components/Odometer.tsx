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

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const to = value;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return (
    <span className="font-number tabular-nums tracking-[-0.04em]" style={{ fontFamily: "var(--font-number)" }}>
      {prefix}
      {display.toLocaleString("pt-BR")}
    </span>
  );
}