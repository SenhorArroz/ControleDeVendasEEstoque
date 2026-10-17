"use client";

import { Menu } from "lucide-react";

export default function MobileNav() {
  return (
    <header className="navbar sticky top-0 z-40 w-full shrink-0 border-b border-slate-200/50 bg-white/80 px-3 backdrop-blur-md sm:px-4 lg:hidden">
      <button type="button" onClick={() => {
        const toggle = document.getElementById("my-drawer-2") as HTMLInputElement | null;
        if (toggle) toggle.checked = !toggle.checked;
      }} className="btn btn-ghost btn-circle drawer-button" aria-label="Abrir menu de navegação" aria-controls="app-navigation">
        <Menu className="h-6 w-6 text-orange-600" aria-hidden="true" />
      </button>
      <span className="ml-2 min-w-0 flex-1 text-xl font-black tracking-tight text-slate-900">CASHFLOW</span>
    </header>
  );
}

