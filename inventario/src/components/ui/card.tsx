interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg" | "none";
}

const paddingMap = { none: "", sm: "p-4", md: "p-5", lg: "p-6" };

export function Card({ children, className = "", padding = "md" }: CardProps) {
  return (
    <div
      className={[
        "bg-white rounded-card shadow-card border border-white/60",
        paddingMap[padding],
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  accent?: boolean;
}

export function MetricCard({ title, value, subtitle, icon, accent }: MetricCardProps) {
  return (
    <Card className={accent ? "border-brand/20 bg-gradient-to-br from-white to-brand-bg" : ""}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-light uppercase tracking-wide truncate">{title}</p>
          <p className="mt-1 text-2xl font-bold text-brand-dark">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-slate-light">{subtitle}</p>}
        </div>
        {icon && (
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-bg flex items-center justify-center text-brand">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
