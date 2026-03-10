interface Stat {
  label: string;
  value: string | number;
  accent?: boolean;
}

interface ClientStatsProps {
  total: number;
  active: number;
  atRisk: number;
  b2b: number;
  revenue: number;
}

export function ClientStats({ total, active, atRisk, b2b, revenue }: ClientStatsProps) {
  const stats: Stat[] = [
    { label: "TOTAL CLIENTS", value: total },
    { label: "ACTIVE", value: active },
    { label: "AT RISK", value: atRisk },
    { label: "B2B DEALS", value: b2b },
    { label: "TOTAL REVENUE", value: `€${revenue.toFixed(0)}`, accent: true },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="glass-surface rounded-xl p-3 border border-border/30 text-center"
        >
          <p
            className={`font-display text-lg font-black ${
              s.accent ? "text-primary" : "text-foreground"
            }`}
          >
            {s.value}
          </p>
          <p className="text-[8px] font-display tracking-widest text-muted-foreground">
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}
