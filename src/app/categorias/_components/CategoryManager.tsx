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
        <div className="space-y-10 py-5 animate-in fade-in slide-in-from-bottom-2 duration-700 font-sans max-w-6xl mx-auto w-full">
            
            {/* HEADER */}
            <div className="flex flex-col gap-4">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 w-fit px-4 py-2 rounded-xl bg-white shadow-sm border border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors"
                >
                    <ArrowLeft size={16} /> Dashboard
                </Link>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-2">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                            <Tag className="text-primary" size={36} /> Categorias
                        </h1>
                        <p className="text-slate-500 font-medium italic">Organize seus produtos por coleções e etiquetas visuais.</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="btn btn-primary rounded-2xl px-8 h-14 font-black shadow-xl shadow-primary/30 border-none gap-2 w-full md:w-auto hover:scale-[1.02] transition-transform"
                    >
                        <Plus className="w-5 h-5" /> NOVA CATEGORIA
                    </button>
                </div>
            </div>

            {/* TABELA DE CATEGORIAS */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden transition-all hover:shadow-md">
                <div className="overflow-x-auto p-4 md:p-6">
                    <table className="table w-full border-separate border-spacing-y-2">
                        <thead>
                            <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-none">
                                <th className="pl-6 w-24">Etiqueta</th>
                                <th>Nome da Categoria</th>
                                <th>Itens Vinculados</th>
                                <th className="text-right pr-6">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-20 text-slate-400 font-bold italic">
                                        Nenhuma categoria cadastrada.
                                    </td>
                                </tr>
                            ) : (
                                categories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="pl-6 py-4 rounded-l-2xl">
                                            <div
                                                className="w-12 h-12 rounded-2xl shadow-inner border border-white/20 group-hover:scale-110 transition-transform"
                                                style={{ backgroundColor: cat.color || "#ccc" }}
                                            />
                                        </td>
                                        <td>
                                            <span className="font-black text-slate-800 text-sm tracking-tight">{cat.name}</span>
                                        </td>
                                        <td>
                                            <span className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200">
                                                {cat._count?.products ?? 0} PRODUTOS
                                            </span>
                                        </td>
                                        <td className="text-right pr-6 rounded-r-2xl">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => openModal(cat)}
                                                    className="btn btn-ghost btn-sm h-10 w-10 btn-square text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat.id)}
                                                    className="btn btn-ghost btn-sm h-10 w-10 btn-square text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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

            {/* MODAL (Glassmorphism e Bordas Premium) */}
            <dialog 
                ref={modalRef} 
                className="modal bg-slate-900/60 backdrop-blur-md z-[100]" 
                // Clicar fora do modal fecha ele:
                onClick={(e) => { if (e.target === modalRef.current) closeModal(); }}
            >
                <div className="modal-box w-11/12 max-w-lg p-10 rounded-[3rem] shadow-2xl border border-white bg-white cursor-default">
                    
                    <div className="flex justify-between items-center border-b border-slate-100 pb-6 mb-8">
                        <h3 className="font-black text-2xl text-slate-800 tracking-tighter flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl text-primary"><Tag size={24}/></div>
                            {editingCat ? "Editar Categoria" : "Nova Categoria"}
                        </h3>
                        <button type="button" onClick={closeModal} className="btn btn-ghost btn-circle btn-sm bg-slate-50 hover:bg-slate-200">
                            <X size={20} className="text-slate-500"/>
                        </button>
                    </div>

                    <form
                        key={editingCat ? editingCat.id : "new"}
                        onSubmit={handleFormSubmit}
                        ref={formRef}
                        className="space-y-6"
                    >
                        <div className="form-control">
                            <label className="label uppercase text-[10px] font-black text-slate-400 tracking-widest px-1">
                                Nome da Categoria *
                            </label>
                            <input
                                name="name"
                                type="text"
                                required
                                className="input input-bordered w-full rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-800 h-14 px-5"
                                defaultValue={editingCat?.name}
                                placeholder="Ex: Bebidas, Limpeza, Vestuário..."
                            />
                        </div>

                        <div className="form-control">
                            <label className="label uppercase text-[10px] font-black text-slate-400 tracking-widest px-1">
                                Cor da Etiqueta
                            </label>
                            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                <input
                                    name="color"
                                    type="color"
                                    className="h-12 w-16 p-0 border-0 rounded-xl cursor-pointer bg-transparent"
                                    defaultValue={editingCat?.color || "#3b82f6"}
                                />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                    A cor facilita a identificação<br/>rápida dos itens no PDV.
                                </span>
                            </div>
                        </div>

                        <div className="pt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="btn btn-ghost flex-1 rounded-2xl font-black text-xs tracking-widest text-slate-500 hover:bg-slate-100"
                                disabled={isLoading}
                            >
                                CANCELAR
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary flex-1 rounded-2xl font-black text-xs tracking-widest shadow-xl shadow-primary/30 border-none"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    "SALVAR CATEGORIA"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>
        </div>
    );
}