import { prisma } from "@/lib/db";
import { MetricCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Boxes, AlertTriangle, ShoppingBag, TrendingDown, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const [totalActive, totalVariants, outOfStock, recentMovements, settings] = await Promise.all([
    prisma.product.count({ where: { status: { not: "discontinued" } } }),
    prisma.variant.count({ where: { status: { not: "discontinued" } } }),
    prisma.product.count({ where: { status: "out_of_stock" } }),
    prisma.inventoryMovement.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { product: { select: { name: true } } },
    }),
    prisma.appSettings.findFirst(),
  ]);

  const lowStockProducts = await prisma.product.findMany({
    where: { status: { not: "discontinued" }, stockMinimum: { gt: 0 } },
    include: { category: true },
    take: 20,
  });
  const lowStock = lowStockProducts.filter((p) => p.stockCurrent <= p.stockMinimum);

  const products = await prisma.product.findMany({
    where: { status: { not: "discontinued" } },
    select: { stockCurrent: true, pricePurchase: true, priceSale: true },
  });
  const purchaseValue = products.reduce((s, p) => s + p.stockCurrent * Number(p.pricePurchase), 0);
  const saleValue = products.reduce((s, p) => s + p.stockCurrent * Number(p.priceSale), 0);

  return { totalActive, totalVariants, outOfStock, lowStock, purchaseValue, saleValue, recentMovements, currency: settings?.currency ?? "USD" };
}

const movTypeLabel: Record<string, string> = {
  entry: "Entrada", exit: "Salida", adjustment: "Ajuste", edit: "Edición",
  deactivation: "Baja", import: "Importación", chat_action: "Chatbot",
};

export default async function DashboardPage() {
  const { totalActive, totalVariants, outOfStock, lowStock, purchaseValue, saleValue, recentMovements, currency } = await getDashboardData();

  const fmt = (n: number) => new Intl.NumberFormat("es", { style: "currency", currency, minimumFractionDigits: 0 }).format(n);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Dashboard</h1>
        <p className="text-sm text-slate-light mt-0.5">Estado general del inventario</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <MetricCard title="Productos activos" value={totalActive} icon={<Package size={20} />} accent />
        <MetricCard title="Variantes" value={totalVariants} icon={<Boxes size={20} />} />
        <MetricCard title="Stock bajo" value={lowStock.length} subtitle="Requieren reposición" icon={<AlertTriangle size={20} />} />
        <MetricCard title="Agotados" value={outOfStock} icon={<TrendingDown size={20} />} />
        <MetricCard title="Valor de compra" value={fmt(purchaseValue)} icon={<ShoppingBag size={20} />} />
        <MetricCard title="Valor de venta" value={fmt(saleValue)} icon={<TrendingUp size={20} />} accent />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {lowStock.length > 0 && (
          <div className="bg-white rounded-card shadow-card border border-brand-pink/30 p-5">
            <h2 className="text-sm font-semibold text-brand-dark mb-3 flex items-center gap-2">
              <AlertTriangle size={15} className="text-brand-pink" />
              Productos con stock bajo
            </h2>
            <div className="space-y-2">
              {lowStock.slice(0, 8).map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-text truncate">{p.name}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-slate-light text-xs">{p.stockCurrent} / {p.stockMinimum} mín.</span>
                    <Badge variant="low_stock" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-card shadow-card p-5">
          <h2 className="text-sm font-semibold text-brand-dark mb-3">Últimos movimientos</h2>
          {recentMovements.length === 0 ? (
            <p className="text-sm text-slate-light text-center py-4">Sin movimientos registrados aún.</p>
          ) : (
            <div className="space-y-2">
              {recentMovements.map((m) => (
                <div key={m.id} className="flex items-center justify-between text-sm">
                  <div className="min-w-0">
                    <span className="text-slate-text truncate block">{m.product.name}</span>
                    <span className="text-xs text-slate-light">{movTypeLabel[m.type] ?? m.type}</span>
                  </div>
                  <span className={`text-xs font-medium flex-shrink-0 ${m.quantityDelta >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {m.quantityDelta >= 0 ? "+" : ""}{m.quantityDelta}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
