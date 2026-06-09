"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Edit, Power } from "lucide-react";
import Link from "next/link";

type Variant = { id: string; attributesJson: string; sku: string | null; stockCurrent: number; stockMinimum: number; status: string; location: string | null };
type Movement = { id: string; type: string; quantityBefore: number; quantityAfter: number; quantityDelta: number; reason: string | null; origin: string; createdAt: string };
type Product = {
  id: string; name: string; status: string; stockCurrent: number; stockMinimum: number;
  description: string | null; pricePurchase: number; priceSale: number; location: string | null;
  category: { name: string }; supplier: { name: string; email: string | null } | null;
  variants: Variant[]; movements: Movement[];
};

const movLabel: Record<string, string> = { entry: "Entrada", exit: "Salida", adjustment: "Ajuste", edit: "Edición", deactivation: "Baja", import: "Importación", chat_action: "Chatbot" };

export default function ProductoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deactivating, setDeactivating] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${id}`).then((r) => r.json()).then(setProduct).finally(() => setLoading(false));
  }, [id]);

  const handleDeactivate = async () => {
    setDeactivating(true);
    await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deactivate" }),
    });
    setDeactivating(false);
    setShowDeactivateModal(false);
    router.refresh();
    fetch(`/api/products/${id}`).then((r) => r.json()).then(setProduct);
  };

  if (loading) return <div className="p-8 text-center text-slate-light">Cargando…</div>;
  if (!product) return <div className="p-8 text-center text-red-500">Producto no encontrado.</div>;

  return (
    <div className="p-6 max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/inventario"><Button variant="ghost" size="sm"><ArrowLeft size={14} /></Button></Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-brand-dark">{product.name}</h1>
            <Badge variant={product.status as "active" | "out_of_stock" | "discontinued"} />
          </div>
          <p className="text-sm text-slate-light">{product.category.name}</p>
        </div>
        {product.status !== "discontinued" && (
          <div className="flex gap-2">
            <Link href={`/inventario/${id}/editar`}><Button variant="secondary" size="sm"><Edit size={13} /> Editar</Button></Link>
            <Button variant="danger" size="sm" onClick={() => setShowDeactivateModal(true)}><Power size={13} /> Desactivar</Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <h2 className="text-xs font-semibold text-slate-light uppercase tracking-wide mb-3">Información</h2>
          <dl className="space-y-2 text-sm">
            {product.description && <><dt className="text-slate-light">Descripción</dt><dd className="text-slate-text">{product.description}</dd></>}
            <dt className="text-slate-light">Stock actual</dt><dd className="text-brand-dark font-bold text-lg">{product.stockCurrent}</dd>
            <dt className="text-slate-light">Stock mínimo</dt><dd className="text-slate-text">{product.stockMinimum}</dd>
            <dt className="text-slate-light">Precio compra</dt><dd className="text-slate-text">{product.pricePurchase > 0 ? `$${Number(product.pricePurchase).toFixed(2)}` : "—"}</dd>
            <dt className="text-slate-light">Precio venta</dt><dd className="text-slate-text">{product.priceSale > 0 ? `$${Number(product.priceSale).toFixed(2)}` : "—"}</dd>
            {product.location && <><dt className="text-slate-light">Ubicación</dt><dd className="text-slate-text">{product.location}</dd></>}
            {product.supplier && <><dt className="text-slate-light">Proveedor</dt><dd className="text-slate-text">{product.supplier.name}</dd></>}
          </dl>
        </Card>

        {product.variants.length > 0 && (
          <Card>
            <h2 className="text-xs font-semibold text-slate-light uppercase tracking-wide mb-3">Variantes ({product.variants.length})</h2>
            <div className="space-y-2">
              {product.variants.map((v) => {
                let attrs: Record<string, string> = {};
                try { attrs = JSON.parse(v.attributesJson); } catch {}
                return (
                  <div key={v.id} className="p-2 rounded-btn bg-brand-bg/50 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        {Object.entries(attrs).map(([k, val]) => <span key={k} className="inline-block mr-2"><b>{k}:</b> {val}</span>)}
                        {v.sku && <span className="text-slate-light ml-1">SKU: {v.sku}</span>}
                      </div>
                      <Badge variant={v.status as "active" | "out_of_stock"} />
                    </div>
                    <span className="text-slate-text font-semibold">{v.stockCurrent} uds.</span>
                    {v.location && <span className="text-slate-light ml-2">{v.location}</span>}
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      <Card>
        <h2 className="text-xs font-semibold text-slate-light uppercase tracking-wide mb-3">Historial de movimientos</h2>
        {product.movements.length === 0 ? (
          <p className="text-sm text-slate-light text-center py-4">Sin movimientos registrados.</p>
        ) : (
          <div className="space-y-1">
            {product.movements.map((m) => (
              <div key={m.id} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-50 last:border-0">
                <div>
                  <span className="font-medium text-slate-text">{movLabel[m.type] ?? m.type}</span>
                  {m.reason && <span className="text-slate-light text-xs ml-2">— {m.reason}</span>}
                  <span className="block text-xs text-slate-light">{new Date(m.createdAt).toLocaleString("es")}</span>
                </div>
                <div className="text-right">
                  <span className={`font-semibold ${m.quantityDelta >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {m.quantityDelta >= 0 ? "+" : ""}{m.quantityDelta}
                  </span>
                  <span className="text-xs text-slate-light block">{m.quantityBefore} → {m.quantityAfter}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-card p-6 max-w-sm w-full shadow-float">
            <h3 className="font-bold text-brand-dark mb-2">¿Desactivar &quot;{product.name}&quot;?</h3>
            <p className="text-sm text-slate-light mb-5">El producto pasará a estado descontinuado. No se borrará su historial.</p>
            <div className="flex gap-3">
              <Button variant="danger" loading={deactivating} onClick={handleDeactivate}>Confirmar</Button>
              <Button variant="secondary" onClick={() => setShowDeactivateModal(false)}>Cancelar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
