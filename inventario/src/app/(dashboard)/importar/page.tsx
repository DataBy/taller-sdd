"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

type RowResult = { row: number; status: "valid" | "warning" | "error"; data: Record<string, string>; error?: string; warning?: string };
type Preview = { batchId: string; totalRows: number; validRows: number; errorRows: number; warningRows: number; rows: RowResult[] };

export default function ImportarPage() {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ created: number; updated: number } | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setLoading(true); setError("");
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/import/preview", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    setPreview(data);
    setStep("preview");
    setLoading(false);
  };

  const handleConfirm = async () => {
    if (!preview) return;
    setLoading(true);
    const validRows = preview.rows.filter((r) => r.status !== "error").map((r) => r.data);
    const res = await fetch(`/api/import/confirm/${preview.batchId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows: validRows }),
    });
    const data = await res.json();
    if (res.ok) { setResult(data); setStep("done"); }
    else setError(data.error);
    setLoading(false);
  };

  const drop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const statusIcon = (s: string) => s === "valid" ? <CheckCircle size={14} className="text-emerald-500" /> : s === "warning" ? <AlertTriangle size={14} className="text-yellow-500" /> : <XCircle size={14} className="text-red-500" />;

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      <h1 className="text-2xl font-bold text-brand-dark">Importar inventario</h1>
      {error && <div className="p-3 rounded-btn bg-red-50 text-red-600 text-sm">{error}</div>}

      {step === "upload" && (
        <Card>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={drop}
            onClick={() => inputRef.current?.click()}
            className={[
              "border-2 border-dashed rounded-card p-12 text-center cursor-pointer transition-colors",
              dragging ? "border-brand bg-brand-bg" : "border-slate-200 hover:border-brand/50 hover:bg-brand-bg/30",
            ].join(" ")}
          >
            <Upload size={32} className={`mx-auto mb-3 ${dragging ? "text-brand" : "text-slate-light"}`} />
            <p className="text-sm font-medium text-slate-text">Arrastra tu archivo CSV o Excel aquí</p>
            <p className="text-xs text-slate-light mt-1">o haz clic para seleccionar</p>
            <p className="text-xs text-slate-light mt-3">Formatos: .csv, .xlsx · Máx. 500 filas</p>
          </div>
          <input ref={inputRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          {loading && <p className="text-center text-sm text-slate-light mt-3 animate-pulse">Analizando archivo…</p>}
          <div className="mt-4 p-3 rounded-btn bg-brand-bg/50 text-xs text-slate-light">
            <b>Columnas esperadas:</b> name, category, description, stock_current, stock_minimum, price_purchase, price_sale, supplier, location, status
          </div>
        </Card>
      )}

      {step === "preview" && preview && (
        <>
          <Card padding="sm">
            <div className="flex gap-4 text-sm">
              <span className="text-emerald-600 font-semibold">{preview.validRows} válidas</span>
              <span className="text-yellow-600 font-semibold">{preview.warningRows} advertencias</span>
              <span className="text-red-600 font-semibold">{preview.errorRows} errores</span>
              <span className="text-slate-light">de {preview.totalRows} filas</span>
            </div>
          </Card>
          <Card padding="none">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-brand-bg/50">
                  <th className="px-3 py-2 text-left text-slate-light">Fila</th>
                  <th className="px-3 py-2 text-left text-slate-light">Nombre</th>
                  <th className="px-3 py-2 text-left text-slate-light">Categoría</th>
                  <th className="px-3 py-2 text-left text-slate-light">Stock</th>
                  <th className="px-3 py-2 text-left text-slate-light">Estado</th>
                  <th className="px-3 py-2 text-left text-slate-light">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((r) => (
                  <tr key={r.row} className={`border-b border-slate-50 ${r.status === "error" ? "bg-red-50/50" : r.status === "warning" ? "bg-yellow-50/50" : ""}`}>
                    <td className="px-3 py-2 text-slate-light">{r.row}</td>
                    <td className="px-3 py-2">{r.data.name ?? "—"}</td>
                    <td className="px-3 py-2">{r.data.category ?? "—"}</td>
                    <td className="px-3 py-2">{r.data.stock_current ?? "0"}</td>
                    <td className="px-3 py-2">{statusIcon(r.status)}</td>
                    <td className="px-3 py-2 text-slate-light">{r.error ?? r.warning ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <div className="flex gap-3">
            <Button loading={loading} disabled={preview.validRows === 0} onClick={handleConfirm}>
              Importar {preview.validRows} filas válidas
            </Button>
            <Button variant="secondary" onClick={() => { setStep("upload"); setPreview(null); }}>Cancelar</Button>
          </div>
        </>
      )}

      {step === "done" && result && (
        <Card className="text-center py-8">
          <CheckCircle size={40} className="text-emerald-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-brand-dark">Importación completada</h2>
          <p className="text-slate-light mt-1">{result.created} productos creados · {result.updated} actualizados</p>
          <Button className="mt-5" onClick={() => { setStep("upload"); setPreview(null); setResult(null); }}>Importar otro archivo</Button>
        </Card>
      )}
    </div>
  );
}
