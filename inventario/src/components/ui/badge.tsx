type BadgeVariant = "active" | "out_of_stock" | "discontinued" | "low_stock" | "pending" | "confirmed" | "cancelled" | "proposed" | "rejected" | "executed" | "default";

const variantStyles: Record<BadgeVariant, string> = {
  active:       "bg-emerald-100 text-emerald-700",
  out_of_stock: "bg-red-100 text-red-700",
  discontinued: "bg-slate-100 text-slate-500 line-through",
  low_stock:    "bg-brand-pink-light text-brand-dark",
  pending:      "bg-yellow-100 text-yellow-700",
  confirmed:    "bg-emerald-100 text-emerald-700",
  cancelled:    "bg-slate-100 text-slate-500",
  proposed:     "bg-brand-pink-light text-brand-dark",
  rejected:     "bg-red-100 text-red-600",
  executed:     "bg-emerald-100 text-emerald-700",
  default:      "bg-brand-bg text-brand",
};

const variantLabels: Partial<Record<BadgeVariant, string>> = {
  active:       "Activo",
  out_of_stock: "Agotado",
  discontinued: "Descontinuado",
  low_stock:    "Stock bajo",
  pending:      "Pendiente",
  confirmed:    "Confirmado",
  cancelled:    "Cancelado",
  proposed:     "Propuesto",
  rejected:     "Rechazado",
  executed:     "Ejecutado",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children?: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        variantStyles[variant],
        className,
      ].join(" ")}
    >
      {children ?? variantLabels[variant] ?? variant}
    </span>
  );
}
