"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, Truck, Upload, Download,
  MessageSquare, Settings, Boxes,
} from "lucide-react";

const nav = [
  { href: "/",              label: "Dashboard",    icon: LayoutDashboard },
  { href: "/inventario",    label: "Inventario",   icon: Package },
  { href: "/proveedores",   label: "Proveedores",  icon: Truck },
  { href: "/importar",      label: "Importar",     icon: Upload },
  { href: "/exportar",      label: "Exportar",     icon: Download },
  { href: "/chatbot",       label: "Chatbot IA",   icon: MessageSquare },
  { href: "/configuracion", label: "Configuración",icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 flex-shrink-0 bg-white border-r border-slate-100 flex flex-col shadow-card">
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
            <Boxes size={16} className="text-white" />
          </div>
          <span className="font-bold text-brand-dark text-sm leading-tight">
            Inventario<br />
            <span className="font-normal text-slate-light text-xs">Souvenirs</span>
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 px-3 py-2 rounded-btn text-sm font-medium transition-colors duration-150",
                active
                  ? "bg-brand-bg text-brand-dark"
                  : "text-slate-light hover:bg-brand-bg/60 hover:text-slate-text",
              ].join(" ")}
            >
              <Icon size={16} className={active ? "text-brand" : ""} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
