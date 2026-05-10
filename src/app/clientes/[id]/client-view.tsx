"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import {
  ArrowLeft, User, MapPin, Phone, Calendar, ShoppingBag, DollarSign,
  TrendingUp, Clock, Edit, Loader2, X, CreditCard, 
  Banknote, QrCode, Wallet, CheckCircle2, AlertCircle, Ban, Menu, Trash2,
  AlertTriangle
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
    case "PIX": return <QrCode className="w-4 h-4 text-emerald-500" />;
    case "DINHEIRO": return <Banknote className="w-4 h-4 text-emerald-600" />;
    case "CREDITO":
    case "DEBITO": return <CreditCard className="w-4 h-4 text-blue-500" />;
    default: return <Wallet className="w-4 h-4 text-slate-400" />;
  }
};

interface ClientViewProps {
  client: any;
}

export default function ClientView({ client }: ClientViewProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  
  // NOVO ESTADO: Controla qual compra será deletada no Modal
  const [purchaseToDelete, setPurchaseToDelete] = useState<string | null>(null);

  const [clientForm, setClientForm] = useState({
    name: client.name,
    phone: client.phone || "",
    address: client.address || "",
    status: client.status,
  });

  const [purchaseToEdit, setPurchaseToEdit] = useState<{ id: string; status: string; metodoPagamento: string } | null>(null);

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
      toast.success("Venda excluída e estoque restaurado!");
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
        status: purchase.status, 
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

  // --- CÁLCULOS E FORMATAÇÃO ---
  const totalSpent = client.purchases
    .filter((p: any) => p.status === "COMPLETED")
    .reduce((acc: number, p: any) => acc + Number(p.total), 0);

  const lastOrderDate = client.purchases[0]?.date
    ? new Date(client.purchases[0].date).toLocaleDateString("pt-BR")
    : "Sem histórico";

  const formatMoney = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <div className="drawer-content flex flex-col">
      <div className="w-full navbar bg-white lg:hidden border-b border-slate-100 px-6">
        <label htmlFor="my-drawer-2" className="btn btn-ghost drawer-button lg:hidden">
          <Menu className="w-6 h-6" />
        </label>
        <div className="flex-1 font-black text-xl tracking-tighter">CASHFLOW</div>
      </div>

      <main className="p-6 md:p-12 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-7xl mx-auto w-full">
        
        <div className="flex items-center gap-4">
          <Link href="/clientes" className="btn btn-circle btn-ghost bg-white shadow-sm border border-slate-100 hover:bg-slate-50">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Dossiê do Cliente</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50 text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary/10 to-transparent"></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 rounded-[2rem] bg-primary flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-primary/30 mb-6 group-hover:scale-105 transition-transform">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{client.name}</h2>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    client.status === "ATIVO" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                  }`}>
                    {client.status}
                  </span>
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1 bg-slate-50 px-3 py-1 rounded-full">
                    <Calendar className="w-3 h-3" /> {new Date(client.createdAt).getFullYear()}
                  </span>
                </div>
                <button onClick={() => setIsClientModalOpen(true)} className="btn btn-outline border-slate-200 text-slate-600 rounded-2xl mt-8 w-full font-black text-xs tracking-widest hover:bg-slate-50 hover:text-primary hover:border-primary/30">
                  <Edit className="w-4 h-4 mr-2" /> EDITAR PERFIL
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50 space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contato & Localização</h3>
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-primary shadow-inner">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Telefone / WhatsApp</p>
                    <p className="font-bold text-sm text-slate-800">{client.phone || "Não informado"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-primary shadow-inner shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Endereço Principal</p>
                    <p className="font-bold text-sm text-slate-800 leading-tight">{client.address || "Não informado"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50 space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Métricas do Cliente</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"><DollarSign className="w-4 h-4"/></div>
                    <span className="font-bold text-xs text-slate-500 uppercase">LTV (Gasto)</span>
                  </div>
                  <span className="font-black text-emerald-600">{formatMoney(totalSpent)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><ShoppingBag className="w-4 h-4"/></div>
                    <span className="font-bold text-xs text-slate-500 uppercase">Pedidos</span>
                  </div>
                  <span className="font-black text-slate-800">{client.purchases.length}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-xl"><Clock className="w-4 h-4"/></div>
                    <span className="font-bold text-xs text-slate-500 uppercase">Última Compra</span>
                  </div>
                  <span className="font-black text-slate-800 text-sm">{lastOrderDate}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-50 h-full overflow-hidden flex flex-col">
              <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                <h3 className="font-black text-slate-800 text-lg uppercase tracking-widest flex items-center gap-3">
                  <TrendingUp className="text-primary w-5 h-5"/> Histórico de Compras
                </h3>
              </div>

              <div className="overflow-x-auto flex-1 p-4">
                <table className="table w-full border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-none">
                      <th className="pl-4">Data</th>
                      <th>Status</th>
                      <th>Pagamento</th>
                      <th>Resumo</th>
                      <th className="text-right pr-4">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {client.purchases.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-20 text-slate-400">
                          <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-20" />
                          <p className="font-bold italic">Nenhuma compra registrada.</p>
                        </td>
                      </tr>
                    ) : (
                      client.purchases.map((purchase: any) => {
                        const itemsSummary = purchase.items.length > 0
                          ? `${purchase.items[0]?.product.name} ${purchase.items.length > 1 ? `(+${purchase.items.length - 1})` : ""}`
                          : "Sem itens";

                        return (
                          <tr key={purchase.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="pl-4 rounded-l-2xl">
                              <div className="font-bold text-slate-700 text-sm">{new Date(purchase.date).toLocaleDateString("pt-BR")}</div>
                              <div className="text-[10px] font-black text-slate-400 mt-0.5">{new Date(purchase.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div>
                            </td>
                            <td>
                              <button
                                onClick={() => handleOpenStatusModal(purchase)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all hover:scale-105 flex items-center gap-1.5 ${
                                  purchase.status === "COMPLETED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                                  purchase.status === "PENDING" ? "bg-amber-50 text-amber-600 border-amber-100" : 
                                  "bg-rose-50 text-rose-600 border-rose-100"
                                }`}
                              >
                                {purchase.status === "COMPLETED" && <CheckCircle2 size={12} />}
                                {purchase.status === "PENDING" && <AlertCircle size={12} />}
                                {purchase.status === "CANCELED" && <Ban size={12} />}
                                {purchase.status === "COMPLETED" ? "Pago" : purchase.status === "PENDING" ? "Pendente" : "Cancelado"}
                                <Edit size={10} className="ml-1 opacity-50 group-hover:opacity-100" />
                              </button>
                            </td>
                            <td>
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                <PaymentIcon method={purchase.metodoPagamento} />
                                {purchase.metodoPagamento || "N/A"}
                              </div>
                            </td>
                            <td>
                              <div className="text-xs font-bold text-slate-700 max-w-[150px] truncate" title={itemsSummary}>{itemsSummary}</div>
                              <div className="text-[10px] font-black text-slate-400 uppercase mt-0.5">{purchase.items.length} itens</div>
                            </td>
                            {/* CÉLULA DO TOTAL + BOTÃO EXCLUIR */}
                            <td className="text-right pr-4 rounded-r-2xl">
                                <div className="flex items-center justify-end gap-3">
                                    <span className="font-black text-slate-900">{formatMoney(Number(purchase.total))}</span>
                                    <button 
                                      onClick={() => setPurchaseToDelete(purchase.id)}
                                      className="p-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-100 rounded-xl transition-colors"
                                      title="Deletar compra"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL 1: EDITAR CLIENTE */}
      {isClientModalOpen && (
        <dialog className="modal modal-open backdrop-blur-sm bg-slate-900/40 z-[100] animate-in fade-in">
          <div className="modal-box w-11/12 max-w-xl rounded-[3rem] p-10 shadow-2xl border border-white">
            <div className="flex justify-between items-center border-b border-slate-100 pb-6 mb-8">
              <h3 className="font-black text-2xl tracking-tighter flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl text-primary"><User size={24}/></div>
                Editar Perfil
              </h3>
              <button onClick={() => setIsClientModalOpen(false)} className="btn btn-ghost btn-circle btn-sm"><X size={20}/></button>
            </div>
            <form onSubmit={handleSaveClient} className="space-y-6">
              <div className="form-control">
                <label className="label uppercase text-[10px] font-black text-slate-400 tracking-widest px-1">Nome Completo</label>
                <input required className="input input-bordered w-full rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-800" 
                  value={clientForm.name} onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label uppercase text-[10px] font-black text-slate-400 tracking-widest px-1">Telefone</label>
                  <input className="input input-bordered w-full rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-800" 
                    value={clientForm.phone} onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })} />
                </div>
                <div className="form-control">
                  <label className="label uppercase text-[10px] font-black text-slate-400 tracking-widest px-1">Status</label>
                  <select className="select select-bordered w-full rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-800"
                    value={clientForm.status} onChange={(e) => setClientForm({ ...clientForm, status: e.target.value })}>
                    <option value="ATIVO">ATIVO</option>
                    <option value="INATIVO">INATIVO</option>
                  </select>
                </div>
              </div>
              <div className="form-control">
                <label className="label uppercase text-[10px] font-black text-slate-400 tracking-widest px-1">Endereço Completo</label>
                <input className="input input-bordered w-full rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-800" 
                  value={clientForm.address} onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })} />
              </div>
              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setIsClientModalOpen(false)} className="btn btn-ghost flex-1 rounded-2xl font-black text-xs tracking-widest" disabled={isSubmitting}>
                  CANCELAR
                </button>
                <button type="submit" className="btn btn-primary flex-1 rounded-2xl font-black text-xs tracking-widest shadow-lg shadow-primary/20 border-none" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : "SALVAR ALTERAÇÕES"}
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}

      {/* MODAL 2: EDITAR STATUS E PAGAMENTO DA VENDA */}
      {isStatusModalOpen && purchaseToEdit && (
        <dialog className="modal modal-open backdrop-blur-sm bg-slate-900/60 z-[100] animate-in fade-in">
          <div className="modal-box p-8 rounded-[2.5rem] shadow-2xl max-w-sm border border-white text-center">
            <h3 className="font-black text-xl mb-6 uppercase tracking-widest text-slate-800">Detalhes da Venda</h3>
            
            <div className="space-y-6">
                {/* 1. STATUS */}
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 text-left">Situação da Venda</label>
                    <div className="flex flex-col gap-2">
                        <button onClick={() => setPurchaseToEdit({ ...purchaseToEdit, status: "COMPLETED" })}
                            className={`flex items-center justify-center gap-3 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${purchaseToEdit.status === "COMPLETED" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" : "bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500"}`}>
                            <CheckCircle2 size={16} /> Pago (Concluído)
                        </button>
                        <button onClick={() => setPurchaseToEdit({ ...purchaseToEdit, status: "PENDING" })}
                            className={`flex items-center justify-center gap-3 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${purchaseToEdit.status === "PENDING" ? "bg-amber-500 text-white shadow-lg shadow-amber-200" : "bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-500"}`}>
                            <AlertCircle size={16} /> Pendente (Fiado)
                        </button>
                        <button onClick={() => setPurchaseToEdit({ ...purchaseToEdit, status: "CANCELED" })}
                            className={`flex items-center justify-center gap-3 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${purchaseToEdit.status === "CANCELED" ? "bg-rose-500 text-white shadow-lg shadow-rose-200" : "bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500"}`}>
                            <Ban size={16} /> Cancelado
                        </button>
                    </div>
                </div>

                <div className="border-t border-slate-100 w-full" />

                {/* 2. FORMA DE PAGAMENTO */}
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 text-left">Método de Pagamento</label>
                    <div className="grid grid-cols-2 gap-2">
                        {PAYMENT_METHODS.map((m) => (
                            <button 
                                key={m.id} 
                                onClick={() => setPurchaseToEdit({ ...purchaseToEdit, metodoPagamento: m.id })}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${purchaseToEdit.metodoPagamento === m.id ? "border-primary bg-primary/5 text-primary shadow-[0_0_15px_-3px_rgba(var(--primary),0.2)]" : "border-slate-100 bg-white text-slate-400 hover:bg-slate-50"}`}
                            >
                                <m.icon size={18} />
                                <span className="text-[9px] font-black uppercase">{m.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button onClick={() => setIsStatusModalOpen(false)} className="btn btn-ghost flex-1 rounded-xl font-black text-xs" disabled={isSubmitting}>CANCELAR</button>
              <button onClick={handleSaveStatus} className="btn btn-primary flex-1 rounded-xl font-black text-xs shadow-lg shadow-primary/30 border-none" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : "SALVAR"}
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* MODAL 3: CONFIRMAR EXCLUSÃO DE VENDA */}
      {purchaseToDelete && (
        <dialog className="modal modal-open bg-slate-900/60 backdrop-blur-md z-[100] animate-in fade-in">
          <div className="modal-box p-0 overflow-hidden bg-white rounded-[3rem] shadow-2xl max-w-md border border-rose-100 text-center flex flex-col">
            <div className="h-3 w-full bg-rose-500" />
            <div className="p-10">
              
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-rose-50 border-8 border-white shadow-xl">
                <Trash2 size={40} className="text-rose-500" />
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Excluir Venda?</h3>
              <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed">
                Você está prestes a apagar este registro. O estoque dos produtos vinculados será <strong className="text-slate-800">restaurado automaticamente</strong>.
              </p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={executeDeletePurchase}
                  disabled={deletePurchaseMutation.isPending}
                  className="py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white bg-rose-500 shadow-xl shadow-rose-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 border-none"
                >
                  {deletePurchaseMutation.isPending ? <Loader2 className="animate-spin w-5 h-5" /> : "SIM, EXCLUIR VENDA"}
                </button>
                <button
                  onClick={() => setPurchaseToDelete(null)}
                  disabled={deletePurchaseMutation.isPending}
                  className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors border-none"
                >
                  CANCELAR E MANTER
                </button>
              </div>

            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}