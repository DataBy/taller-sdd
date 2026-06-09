"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { Download } from "lucide-react";

type Category = { id: string; name: string };

export default function ExportarPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [format, setFormat] = useState("csv");
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetch("/api/categories").then((r) => r.json()).then(setCategories); }, []);

  const handleExport = async () => {
    setLoading(true);
    const params = new URLSearchParams({ format });
    if (status) params.set("status", status);
    if (category) params.set("category", category);

    const res = await fetch(`/api/export?${params}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventario-${Date.now()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-5 max-w-lg">
      <h1 className="text-2xl font-bold text-brand-dark">Exportar inventario</h1>

      <Card>
        <h2 className="text-sm font-semibold text-brand-dark mb-4">Filtros de exportación</h2>
        <div className="space-y-4">
          <Select label="Formato" value={format} onChange={(e) => setFormat(e.target.value)}
            options={[{ value: "csv", label: "CSV (.csv)" }]} />
          <Select label="Estado" value={status} onChange={(e) => setStatus(e.target.value)}
            options={[{ value: "active", label: "Activos" }, { value: "out_of_stock", label: "Agotados" }, { value: "discontinued", label: "Descontinuados" }]}
            placeholder="Todos los estados" />
          <Select label="Categoría" value={category} onChange={(e) => setCategory(e.target.value)}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Todas las categorías" />
        </div>
        <div className="mt-5 p-3 rounded-btn bg-brand-bg/50 text-xs text-slate-light">
          {status || category ? "Se exportarán solo los productos que coincidan con los filtros." : "Se exportará el inventario completo."}
        </div>
      </Card>

      <Button size="lg" loading={loading} onClick={handleExport}>
        <Download size={16} /> Descargar {format.toUpperCase()}
      </Button>
    </div>
  );
}
