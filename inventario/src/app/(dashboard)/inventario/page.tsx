"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Search, Filter } from "lucide-react";

type Product = {
  id: string; name: string; status: string; stockCurrent: number; stockMinimum: number;
  category: { name: string }; supplier: { name: string } | null;
  priceSale: number;
};

function statusBadge(p: Product) {
  if (p.status === "discontinued") return <Badge variant="discontinued" />;
  if (p.status === "out_of_stock") return <Badge variant="out_of_stock" />;
  if (p.stockMinimum > 0 && p.stockCurrent <= p.stockMinimum) return <Badge variant="low_stock" />;
  return <Badge variant="active" />;
}

export default function InventarioPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    setProducts(data.data ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [search, status]);

  useEffect(() => {
    fetchProducts(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetchProducts]);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Inventario</h1>
          <p className="text-sm text-slate-light">{total} productos</p>
        </div>
        <Link href="/inventario/nuevo">
          <Button><Plus size={15} /> Nuevo producto</Button>
        </Link>
      </div>

      <Card padding="sm">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-light" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, categoría, proveedor…"
              className="w-full pl-8 pr-3 py-2 text-sm rounded-btn border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 text-sm rounded-btn border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="out_of_stock">Agotados</option>
            <option value="discontinued">Descontinuados</option>
          </select>
          <Button variant="secondary" size="sm" onClick={fetchProducts}>
            <Filter size={14} /> Filtrar
          </Button>
        </div>
      </Card>

      <Card padding="none">
        {loading ? (
          <div className="p-8 text-center text-slate-light text-sm">Cargando…</div>
        ) : products.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-slate-light mb-3">No hay productos que coincidan.</p>
            <Link href="/inventario/nuevo"><Button size="sm">Agregar primer producto</Button></Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-brand-bg/50">
                {["Nombre", "Categoría", "Stock", "Precio venta", "Proveedor", "Estado", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-light uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-brand-bg/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-text">{p.name}</td>
                  <td className="px-4 py-3 text-slate-light">{p.category.name}</td>
                  <td className="px-4 py-3">
                    <span className={p.stockMinimum > 0 && p.stockCurrent <= p.stockMinimum ? "text-brand-dark font-semibold" : "text-slate-text"}>
                      {p.stockCurrent}
                    </span>
                    {p.stockMinimum > 0 && <span className="text-slate-light text-xs ml-1">/ {p.stockMinimum} mín.</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-text">{Number(p.priceSale) > 0 ? `$${Number(p.priceSale).toFixed(2)}` : "—"}</td>
                  <td className="px-4 py-3 text-slate-light">{p.supplier?.name ?? "—"}</td>
                  <td className="px-4 py-3">{statusBadge(p)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/inventario/${p.id}`} className="text-brand text-xs font-medium hover:underline">Ver</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
