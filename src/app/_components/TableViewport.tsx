import type { ReactNode } from "react";

export default function TableViewport({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className="min-w-0 w-full">
      <p className="px-4 pt-3 text-xs font-medium text-slate-500 sm:hidden [overflow-wrap:anywhere]">Deslize a tabela para ver todas as informações e ações.</p>
      <div role="region" aria-label="Tabela com rolagem horizontal" tabIndex={0} className={`min-w-0 w-full overflow-x-auto overscroll-x-contain focus-visible:outline-2 focus-visible:outline-orange-600 ${className}`}>
        {children}
      </div>
    </div>
  );
}
