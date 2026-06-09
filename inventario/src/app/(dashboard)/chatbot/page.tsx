"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Send, Bot, User, Check, X } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isAction?: boolean;
  actionId?: string;
  confirmed?: boolean | null;
};

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([{
    id: "init",
    role: "assistant",
    content: "Hola, soy tu asistente de inventario. Puedo consultar stock, listar productos con stock bajo, y ayudarte a crear, editar o ajustar el inventario. ¿En qué te puedo ayudar?",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: input.trim() };
    const history = messages.filter((m) => m.role !== "assistant" || !m.isAction).map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content, history }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
        isAction: data.isAction,
        actionId: data.actionId,
        confirmed: data.isAction ? null : undefined,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (msgId: string, actionId: string) => {
    const res = await fetch("/api/chat/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actionId }),
    });
    const confirmed = res.ok;
    setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, confirmed } : m));
    setMessages((prev) => [...prev, {
      id: crypto.randomUUID(),
      role: "assistant",
      content: confirmed ? "✓ Acción ejecutada correctamente. El inventario ha sido actualizado." : "No se pudo ejecutar la acción.",
    }]);
  };

  const handleReject = async (msgId: string, actionId: string) => {
    await fetch("/api/chat/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actionId }),
    });
    setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, confirmed: false } : m));
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: "Acción cancelada. El inventario no fue modificado." }]);
  };

  return (
    <div className="p-6 h-full flex flex-col max-w-2xl">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-brand-dark">Chatbot IA</h1>
        <p className="text-sm text-slate-light">Consulta y gestiona tu inventario en lenguaje natural</p>
      </div>

      <Card padding="none" className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-brand-bg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot size={14} className="text-brand" />
                </div>
              )}
              <div className={`max-w-[80%] ${msg.role === "user" ? "order-first" : ""}`}>
                <div className={[
                  "rounded-xl px-3 py-2 text-sm",
                  msg.role === "user" ? "bg-brand text-white rounded-br-sm" : "bg-brand-bg text-slate-text rounded-bl-sm",
                  msg.isAction ? "border-2 border-brand/30" : "",
                ].join(" ")}>
                  {msg.content}
                </div>
                {msg.isAction && msg.confirmed === null && msg.actionId && (
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={() => handleConfirm(msg.id, msg.actionId!)}>
                      <Check size={13} /> Confirmar
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleReject(msg.id, msg.actionId!)}>
                      <X size={13} /> Rechazar
                    </Button>
                  </div>
                )}
                {msg.isAction && msg.confirmed !== null && msg.confirmed !== undefined && (
                  <span className={`text-xs mt-1 block ${msg.confirmed ? "text-emerald-600" : "text-red-500"}`}>
                    {msg.confirmed ? "✓ Confirmado" : "✗ Rechazado"}
                  </span>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User size={14} className="text-white" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-2 justify-start">
              <div className="w-7 h-7 rounded-full bg-brand-bg flex items-center justify-center">
                <Bot size={14} className="text-brand" />
              </div>
              <div className="bg-brand-bg rounded-xl px-3 py-2 text-sm text-slate-light">
                <span className="animate-pulse">Pensando…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-slate-100 p-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            disabled={loading}
            placeholder="Escribe tu consulta o solicitud…"
            className="flex-1 px-3 py-2 text-sm rounded-btn border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-50"
          />
          <Button onClick={send} disabled={loading || !input.trim()}>
            <Send size={14} />
          </Button>
        </div>
      </Card>
    </div>
  );
}
