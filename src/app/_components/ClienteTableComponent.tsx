"use client";

import {
    MoreVertical, Pencil, Trash2, Save, Loader2, X, ChevronRight, User
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
    const editModalId = `edit_modal_${client.id}`;
    const deleteModalId = `delete_modal_${client.id}`;
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
                onClick={() => router.push(`/clientes/${client.id}`)}
                className="group hover:bg-slate-50 transition-all duration-300 cursor-pointer"
            >
                {/* Perfil */}
                <td className="py-5 pl-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                            <span className="text-lg font-black">{client.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                            <div className="font-black text-slate-800 tracking-tight">{client.name}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{client.phone || "S/ CONTATO"}</div>
                        </div>
                    </div>
                </td>

                {/* Status */}
                <td>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        client.status === "ATIVO" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                    }`}>
                        {client.status}
                    </span>
                </td>

                {/* Gastos */}
                <td>
                    <div className="font-black text-slate-900">{formatCurrency(totalGastos)}</div>
                </td>

                {/* Data */}
                <td>
                    <span className="text-xs font-bold text-slate-500 uppercase">
                        {isLoadingDate ? "..." : lastPurchaseDate ? new Date(lastPurchaseDate as string).toLocaleDateString('pt-BR') : "SEM REGISTRO"}
                    </span>
                </td>

                {/* Ações */}
                <th className="text-right pr-10" onClick={(e) => e.stopPropagation()}>
                    <div className="dropdown dropdown-left">
                        <button tabIndex={0} className="btn btn-ghost btn-sm btn-circle hover:bg-slate-200">
                            <MoreVertical size={16} />
                        </button>
                        <ul tabIndex={0} className="dropdown-content z-50 menu p-2 shadow-2xl bg-slate-900 text-white rounded-2xl w-44 font-bold text-xs uppercase tracking-widest border border-slate-700">
                            <li><button onClick={() => (document.getElementById(editModalId) as HTMLDialogElement).showModal()}><Pencil size={14}/> Editar</button></li>
                            <li><button onClick={() => router.push(`/clientes/${client.id}`)}><ChevronRight size={14}/> Detalhes</button></li>
                            <li className="border-t border-slate-700 mt-2 pt-2"><button onClick={() => (document.getElementById(deleteModalId) as HTMLDialogElement).showModal()} className="text-rose-400"><Trash2 size={14}/> Excluir</button></li>
                        </ul>
                    </div>
                </th>
            </tr>

            {/* MODAL DE EDIÇÃO */}
            <dialog id={editModalId} className="modal bg-slate-900/60 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
                <div className="modal-box rounded-[2.5rem] p-10">
                    <h3 className="font-black text-xl mb-6 uppercase tracking-widest">Editar Perfil</h3>
                    <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate({ id: client.id, ...formData }); }} className="space-y-4">
                        <div className="form-control">
                            <label className="label text-[10px] font-black text-slate-400 uppercase">Nome</label>
                            <input className="input input-bordered rounded-xl bg-slate-50 font-bold" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label text-[10px] font-black text-slate-400 uppercase">Telefone</label>
                                <input className="input input-bordered rounded-xl bg-slate-50 font-bold" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                            <div className="form-control">
                                <label className="label text-[10px] font-black text-slate-400 uppercase">Endereço</label>
                                <input className="input input-bordered rounded-xl bg-slate-50 font-bold" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                            </div>
                        </div>
                        <div className="modal-action">
                            <button type="button" className="btn btn-ghost font-black text-xs" onClick={() => (document.getElementById(editModalId) as HTMLDialogElement).close()}>CANCELAR</button>
                            <button className="btn btn-primary px-8 rounded-xl font-black text-xs" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? <Loader2 className="animate-spin" /> : "SALVAR ALTERAÇÕES"}
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>

            {/* MODAL DE EXCLUSÃO */}
            <dialog id={deleteModalId} className="modal bg-rose-900/20 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
                <div className="modal-box rounded-[2rem] border border-rose-100">
                    <h3 className="font-black text-xl text-rose-600 uppercase tracking-tighter">Confirmar Exclusão?</h3>
                    <p className="py-4 text-slate-500 font-medium leading-relaxed">Você está prestes a remover <span className="text-slate-900 font-bold">{client.name}</span>. Esta ação é irreversível e removerá todos os vínculos financeiros.</p>
                    <div className="modal-action">
                        <button className="btn btn-ghost font-black" onClick={() => (document.getElementById(deleteModalId) as HTMLDialogElement).close()}>MANTER CLIENTE</button>
                        <button onClick={() => deleteMutation.mutate({ id: client.id })} className="btn btn-error text-white rounded-xl font-black px-8">EXCLUIR AGORA</button>
                    </div>
                </div>
            </dialog>
        </>
    );
}