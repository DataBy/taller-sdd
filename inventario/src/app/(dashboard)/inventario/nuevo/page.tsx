"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

type Category = { id: string; name: string };
type Supplier = { id: string; name: string };

export default function NuevoProductoPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: "", categoryId: "", description: "", stockCurrent: 0,
    stockMinimum: 0, pricePurchase: 0, priceSale: 0, supplierId: "", location: "",
  });

  const [variants, setVariants] = useState<Array<{ attributes: string; sku: string; stockCurrent: number; stockMinimum: number }>>([]);

  useEffect(() => {
    Promise.all([fetch("/api/categories").then((r) => r.json()), fetch("/api/suppliers").then((r) => r.json())])
      .then(([cats, sups]) => { setCategories(cats); setSuppliers(sups); });
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "El nombre es requerido";
    if (!form.categoryId) e.categoryId = "La categoría es requerida";
    if (form.stockCurrent < 0) e.stockCurrent = "El stock no puede ser negativo";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, supplierId: form.supplierId || undefined }),
    });
    const product = await res.json();

    if (!res.ok) { setErrors({ _global: product.error }); setLoading(false); return; }

    for (const v of variants) {
      let attrs: Record<string, string> = {};
      try { attrs = Object.fromEntries(v.attributes.split(",").map((p) => { const [k, val] = p.split(":"); return [k.trim(), val?.trim() ?? ""]; })); } catch {}
      if (Object.keys(attrs).length > 0) {
        await fetch("/api/variants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id, attributes: attrs, sku: v.sku || undefined, stockCurrent: v.stockCurrent, stockMinimum: v.stockMinimum }),
        });
      }
    }

    router.push(`/inventario/${product.id}`);
  };

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value }));

  return (
    <div className="p-6 max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/inventario"><Button variant="ghost" size="sm"><ArrowLeft size={14} /></Button></Link>
        <h1 className="text-2xl font-bold text-brand-dark">Nuevo producto</h1>
      </div>

      {errors._global && <div className="p-3 rounded-btn bg-red-50 text-red-600 text-sm">{errors._global}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <h2 className="text-sm font-semibold text-brand-dark mb-4">Datos generales</h2>
          <div className="space-y-4">
            <Input label="Nombre *" value={form.name} onChange={f("name")} error={errors.name} placeholder="Ej: Llavero Volcán" />
            <Select label="Categoría *" value={form.categoryId} onChange={f("categoryId") as (e: React.ChangeEvent<HTMLSelectElement>) => void}
              options={categories.map((c) => ({ value: c.id, label: c.name }))} placeholder="Seleccionar categoría" error={errors.categoryId} />
            <Textarea label="Descripción" value={form.description} onChange={f("description")} placeholder="Descripción breve del producto" />
            <Select label="Proveedor" value={form.supplierId} onChange={f("supplierId") as (e: React.ChangeEvent<HTMLSelectElement>) => void}
              options={suppliers.map((s) => ({ value: s.id, label: s.name }))} placeholder="Sin proveedor" />
            <Input label="Ubicación" value={form.location} onChange={f("location")} placeholder="Ej: Bodega A - Estante 3" />
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-brand-dark mb-4">Stock y precios</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Stock inicial" type="number" min={0} value={form.stockCurrent} onChange={f("stockCurrent")} error={errors.stockCurrent} />
            <Input label="Stock mínimo" type="number" min={0} value={form.stockMinimum} onChange={f("stockMinimum")} />
            <Input label="Precio de compra" type="number" min={0} step="0.01" value={form.pricePurchase} onChange={f("pricePurchase")} />
            <Input label="Precio de venta" type="number" min={0} step="0.01" value={form.priceSale} onChange={f("priceSale")} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-brand-dark">Variantes (opcional)</h2>
            <Button type="button" variant="secondary" size="sm" onClick={() => setVariants((v) => [...v, { attributes: "", sku: "", stockCurrent: 0, stockMinimum: 0 }])}>
              <Plus size={13} /> Agregar variante
            </Button>
          </div>
          {variants.length === 0 ? (
            <p className="text-xs text-slate-light">Sin variantes. El stock del producto se gestiona directamente.</p>
          ) : (
            <div className="space-y-3">
              {variants.map((v, i) => (
                <div key={i} className="flex gap-2 items-start p-3 rounded-btn bg-brand-bg/40">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <Input placeholder="Atributos: talla:M,color:negro" value={v.attributes}
                      onChange={(e) => setVariants((prev) => prev.map((x, j) => j === i ? { ...x, attributes: e.target.value } : x))} />
                    <Input placeholder="SKU (opcional)" value={v.sku}
                      onChange={(e) => setVariants((prev) => prev.map((x, j) => j === i ? { ...x, sku: e.target.value } : x))} />
                    <Input type="number" min={0} placeholder="Stock" value={v.stockCurrent}
                      onChange={(e) => setVariants((prev) => prev.map((x, j) => j === i ? { ...x, stockCurrent: parseInt(e.target.value) || 0 } : x))} />
                    <Input type="number" min={0} placeholder="Stock mínimo" value={v.stockMinimum}
                      onChange={(e) => setVariants((prev) => prev.map((x, j) => j === i ? { ...x, stockMinimum: parseInt(e.target.value) || 0 } : x))} />
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setVariants((prev) => prev.filter((_, j) => j !== i))}>
                    <Trash2 size={13} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="flex gap-3">
          <Button type="submit" loading={loading}>Crear producto</Button>
          <Link href="/inventario"><Button type="button" variant="secondary">Cancelar</Button></Link>
        </div>
      </form>
    </div>
  );
}
