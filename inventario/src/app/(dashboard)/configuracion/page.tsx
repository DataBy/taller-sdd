"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Save } from "lucide-react";

const MODELS = [
  "openai/gpt-4o-mini", "openai/gpt-4o", "anthropic/claude-3-haiku",
  "anthropic/claude-3.5-sonnet", "meta-llama/llama-3.1-8b-instruct",
];

const CURRENCIES = ["USD", "EUR", "CRC", "MXN", "COP", "PEN", "CLP", "ARS", "BRL"];

export default function ConfiguracionPage() {
  const [form, setForm] = useState({ currency: "USD", openrouterModel: "openai/gpt-4o-mini" });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => setForm({ currency: d.currency, openrouterModel: d.openrouterModel }));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-5 max-w-lg">
      <h1 className="text-2xl font-bold text-brand-dark">Configuración</h1>

      <form onSubmit={handleSave} className="space-y-5">
        <Card>
          <h2 className="text-sm font-semibold text-brand-dark mb-4">Sistema</h2>
          <div className="space-y-4">
            <Select
              label="Moneda"
              value={form.currency}
              onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))}
              options={CURRENCIES.map((c) => ({ value: c, label: c }))}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-brand-dark mb-2">Chatbot IA</h2>
          <p className="text-xs text-slate-light mb-4">
            La API key de OpenRouter se configura en la variable de entorno <code className="bg-brand-bg px-1 rounded">OPENROUTER_API_KEY</code> del servidor.
          </p>
          <Select
            label="Modelo de IA"
            value={form.openrouterModel}
            onChange={(e) => setForm((p) => ({ ...p, openrouterModel: e.target.value }))}
            options={MODELS.map((m) => ({ value: m, label: m }))}
          />
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" loading={loading}>
            <Save size={14} /> Guardar cambios
          </Button>
          {saved && <span className="text-sm text-emerald-600">✓ Guardado</span>}
        </div>
      </form>
    </div>
  );
}
