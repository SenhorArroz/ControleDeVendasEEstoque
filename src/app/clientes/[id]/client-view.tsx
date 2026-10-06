"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import {
  ArrowLeft, User, MapPin, Phone, Calendar, ShoppingBag, DollarSign,
  TrendingUp, Clock, Edit, Loader2, X, CreditCard, 
  Banknote, QrCode, Wallet, CheckCircle2, AlertCircle, Ban, Activity, Trash2,
  Package, Filter, ChevronDown, ChevronUp, Eye
} from "lucide-react";

// --- Arrays e Ícones de Pagamento ---
const PAYMENT_METHODS = [
  { id: "DINHEIRO", label: "Dinheiro", icon: Banknote },
  { id: "PIX", label: "Pix", icon: QrCode },
  { id: "DEBITO", label: "Débito", icon: CreditCard },
  { id: "CREDITO", label: "Crédito", icon: CreditCard },
];

const PaymentIcon = ({ method }: { method: string }) => {
  switch (method) {
    case "PIX": return <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />;
    case "DINHEIRO": return <Banknote className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />;
    case "CREDITO":
    case "DEBITO": return <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />;
    default: return <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />;
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    COMPLETED: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", label: "Pago", icon: CheckCircle2 },
    PENDING: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100", label: "Pendente", icon: AlertCircle },
    CANCELED: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100", label: "Cancelado", icon: Ban },
  }[status] || { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-100", label: status, icon: AlertCircle };
  
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest border ${config.bg} ${config.text} ${config.border}`}>
      <Icon size={10} />
      {config.label}
    </span>
  );
};

interface ClientViewProps {
  client: any;
}

type StatusFilter = "ALL" | "COMPLETED" | "PENDING";

export default function ClientView({ client }: ClientViewProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  
  // NOVO ESTADO: Controla qual compra será deletada no Modal
  const [purchaseToDelete, setPurchaseToDelete] = useState<string | null>(null);

  // NOVO: Filtro de status para itens
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  
  // NOVO: Controla quais vendas estão expandidas
  const [expandedPurchases, setExpandedPurchases] = useState<Set<string>>(new Set());

  const [clientForm, setClientForm] = useState({
    name: client.name,
    phone: client.phone || "",
    address: client.address || "",
    status: client.status,
  });

  const [purchaseToEdit, setPurchaseToEdit] = useState<{ id: string; status: "PENDING" | "COMPLETED" | "CANCELED"; metodoPagamento: string } | null>(null);

  const utils = api.useUtils();

  // --- MUTAÇÕES ---
  const updateClientMutation = api.cliente.update.useMutation({
    onSuccess: () => {
      setIsClientModalOpen(false);
      utils.cliente.getAll.invalidate();
      router.refresh();
      toast.success("Perfil atualizado com sucesso!");
    },
    onError: (err) => toast.error(err.message),
  });

  const updatePurchaseStatusMutation = api.compra.updateStatus.useMutation({
    onSuccess: () => {
      setIsStatusModalOpen(false);
      setPurchaseToEdit(null);
      router.refresh();
      toast.success("Dados da venda atualizados!");
    },
    onError: (err) => toast.error(err.message),
  });

  const deletePurchaseMutation = api.compra.delete.useMutation({
    onSuccess: () => {
      setPurchaseToDelete(null); // Fecha o modal
      router.refresh();
      toast.success("Venda excluída com sucesso!");
    },
    onError: (err) => toast.error(err.message),
  });

  // --- HANDLERS ---
  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await updateClientMutation.mutateAsync({ id: client.id, ...clientForm });
    setIsSubmitting(false);
  };

  const handleOpenStatusModal = (purchase: any) => {
    setPurchaseToEdit({ 
        id: purchase.id, 
        status: purchase.status as "PENDING" | "COMPLETED" | "CANCELED",
        metodoPagamento: purchase.metodoPagamento || "DINHEIRO" 
    });
    setIsStatusModalOpen(true);
  };

  const handleSaveStatus = async () => {
    if (!purchaseToEdit) return;
    setIsSubmitting(true);
    await updatePurchaseStatusMutation.mutateAsync({
      id: purchaseToEdit.id,
      status: purchaseToEdit.status,
      metodoPagamento: purchaseToEdit.metodoPagamento,
    });
    setIsSubmitting(false);
  };

  const executeDeletePurchase = async () => {
    if (!purchaseToDelete) return;
    await deletePurchaseMutation.mutateAsync({ id: purchaseToDelete });
  };

  const toggleExpanded = (purchaseId: string) => {
    setExpandedPurchases(prev => {
      const next = new Set(prev);
      if (next.has(purchaseId)) {
        next.delete(purchaseId);
      } else {
        next.add(purchaseId);
      }
      return next;
    });
  };

  // --- CÁLCULOS E FORMATAÇÃO ---
  const totalSpent = client.purchases
    .filter((p: any) => p.status === "COMPLETED")
    .reduce((acc: number, p: any) => acc + Number(p.total), 0);

  const pendingTotal = client.purchases
    .filter((p: any) => p.status === "PENDING")
    .reduce((acc: number, p: any) => acc + Number(p.total), 0);

  const lastOrderDate = client.purchases[0]?.date
    ? new Date(client.purchases[0].date).toLocaleDateString("pt-BR")
    : "Sem histórico";

  const formatMoney = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  // Filtrar compras por status
  const filteredPurchases = useMemo(() => {
    if (statusFilter === "ALL") return client.purchases;
    return client.purchases.filter((p: any) => p.status === statusFilter);
  }, [client.purchases, statusFilter]);

  // Contar itens totais
  const totalItems = useMemo(() => {
    return client.purchases.reduce((acc: number, p: any) => acc + (p.items?.length || 0), 0);
  }, [client.purchases]);

  const completedCount = client.purchases.filter((p: any) => p.status === "COMPLETED").length;
  const pendingCount = client.purchases.filter((p: any) => p.status === "PENDING").length;

  return (
    <div className="drawer-content flex flex-col min-h-screen bg-slate-50 min-w-0 selection:bg-orange-600/20">
      
      {/* Mobile Navbar */}
      <div className="w-full navbar bg-white/80 backdrop-blur-md sticky top-0 z-40 lg:hidden border-b border-slate-200/50 px-4">
        <label htmlFor="my-drawer-2" className="btn btn-ghost btn-circle drawer-button lg:hidden">
          <Activity className="w-6 h-6 text-orange-600" strokeWidth={2.5} />
        </label>
        <div className="flex-1 font-black text-xl tracking-tighter text-slate-900 ml-2">CASHFLOW</div>
      </div>

      <main className="flex-1 px-4 py-4 sm:p-6 space-y-4 sm:space-y-6 max-w-[1600px] mx-auto w-full overflow-x-hidden min-w-0">
        
        <div className="flex flex-col gap-3 sm:gap-4">
          <Link href="/clientes" className="inline-flex items-center justify-center gap-2 w-fit px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-white shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-100 text-slate-500 font-bold text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:text-orange-600 transition-colors">
            <ArrowLeft size={14} /> Voltar
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1 sm:mt-2">Dossiê do Cliente</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-6 lg:p-8 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100 text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-20 sm:h-24 bg-gradient-to-b from-orange-500/10 to-transparent"></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-[2rem] bg-orange-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-black shadow-[0_8px_30px_rgba(234,88,12,0.3)] mb-4 sm:mb-6 group-hover:scale-105 transition-transform">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{client.name}</h2>
                <div className="flex items-center gap-2 mt-2 sm:mt-3">
                  <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest border ${
                    client.status === "ATIVO" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                  }`}>
                    {client.status}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 flex items-center gap-1.5 bg-slate-50 px-2 py-1 sm:px-3 sm:py-1 rounded-md sm:rounded-lg border border-slate-100">
                    <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {new Date(client.createdAt).getFullYear()}
                  </span>
                </div>
                <button onClick={() => setIsClientModalOpen(true)} className="flex items-center justify-center gap-2 w-full mt-6 sm:mt-8 h-10 sm:h-12 border border-slate-200 text-slate-600 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors">
                  <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Editar Perfil
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-6 lg:p-8 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100 space-y-4 sm:space-y-6">
              <h3 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Contato & Localização</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3 sm:gap-4 bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100/50">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white flex items-center justify-center text-orange-600 shadow-sm shrink-0">
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Telefone / WhatsApp</p>
                    <p className="font-bold text-xs sm:text-sm text-slate-800 mt-0.5">{client.phone || "Não informado"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100/50">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white flex items-center justify-center text-rose-500 shadow-sm shrink-0">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Endereço Principal</p>
                    <p className="font-bold text-xs sm:text-sm text-slate-800 leading-tight mt-0.5">{client.address || "Não informado"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-6 lg:p-8 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100 space-y-4 sm:space-y-6">
              <h3 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Métricas do Cliente</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100/50">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-emerald-100 text-emerald-600 rounded-lg sm:rounded-xl"><DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4"/></div>
                    <span className="font-bold text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest">LTV (Gasto)</span>
                  </div>
                  <span className="font-black text-sm sm:text-base text-emerald-600">{formatMoney(totalSpent)}</span>
                </div>
                {pendingTotal > 0 && (
                  <div className="flex justify-between items-center p-3 sm:p-4 bg-amber-50/50 rounded-xl sm:rounded-2xl border border-amber-100/50">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-amber-100 text-amber-600 rounded-lg sm:rounded-xl"><Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4"/></div>
                      <span className="font-bold text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest">Pendente</span>
                    </div>
                    <span className="font-black text-sm sm:text-base text-amber-600">{formatMoney(pendingTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100/50">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-blue-100 text-blue-600 rounded-lg sm:rounded-xl"><ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4"/></div>
                    <span className="font-bold text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest">Pedidos</span>
                  </div>
                  <span className="font-black text-sm sm:text-base text-slate-800">{client.purchases.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100/50">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-orange-100 text-orange-600 rounded-lg sm:rounded-xl"><Package className="w-3.5 h-3.5 sm:w-4 sm:h-4"/></div>
                    <span className="font-bold text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest">Total Itens</span>
                  </div>
                  <span className="font-black text-sm sm:text-base text-slate-800">{totalItems}</span>
                </div>
                <div className="flex justify-between items-center p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100/50">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-purple-100 text-purple-600 rounded-lg sm:rounded-xl"><Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4"/></div>
                    <span className="font-bold text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest">Última Compra</span>
                  </div>
                  <span className="font-black text-xs sm:text-sm text-slate-800">{lastOrderDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO PRINCIPAL: HISTÓRICO DE VENDAS COM ITENS EXPANDIDOS */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl sm:rounded-[2rem] shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden flex flex-col h-full min-w-0">
              <div className="p-5 sm:p-6 lg:p-8 border-b border-slate-100 bg-slate-50/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="font-black text-slate-800 text-sm sm:text-base lg:text-lg uppercase tracking-widest flex items-center gap-2 sm:gap-3">
                    <TrendingUp className="text-orange-600 w-4 h-4 sm:w-5 sm:h-5"/> Histórico de Vendas & Itens
                  </h3>
                  {/* FILTROS */}
                  <div className="flex items-center gap-1.5 bg-slate-100/50 p-1 rounded-xl">
                    <button 
                      onClick={() => setStatusFilter("ALL")}
                      className={`px-3 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                        statusFilter === "ALL" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      Todas ({client.purchases.length})
                    </button>
                    <button 
                      onClick={() => setStatusFilter("COMPLETED")}
                      className={`px-3 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                        statusFilter === "COMPLETED" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-400 hover:text-emerald-600"
                      }`}
                    >
                      Pagas ({completedCount})
                    </button>
                    <button 
                      onClick={() => setStatusFilter("PENDING")}
                      className={`px-3 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                        statusFilter === "PENDING" ? "bg-amber-500 text-white shadow-sm" : "text-slate-400 hover:text-amber-600"
                      }`}
                    >
                      Pendentes ({pendingCount})
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
                {filteredPurchases.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 sm:py-16">
                    <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-slate-200" />
                    <p className="text-slate-400 font-bold text-xs sm:text-sm">
                      {statusFilter === "ALL" ? "Nenhuma compra registrada." : `Nenhuma venda ${statusFilter === "COMPLETED" ? "confirmada" : "pendente"}.`}
                    </p>
                  </div>
                ) : (
                  filteredPurchases.map((purchase: any) => {
                    const isExpanded = expandedPurchases.has(purchase.id);
                    const purchaseItemCount = purchase.items?.length || 0;
                    
                    return (
                      <div 
                        key={purchase.id} 
                        className={`rounded-2xl border transition-all overflow-hidden ${
                          purchase.status === "PENDING" 
                            ? "border-amber-100 bg-amber-50/30" 
                            : purchase.status === "CANCELED"
                            ? "border-rose-100 bg-rose-50/20"
                            : "border-slate-100 bg-white"
                        }`}
                      >
                        {/* CABEÇALHO DA VENDA */}
                        <div className="flex items-center gap-3 p-3 sm:p-4 cursor-pointer hover:bg-slate-50/50 transition-colors" onClick={() => toggleExpanded(purchase.id)}>
                          <div className="flex-1 min-w-0 flex items-center gap-3">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-700 text-xs sm:text-sm">{new Date(purchase.date).toLocaleDateString("pt-BR")}</span>
                              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400">{new Date(purchase.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                            <StatusBadge status={purchase.status} />
                            <div className="hidden sm:flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
                              <PaymentIcon method={purchase.metodoPagamento} />
                              {purchase.metodoPagamento || "N/A"}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="text-right">
                              <span className="font-black text-sm sm:text-base text-slate-900">{formatMoney(Number(purchase.total))}</span>
                              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400">{purchaseItemCount} {purchaseItemCount === 1 ? 'item' : 'itens'}</p>
                            </div>
                            
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleOpenStatusModal(purchase); }}
                              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg sm:rounded-xl transition-colors"
                              title="Editar status"
                            >
                              <Edit size={12} className="sm:w-3.5 sm:h-3.5" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setPurchaseToDelete(purchase.id); }}
                              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-100 rounded-lg sm:rounded-xl transition-colors"
                              title="Deletar compra"
                            >
                              <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                            </button>
                            <div className={`p-1 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                              <ChevronDown size={16} />
                            </div>
                          </div>
                        </div>

                        {/* ITENS EXPANDIDOS */}
                        {isExpanded && purchase.items && purchase.items.length > 0 && (
                          <div className="border-t border-slate-100/80 bg-slate-50/30">
                            <div className="px-3 sm:px-4 py-2 border-b border-slate-100/50">
                              <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Package size={10} /> Itens desta venda
                              </span>
                            </div>
                            <div className="divide-y divide-slate-100/50">
                              {purchase.items.map((item: any, idx: number) => (
                                <div key={item.id || idx} className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-white/60 transition-colors">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                                    {item.product?.imageUrl ? (
                                      <img src={item.product.imageUrl} className="w-full h-full object-cover" />
                                    ) : (
                                      <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-300" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-xs sm:text-sm text-slate-700 truncate">{item.product?.name || "Produto removido"}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-400">{item.quantity}x {formatMoney(Number(item.unitPrice))}</span>
                                      {item.recordedBarcode && (
                                        <span className="text-[8px] sm:text-[9px] font-mono font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                          #{item.recordedBarcode}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <span className="font-black text-xs sm:text-sm text-slate-800 whitespace-nowrap">
                                    {formatMoney(Number(item.unitPrice) * item.quantity)}
                                  </span>
                                </div>
                              ))}
                            </div>
                            {purchase.desconto > 0 && (
                              <div className="px-3 sm:px-4 py-2 border-t border-slate-100/50 flex justify-between items-center">
                                <span className="text-[9px] sm:text-[10px] font-black text-emerald-500 uppercase tracking-widest">Desconto aplicado</span>
                                <span className="text-xs font-black text-emerald-600">{purchase.desconto}%</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL 1: EDITAR CLIENTE */}
      {isClientModalOpen && (
        <dialog className="modal modal-open backdrop-blur-sm bg-slate-900/40 z-[100] animate-in fade-in" onClick={(e) => { if (e.target === e.currentTarget) setIsClientModalOpen(false); }}>
          <div className="modal-box w-11/12 max-w-lg p-0 rounded-[2rem] shadow-2xl border border-white bg-slate-50 flex flex-col max-h-[90vh] overflow-hidden cursor-default">
            
            <div className="bg-white px-6 sm:px-8 py-5 flex justify-between items-center border-b border-slate-100 z-10 sticky top-0">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2.5 bg-orange-50 rounded-xl">
                    <User className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="font-black text-xl sm:text-2xl text-slate-800 tracking-tight">Editar Perfil</h3>
                </div>
                <button type="button" onClick={() => setIsClientModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 text-slate-400 transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <form onSubmit={handleSaveClient} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto p-4 sm:p-5 flex-1 custom-scrollbar space-y-6">
                
                <div className="bg-white p-5 sm:p-6 rounded-[1.5rem] shadow-[0_2px_15px_rgb(0,0,0,0.02)] border border-slate-100 space-y-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">Nome Completo</label>
                    <input required className="w-full rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-800 h-12 px-4 transition-all text-sm" 
                      value={clientForm.name} onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">Telefone</label>
                      <input className="w-full rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-800 h-12 px-4 transition-all text-sm" 
                        value={clientForm.phone} onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">Status</label>
                      <select className="w-full rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-800 h-12 px-4 transition-all text-sm appearance-none"
                        value={clientForm.status} onChange={(e) => setClientForm({ ...clientForm, status: e.target.value })}>
                        <option value="ATIVO">ATIVO</option>
                        <option value="INATIVO">INATIVO</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">Endereço Completo</label>
                    <input className="w-full rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-800 h-12 px-4 transition-all text-sm" 
                      value={clientForm.address} onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })} />
                  </div>
                </div>

              </div>
              <div className="bg-white px-6 sm:px-8 py-4 sm:py-5 flex justify-end gap-3 sm:gap-4 border-t border-slate-100 z-10 sticky bottom-0 shrink-0">
                <button type="button" onClick={() => setIsClientModalOpen(false)} className="flex items-center justify-center px-6 sm:px-8 h-10 sm:h-12 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 transition-colors" disabled={isSubmitting}>
                  Cancelar
                </button>
                <button type="submit" className="flex items-center justify-center px-8 sm:px-10 h-10 sm:h-12 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-[0_8px_20px_rgba(234,88,12,0.3)] hover:shadow-[0_8px_25px_rgba(234,88,12,0.4)] hover:-translate-y-0.5 border-none transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[0_8px_20px_rgba(234,88,12,0.3)]" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" /> : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}

      {/* MODAL 2: EDITAR STATUS E PAGAMENTO DA VENDA */}
      {isStatusModalOpen && purchaseToEdit && (
        <dialog className="modal modal-open backdrop-blur-sm bg-slate-900/40 z-[100] animate-in fade-in" onClick={(e) => { if (e.target === e.currentTarget) setIsStatusModalOpen(false); }}>
          <div className="modal-box w-11/12 max-w-sm p-0 rounded-[2rem] shadow-2xl border border-white bg-slate-50 flex flex-col overflow-hidden cursor-default">
            
            <div className="bg-white px-6 sm:px-8 py-5 flex justify-between items-center border-b border-slate-100">
                <h3 className="font-black text-lg sm:text-xl text-slate-800 tracking-tight">Detalhes da Venda</h3>
                <button type="button" onClick={() => setIsStatusModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 text-slate-400 transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="p-5 sm:p-6 space-y-6">
                {/* 1. STATUS */}
                <div className="bg-white p-4 sm:p-5 rounded-[1.5rem] shadow-[0_2px_15px_rgb(0,0,0,0.02)] border border-slate-100">
                    <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Situação da Venda</label>
                    <div className="flex flex-col gap-2">
                        <button onClick={() => setPurchaseToEdit({ ...purchaseToEdit, status: "COMPLETED" })}
                            className={`flex items-center justify-center gap-2 sm:gap-3 h-10 sm:h-12 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all border ${purchaseToEdit.status === "COMPLETED" ? "bg-emerald-500 border-emerald-500 text-white shadow-[0_4px_15px_rgba(16,185,129,0.3)]" : "bg-slate-50 border-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"}`}>
                            <CheckCircle2 size={16} className="sm:w-4 sm:h-4" /> Pago (Concluído)
                        </button>
                        <button onClick={() => setPurchaseToEdit({ ...purchaseToEdit, status: "PENDING" })}
                            className={`flex items-center justify-center gap-2 sm:gap-3 h-10 sm:h-12 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all border ${purchaseToEdit.status === "PENDING" ? "bg-amber-500 border-amber-500 text-white shadow-[0_4px_15px_rgba(245,158,11,0.3)]" : "bg-slate-50 border-slate-100 text-slate-400 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200"}`}>
                            <AlertCircle size={16} className="sm:w-4 sm:h-4" /> Pendente (Fiado)
                        </button>
                        <button onClick={() => setPurchaseToEdit({ ...purchaseToEdit, status: "CANCELED" })}
                            className={`flex items-center justify-center gap-2 sm:gap-3 h-10 sm:h-12 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all border ${purchaseToEdit.status === "CANCELED" ? "bg-rose-500 border-rose-500 text-white shadow-[0_4px_15px_rgba(244,63,94,0.3)]" : "bg-slate-50 border-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"}`}>
                            <Ban size={16} className="sm:w-4 sm:h-4" /> Cancelado
                        </button>
                    </div>
                </div>

                {/* 2. FORMA DE PAGAMENTO */}
                <div className="bg-white p-4 sm:p-5 rounded-[1.5rem] shadow-[0_2px_15px_rgb(0,0,0,0.02)] border border-slate-100">
                    <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Método de Pagamento</label>
                    <div className="grid grid-cols-2 gap-2">
                        {PAYMENT_METHODS.map((m) => (
                            <button 
                                key={m.id} 
                                onClick={() => setPurchaseToEdit({ ...purchaseToEdit, metodoPagamento: m.id })}
                                className={`flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border transition-all ${purchaseToEdit.metodoPagamento === m.id ? "border-orange-500 bg-orange-50 text-orange-600 shadow-[0_4px_15px_rgba(234,88,12,0.1)]" : "border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100"}`}
                            >
                                <m.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">{m.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white px-6 sm:px-8 py-4 sm:py-5 flex justify-end gap-3 sm:gap-4 border-t border-slate-100 z-10 sticky bottom-0 shrink-0">
              <button onClick={() => setIsStatusModalOpen(false)} className="flex items-center justify-center flex-1 h-10 sm:h-12 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 transition-colors" disabled={isSubmitting}>Cancelar</button>
              <button onClick={handleSaveStatus} className="flex items-center justify-center flex-1 h-10 sm:h-12 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-[0_8px_20px_rgba(234,88,12,0.3)] hover:shadow-[0_8px_25px_rgba(234,88,12,0.4)] hover:-translate-y-0.5 border-none transition-all disabled:opacity-50" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" /> : "Salvar"}
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* MODAL 3: CONFIRMAR EXCLUSÃO DE VENDA */}
      {purchaseToDelete && (
        <dialog className="modal modal-open bg-slate-900/40 backdrop-blur-sm z-[100] animate-in fade-in" onClick={(e) => { if (e.target === e.currentTarget) setPurchaseToDelete(null); }}>
          <div className="modal-box w-11/12 max-w-sm p-6 sm:p-8 rounded-[2rem] shadow-2xl border border-white bg-white text-center cursor-default">
            
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6">
                <Trash2 className="w-8 h-8 sm:w-10 sm:h-10 text-rose-500" />
            </div>
            
            <h3 className="font-black text-xl sm:text-2xl text-slate-900 mb-2">Excluir Venda?</h3>
            <p className="text-sm sm:text-base text-slate-500 mb-6 sm:mb-8 font-medium">
              O estoque dos itens vinculados será <strong className="text-slate-800">restaurado</strong> automaticamente.
            </p>
            
            <div className="flex flex-col gap-2 sm:gap-3">
              <button
                onClick={executeDeletePurchase}
                disabled={deletePurchaseMutation.isPending}
                className="w-full h-10 sm:h-12 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest bg-rose-500 text-white shadow-[0_8px_20px_rgba(244,63,94,0.3)] hover:shadow-[0_8px_25px_rgba(244,63,94,0.4)] hover:-translate-y-0.5 border-none transition-all flex items-center justify-center"
              >
                {deletePurchaseMutation.isPending ? <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" /> : "Sim, Excluir Venda"}
              </button>
              <button
                onClick={() => setPurchaseToDelete(null)}
                disabled={deletePurchaseMutation.isPending}
                className="w-full h-10 sm:h-12 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                Cancelar e Manter
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
