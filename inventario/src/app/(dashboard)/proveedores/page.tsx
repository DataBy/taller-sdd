"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, X } from "lucide-react";

type Supplier = { id: string; name: string; phone: string | null; email: string | null; address: string | null; notes: string | null };

const emptyForm = { name: "", phone: "", email: "", address: "", notes: "" };

export default function ProveedoresPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const load = () => fetch("/api/suppliers").then((r) => r.json()).then(setSuppliers);
  useEffect(() => { load(); }, []);

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "El nombre es requerido";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Formato de correo inválido";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    const res = await fetch("/api/suppliers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { setForm(emptyForm); setShowForm(false); load(); }
    else { const d = await res.json(); setErrors({ _global: d.error }); }
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-dark">Proveedores</h1>
        <Button onClick={() => setShowForm(!showForm)}><Plus size={15} /> Nuevo proveedor</Button>
      </div>

      {showForm && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-brand-dark">Nuevo proveedor</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-light hover:text-slate-text"><X size={16} /></button>
          </div>
          {errors._global && <p className="text-xs text-red-600 mb-3">{errors._global}</p>}
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input label="Nombre *" value={form.name} onChange={f("name")} error={errors.name} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Teléfono" value={form.phone} onChange={f("phone")} />
              <Input label="Correo" type="email" value={form.email} onChange={f("email")} error={errors.email} />
            </div>
            <Input label="Dirección" value={form.address} onChange={f("address")} />
            <Textarea label="Notas" value={form.notes} onChange={f("notes")} />
            <div className="flex gap-2 pt-1">
              <Button type="submit" loading={loading}>Guardar</Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </form>
        </Card>
      )}

      {suppliers.length === 0 ? (
        <Card><p className="text-center text-slate-light text-sm py-6">No hay proveedores registrados.</p></Card>
      ) : (
        <div className="space-y-3">
          {suppliers.map((s) => (
            <Card key={s.id} padding="sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-text">{s.name}</p>
                  {s.email && <p className="text-xs text-slate-light">{s.email}</p>}
                  {s.phone && <p className="text-xs text-slate-light">{s.phone}</p>}
                  {s.address && <p className="text-xs text-slate-light">{s.address}</p>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
