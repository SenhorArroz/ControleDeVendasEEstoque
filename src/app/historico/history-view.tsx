"use client";

import { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  UserPlus, 
  Truck, 
  Filter, 
  Search, 
  Calendar,
  CreditCard,
  Banknote,
  QrCode,
  Wallet,
  MoreHorizontal,
  PackagePlus, // Novo ícone para produto
  ScanBarcode  // Novo ícone para código
} from "lucide-react";

// --- TIPOS ATUALIZADOS ---
export type HistoryEvent = {
  id: string;
  // Adicionei NEW_PRODUCT e NEW_BARCODE
  type: "SALE" | "EXPENSE" | "NEW_CLIENT" | "NEW_SUPPLIER" | "NEW_PRODUCT" | "NEW_BARCODE";
  date: Date;
  title: string;
  subtitle: string;
  amount?: number;
  status?: string;
  paymentMethod?: string;
  details?: any;
};

// ... (PaymentIcon mantém igual) ...
const PaymentIcon = ({ method }: { method?: string }) => {
  if (!method) return null;
  switch (method) {
    case "PIX": return <QrCode className="w-3 h-3" />;
    case "DINHEIRO": return <Banknote className="w-3 h-3" />;
    case "CREDITO":
    case "DEBITO": return <CreditCard className="w-3 h-3" />;
    default: return <Wallet className="w-3 h-3" />;
  }
};

export default function HistoryView({ events }: { events: HistoryEvent[] }) {
  const [filter, setFilter] = useState<"ALL" | "MONEY" | "SYSTEM">("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const formatMoney = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const filteredEvents = events.filter((ev) => {
    // 1. Filtro de Tipo
    if (filter === "MONEY" && !["SALE", "EXPENSE"].includes(ev.type)) return false;
    // Agora SYSTEM inclui produtos e códigos também
    if (filter === "SYSTEM" && !["NEW_CLIENT", "NEW_SUPPLIER", "NEW_PRODUCT", "NEW_BARCODE"].includes(ev.type)) return false;

    // 2. Filtro de Texto
    const searchLower = searchTerm.toLowerCase();
    return (
      ev.title.toLowerCase().includes(searchLower) ||
      ev.subtitle.toLowerCase().includes(searchLower)
    );
  });

  // --- NOVOS ESTILOS ---
  const getStyle = (type: string) => {
    switch (type) {
      case "SALE": return { icon: TrendingUp, bg: "bg-emerald-500/10", text: "text-emerald-600", label: "Venda" };
      case "EXPENSE": return { icon: TrendingDown, bg: "bg-red-500/10", text: "text-red-600", label: "Despesa" };
      case "NEW_CLIENT": return { icon: UserPlus, bg: "bg-blue-500/10", text: "text-blue-600", label: "Cliente" };
      case "NEW_SUPPLIER": return { icon: Truck, bg: "bg-purple-500/10", text: "text-purple-600", label: "Fornecedor" };
      
      // NOVOS CASOS
      case "NEW_PRODUCT": return { icon: PackagePlus, bg: "bg-orange-500/10", text: "text-orange-600", label: "Produto" };
      case "NEW_BARCODE": return { icon: ScanBarcode, bg: "bg-indigo-500/10", text: "text-indigo-600", label: "Código" };
      
      default: return { icon: Filter, bg: "bg-gray-100", text: "text-gray-600", label: "Log" };
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 bg-base-200 min-h-screen font-sans">
      
      {/* HEADER (Igual ao anterior) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-base-content">Histórico Global</h1>
          <p className="text-sm opacity-60">Registro unificado de transações, estoque e cadastros.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="join shadow-sm w-full sm:w-auto">
            <input 
              className="join-item input input-bordered w-full sm:w-64 focus:input-primary" 
              placeholder="Buscar..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="join-item btn btn-square border-base-300">
              <Search className="w-5 h-5 opacity-60" />
            </button>
          </div>

          <div className="join shadow-sm w-full sm:w-auto">
            <button className={`join-item btn flex-1 ${filter === 'ALL' ? 'btn-active btn-neutral' : 'bg-base-100'}`} onClick={() => setFilter("ALL")}>Todos</button>
            <button className={`join-item btn flex-1 ${filter === 'MONEY' ? 'btn-active btn-neutral' : 'bg-base-100'}`} onClick={() => setFilter("MONEY")}>Financeiro</button>
            <button className={`join-item btn flex-1 ${filter === 'SYSTEM' ? 'btn-active btn-neutral' : 'bg-base-100'}`} onClick={() => setFilter("SYSTEM")}>Sistema</button>
          </div>
        </div>
      </div>

      {/* LISTA DE EVENTOS */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 opacity-50">
            <Filter className="w-12 h-12 mx-auto mb-2" />
            <p>Nenhum registro encontrado.</p>
          </div>
        ) : (
          filteredEvents.map((ev) => {
            const style = getStyle(ev.type);
            const Icon = style.icon;

            return (
              <div key={`${ev.type}-${ev.id}`} className="card bg-base-100 shadow-sm border border-base-200 hover:border-base-300 transition-colors">
                <div className="card-body p-4 flex-row items-center gap-4">
                  
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${style.bg}`}>
                    <Icon className={`w-6 h-6 ${style.text}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`badge badge-xs font-bold border-none py-2 px-2 ${style.bg} ${style.text}`}>
                        {style.label}
                      </span>
                      <span className="text-xs opacity-50 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {ev.date.toLocaleDateString()} às {ev.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-base truncate">{ev.title}</h3>
                    <p className="text-sm opacity-60 truncate">{ev.subtitle}</p>
                    
                    {ev.type === "SALE" && (
                      <div className="mt-1 flex gap-2 text-xs opacity-70">
                        <span className="flex items-center gap-1 bg-base-200 px-2 py-0.5 rounded">
                          <PaymentIcon method={ev.paymentMethod} /> {ev.paymentMethod}
                        </span>
                        {ev.status !== 'COMPLETED' && <span className="badge badge-warning badge-xs">Pendente</span>}
                      </div>
                    )}
                  </div>

                  {ev.amount !== undefined && (
                    <div className="text-right shrink-0">
                      <div className={`font-mono font-bold text-lg ${ev.type === 'SALE' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {ev.type === 'SALE' ? '+' : '-'} {formatMoney(ev.amount)}
                      </div>
                      {ev.type === 'SALE' && <div className="text-xs opacity-50">{ev.details?.itemsCount} itens</div>}
                    </div>
                  )}
                  
                  <button className="btn btn-square btn-ghost btn-sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}