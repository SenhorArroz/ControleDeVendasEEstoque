"use client";

import { useState, useRef } from "react";
import { Trash2, Edit, Plus, Tag, ArrowLeft, X, Loader2 } from "lucide-react";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/react";
import Link from "next/link";

type Category = RouterOutputs["categoria"]["getAll"][number];

export default function CategoryManager() {
    // 1. Busca os dados
    const { data: categories = [] } = api.categoria.getAll.useQuery();
    const utils = api.useUtils();

    // 2. Estado para controlar qual categoria está sendo editada
    const [editingCat, setEditingCat] = useState<Category | null>(null);

    // 3. Referências para Modal e Form
    const modalRef = useRef<HTMLDialogElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    // --- MUTATIONS (Ações do Banco) ---
    const createMutation = api.categoria.create.useMutation({
        onSuccess: async () => {
            closeModal();
            await utils.categoria.getAll.invalidate();
        },
        onError: (error) => alert(`Erro ao criar: ${error.message}`),
    });

    const updateMutation = api.categoria.update.useMutation({
        onSuccess: async () => {
            closeModal();
            await utils.categoria.getAll.invalidate();
        },
        onError: (error) => alert(`Erro ao atualizar: ${error.message}`),
    });

    const deleteMutation = api.categoria.delete.useMutation({
        onSuccess: async () => {
            await utils.categoria.getAll.invalidate();
        },
        onError: (error) => alert(error.message),
    });

    // --- HANDLERS (Lógica da Interface) ---
    const openModal = (category?: Category) => {
        setEditingCat(category || null);
        if (modalRef.current) {
            if (!category && formRef.current) {
                formRef.current.reset();
            }
            modalRef.current.showModal();
        }
    };

    const closeModal = () => {
        modalRef.current?.close();
        setTimeout(() => setEditingCat(null), 200);
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const color = formData.get("color") as string;

        if (editingCat) {
            updateMutation.mutate({
                id: editingCat.id,
                name,
                color,
            });
        } else {
            createMutation.mutate({
                name,
                color,
            });
        }
    };

    const handleDelete = (id: string) => {
        if (!confirm("Tem certeza? Isso pode afetar produtos vinculados.")) return;
        deleteMutation.mutate({ id });
    };

    const isLoading = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

    return (
        <div className="space-y-4 sm:space-y-5 2xl:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 font-sans max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            
            {/* HEADER */}
            <div className="flex flex-col gap-4">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 w-fit px-4 py-2 rounded-xl bg-white shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100 text-slate-500 font-bold text-[10px] sm:text-xs uppercase tracking-widest hover:bg-slate-50 hover:text-orange-600 transition-colors"
                >
                    <ArrowLeft size={16} /> Voltar ao Dashboard
                </Link>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-2">
                    <div className="space-y-1.5">
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                            <Tag className="text-orange-600" size={32} /> Categorias
                        </h1>
                        <p className="text-slate-500 font-medium text-xs sm:text-sm">Organize seus produtos por coleções e etiquetas visuais no seu sistema.</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="flex items-center justify-center gap-2 bg-gradient-to-br from-orange-500 to-orange-600 text-white px-6 sm:px-8 h-10 sm:h-12 2xl:h-14 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest shadow-[0_8px_25px_rgba(234,88,12,0.3)] hover:shadow-[0_8px_30px_rgba(234,88,12,0.4)] hover:-translate-y-0.5 border-none w-full md:w-auto transition-all"
                    >
                        <Plus size={20} strokeWidth={2.5} /> Nova Categoria
                    </button>
                </div>
            </div>

            {/* TABELA DE CATEGORIAS */}
            <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100 min-w-0 max-w-full">
                <div className="w-full overflow-x-auto custom-scrollbar">
                    <table className="w-full min-w-[500px] text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="px-5 sm:px-6 py-4 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest w-24">Etiqueta</th>
                                <th className="px-5 sm:px-6 py-4 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome da Categoria</th>
                                <th className="px-5 sm:px-6 py-4 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Itens Vinculados</th>
                                <th className="px-5 sm:px-6 py-4 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {categories.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-12 text-slate-400 font-bold italic text-xs sm:text-sm">
                                        Nenhuma categoria cadastrada.
                                    </td>
                                </tr>
                            ) : (
                                categories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-5 sm:px-6 py-4">
                                            <div
                                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-[0.8rem] shadow-sm border border-slate-200 group-hover:scale-105 transition-transform"
                                                style={{ backgroundColor: cat.color || "#e2e8f0" }}
                                            />
                                        </td>
                                        <td className="px-5 sm:px-6 py-4">
                                            <span className="font-black text-slate-800 text-sm sm:text-base tracking-tight">{cat.name}</span>
                                        </td>
                                        <td className="px-5 sm:px-6 py-4">
                                            <span className="px-2 sm:px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-slate-200 inline-flex items-center gap-1.5 whitespace-nowrap">
                                                {cat._count?.products ?? 0} Produtos
                                            </span>
                                        </td>
                                        <td className="px-5 sm:px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1 sm:gap-2">
                                                <button
                                                    onClick={() => openModal(cat)}
                                                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors shrink-0"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat.id)}
                                                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL (Premium Design) */}
            <dialog 
                ref={modalRef} 
                className="modal bg-slate-900/40 backdrop-blur-sm z-[100]" 
                onClick={(e) => { if (e.target === modalRef.current) closeModal(); }}
            >
                <div className="modal-box w-11/12 max-w-md p-4 sm:p-5 2xl:p-8 lg:p-6 2xl:p-10 rounded-[2rem] shadow-2xl border border-white bg-white cursor-default">
                    
                    <div className="flex justify-between items-center pb-5 sm:pb-6 mb-5 sm:mb-6 border-b border-slate-100">
                        <h3 className="font-black text-lg sm:text-xl 2xl:text-2xl text-slate-800 tracking-tight flex items-center gap-3">
                            <div className="p-2 sm:p-2.5 bg-orange-50 rounded-xl text-orange-600"><Tag size={20} strokeWidth={2.5}/></div>
                            {editingCat ? "Editar Categoria" : "Nova Categoria"}
                        </h3>
                        <button type="button" onClick={closeModal} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 text-slate-400 transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    <form
                        key={editingCat ? editingCat.id : "new"}
                        onSubmit={handleFormSubmit}
                        ref={formRef}
                        className="space-y-5 sm:space-y-6"
                    >
                        <div className="flex flex-col gap-1.5">
                            <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">
                                Nome da Categoria <span className="text-orange-600">*</span>
                            </label>
                            <input
                                name="name"
                                type="text"
                                required
                                className="w-full rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-800 h-10 sm:h-12 2xl:h-14 px-4 sm:px-5 transition-all text-sm sm:text-base placeholder:text-slate-300"
                                defaultValue={editingCat?.name}
                                placeholder="Ex: Bebidas, Limpeza, Vestuário..."
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">
                                Cor da Etiqueta
                            </label>
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-100">
                                <input
                                    name="color"
                                    type="color"
                                    className="h-10 w-14 sm:h-12 sm:w-16 p-0 border-0 rounded-xl cursor-pointer bg-transparent shrink-0"
                                    defaultValue={editingCat?.color || "#ea580c"}
                                />
                                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                    A cor facilita a identificação<br/>rápida dos itens no PDV.
                                </span>
                            </div>
                        </div>

                        <div className="pt-4 sm:pt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="flex-1 rounded-2xl font-black text-[10px] sm:text-xs tracking-widest text-slate-500 bg-slate-50 hover:bg-slate-100 h-10 sm:h-12 2xl:h-14 transition-colors uppercase border border-slate-200"
                                disabled={isLoading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex-1 flex items-center justify-center rounded-2xl font-black text-[10px] sm:text-xs tracking-widest text-white bg-gradient-to-br from-orange-500 to-orange-600 shadow-[0_8px_20px_rgba(234,88,12,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(234,88,12,0.4)] h-10 sm:h-12 2xl:h-14 transition-all uppercase"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    "Salvar"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>
        </div>
    );
}