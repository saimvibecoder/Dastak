// Hand coded SVG bar chart. Uses a fixed viewBox and scales to its box.
export default function Bars({ data, height = 200 }: { data: { label: string; n: number }[]; height?: number }) {
  const W = 700, H = height, max = Math.max(1, ...data.map((d) => d.n)), bw = W / Math.max(1, data.length), last = data.length - 1;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="New guests per day" style={{ width: "100%", height }}>
      {data.map((d, i) => {
        const h = Math.max(3, ((H - 28) * d.n) / max);
        return (
          <g key={i}>
            <rect x={i * bw + bw * 0.12} y={H - 22 - h} width={bw * 0.76} height={h} rx={6} fill="var(--accent)" opacity={i === last ? 1 : 0.35 + (0.5 * i) / Math.max(1, last)}>
              <title>{`${d.label}: ${d.n} guests`}</title>
            </rect>
          </g>
        );
      })}
    </svg>
  );
}
export function BarLabels({ data }: { data: { label: string }[] }) {
  const step = data.length > 10 ? 3 : 1;
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${data.length},minmax(0,1fr))`, fontSize: 11, color: "var(--mfg)", textAlign: "center", marginTop: 4 }}>
      {data.map((d, i) => <span key={i} style={{ whiteSpace: "nowrap", overflow: "visible" }}>{(i % step === 0 && data.length - 1 - i >= step) || i === data.length - 1 ? d.label : ""}</span>)}
    </div>
  );
}
