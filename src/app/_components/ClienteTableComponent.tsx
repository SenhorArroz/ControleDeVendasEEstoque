"use client";

import {
    Pencil, Trash2, Loader2, X, Eye, Phone, MapPin, Map
} from "lucide-react";
import { useState } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

export interface ClienteData {
    id: string;
    name: string;
    phone: string | null;
    address: string | null;
    status: string;
    purchases: any;
}

export function ClienteRow({ client }: { client: ClienteData }) {
    const router = useRouter();
    const editModalId = `edit_modal_` + client.id;
    const deleteModalId = `delete_modal_` + client.id;
    const [formData, setFormData] = useState({ name: client.name, phone: client.phone ?? "", address: client.address ?? "" });

    const { data: lastPurchaseDate, isLoading: isLoadingDate } = api.cliente.lastPurchase.useQuery({ id: client.id });
    const totalGastos = client?.purchases?.filter((p: any) => p.status === "COMPLETED")
        .reduce((acc: number, p: any) => acc + Number(p.total), 0) ?? 0;

    const utils = api.useUtils();

    const updateMutation = api.cliente.update.useMutation({
        onSuccess: () => {
            utils.cliente.getAll.invalidate();
            (document.getElementById(editModalId) as HTMLDialogElement).close();
        },
    });

    const deleteMutation = api.cliente.delete.useMutation({
        onSuccess: () => {
            utils.cliente.getAll.invalidate();
            (document.getElementById(deleteModalId) as HTMLDialogElement).close();
        },
    });

    const formatCurrency = (val: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

    return (
        <>
            <tr
                onClick={() => router.push(`/clientes/` + client.id)}
                className="group hover:bg-slate-50 transition-colors cursor-pointer"
            >
                {/* Perfil */}
                <td className="pl-4 sm:pl-6 py-4 rounded-l-2xl">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 transition-all shrink-0">
                            <span className="text-base sm:text-lg font-black uppercase">{client.name.charAt(0)}</span>
                        </div>
                        <div>
                            <span className="font-black text-slate-800 text-xs sm:text-sm tracking-tight block">
                                {client.name}
                            </span>
                            <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                {client.phone || "S/ CONTATO"}
                            </div>
                        </div>
                    </div>
                </td>

                {/* Status */}
                <td className="px-3 py-4">
                    <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest border ${
                        client.status === "ATIVO" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                    }`}>
                        {client.status}
                    </span>
                </td>

                {/* Gastos */}
                <td className="px-3 py-4">
                    <div className="font-black text-xs sm:text-sm text-slate-900">{formatCurrency(totalGastos)}</div>
                </td>

                {/* Data */}
                <td className="px-3 py-4">
                    <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase">
                        {isLoadingDate ? "..." : lastPurchaseDate ? new Date(lastPurchaseDate as string).toLocaleDateString('pt-BR') : "SEM REGISTRO"}
                    </span>
                </td>

                {/* Ações */}
                <td className="text-right pr-4 sm:pr-6 py-4 rounded-r-2xl" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={(e) => { e.stopPropagation(); (document.getElementById(editModalId) as HTMLDialogElement).showModal(); }}
                            className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-50 text-slate-500 rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-slate-200 hover:text-slate-700 transition-colors"
                            title="Editar"
                        >
                            <Pencil size={14} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); router.push(`/clientes/` + client.id); }}
                            className="h-8 sm:h-9 px-3 bg-white border border-slate-200 text-slate-600 rounded-lg sm:rounded-xl flex items-center justify-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:border-orange-500 hover:text-orange-600 hover:shadow-sm transition-all"
                        >
                            <Eye size={14} /> Detalhes
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); (document.getElementById(deleteModalId) as HTMLDialogElement).showModal(); }}
                            className="w-8 h-8 sm:w-9 sm:h-9 bg-rose-50 text-rose-500 rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"
                            title="Excluir"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </td>
            </tr>

            {/* MODAL DE EDIÇÃO */}
            <dialog id={editModalId} className="modal bg-slate-900/40 backdrop-blur-sm z-[100] animate-in fade-in" onClick={(e) => { if (e.target === e.currentTarget) (document.getElementById(editModalId) as HTMLDialogElement).close(); }}>
                <div className="modal-box w-11/12 max-w-lg p-0 rounded-[2rem] shadow-2xl border border-white flex flex-col max-h-[90vh] bg-slate-50 overflow-hidden cursor-default">
                    
                    <div className="bg-white px-6 sm:px-8 py-5 flex justify-between items-center border-b border-slate-100 z-10 sticky top-0">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="p-2.5 bg-orange-50 rounded-xl">
                                <Pencil className="w-5 h-5 text-orange-600" />
                            </div>
                            <h3 className="font-black text-xl sm:text-2xl text-slate-800 tracking-tight">Editar Cliente</h3>
                        </div>
                        <button type="button" onClick={() => (document.getElementById(editModalId) as HTMLDialogElement).close()} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 text-slate-400 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate({ id: client.id, ...formData }); }} className="overflow-y-auto p-4 sm:p-5 flex-1 custom-scrollbar space-y-6">
                        <div className="bg-white p-5 sm:p-6 rounded-[1.5rem] shadow-[0_2px_15px_rgb(0,0,0,0.02)] border border-slate-100 space-y-5">
                            <div className="flex flex-col gap-1.5">
                                <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">Nome Completo</label>
                                <input 
                                    className="w-full rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-800 h-12 px-4 transition-all text-sm" 
                                    value={formData.name} 
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                <div className="flex flex-col gap-1.5">
                                    <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">Telefone / WhatsApp</label>
                                    <input 
                                        className="w-full rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-800 h-12 px-4 transition-all text-sm" 
                                        value={formData.phone} 
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">Localização</label>
                                    <input 
                                        className="w-full rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-800 h-12 px-4 transition-all text-sm" 
                                        value={formData.address} 
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                                    />
                                </div>
                            </div>
                        </div>
                    </form>

                    <div className="bg-white px-6 sm:px-8 py-4 sm:py-5 flex justify-end gap-3 sm:gap-4 border-t border-slate-100 z-10 sticky bottom-0">
                        <button type="button" onClick={() => (document.getElementById(editModalId) as HTMLDialogElement).close()} className="flex items-center justify-center px-6 sm:px-8 h-10 sm:h-12 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 transition-colors">Cancelar</button>
                        <button type="submit" onClick={(e) => { e.preventDefault(); updateMutation.mutate({ id: client.id, ...formData }); }} className="flex items-center justify-center px-8 sm:px-10 h-10 sm:h-12 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-[0_8px_20px_rgba(234,88,12,0.3)] hover:shadow-[0_8px_25px_rgba(234,88,12,0.4)] hover:-translate-y-0.5 border-none transition-all" disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : "Salvar Alterações"}
                        </button>
                    </div>

                </div>
            </dialog>

            {/* MODAL DE EXCLUSÃO */}
            <dialog id={deleteModalId} className="modal bg-slate-900/40 backdrop-blur-sm z-[100] animate-in fade-in" onClick={(e) => { if (e.target === e.currentTarget) (document.getElementById(deleteModalId) as HTMLDialogElement).close(); }}>
                <div className="modal-box w-11/12 max-w-sm p-6 sm:p-8 rounded-[2rem] shadow-2xl border border-white bg-white text-center cursor-default">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6">
                        <Trash2 className="w-8 h-8 sm:w-10 sm:h-10 text-rose-500" />
                    </div>
                    <h3 className="font-black text-xl sm:text-2xl text-slate-900 mb-2">Excluir Cliente?</h3>
                    <p className="text-sm sm:text-base text-slate-500 mb-6 sm:mb-8 font-medium">Tem certeza que deseja excluir <strong>{client.name}</strong>? Esta ação não pode ser desfeita e removerá seus vínculos.</p>
                    
                    <div className="flex flex-col gap-2 sm:gap-3">
                        <button onClick={() => deleteMutation.mutate({ id: client.id })} className="w-full h-10 sm:h-12 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest bg-rose-500 text-white shadow-[0_8px_20px_rgba(244,63,94,0.3)] hover:shadow-[0_8px_25px_rgba(244,63,94,0.4)] hover:-translate-y-0.5 border-none transition-all" disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mx-auto" /> : "Sim, Excluir Agora"}
                        </button>
                        <button type="button" onClick={() => (document.getElementById(deleteModalId) as HTMLDialogElement).close()} className="w-full h-10 sm:h-12 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 transition-colors" disabled={deleteMutation.isPending}>
                            Cancelar
                        </button>
                    </div>
                </div>
            </dialog>
        </>
    );
}