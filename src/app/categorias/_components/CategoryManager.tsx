"use client";

import { useState, useRef } from "react";
import { Trash2, Edit, Plus, Tag, ArrowLeft } from "lucide-react";
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
			alert("Categoria criada com sucesso!");
			closeModal();
			await utils.categoria.getAll.invalidate();
		},
		onError: (error) => alert(`Erro ao criar: ${error.message}`),
	});

	const updateMutation = api.categoria.update.useMutation({
		onSuccess: async () => {
			alert("Categoria atualizada com sucesso!");
			closeModal();
			await utils.categoria.getAll.invalidate();
		},
		onError: (error) => alert(`Erro ao atualizar: ${error.message}`),
	});

	const deleteMutation = api.categoria.delete.useMutation({
		onSuccess: async () => {
			alert("Categoria removida.");
			await utils.categoria.getAll.invalidate();
		},
		onError: (error) => alert(error.message),
	});

	// --- HANDLERS (Lógica da Interface) ---

	const openModal = (category?: Category) => {
		setEditingCat(category || null);
		if (modalRef.current) {
			// Se for nova categoria, limpa o form. Se for edição, o defaultValue cuida disso,
			// mas resetar garante que não fique lixo de edição anterior se o usuário cancelar.
			if (!category && formRef.current) {
				formRef.current.reset();
			}
			modalRef.current.showModal();
		}
	};

	const closeModal = () => {
		modalRef.current?.close();
		// Pequeno delay para limpar o estado visual só depois que o modal fechar
		setTimeout(() => setEditingCat(null), 200);
	};

	// AQUI ESTÁ A CORREÇÃO PRINCIPAL
	const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault(); // Impede o recarregamento da página

		const formData = new FormData(e.currentTarget);
		const name = formData.get("name") as string;
		const color = formData.get("color") as string;

		if (editingCat) {
			// LÓGICA DE UPDATE: Passamos o ID e os novos dados
			updateMutation.mutate({
				id: editingCat.id,
				name,
				color,
			});
		} else {
			// LÓGICA DE CREATE: Passamos apenas os dados
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

	const isLoading =
		createMutation.isPending ||
		updateMutation.isPending ||
		deleteMutation.isPending;

	return (
		<div className="p-6 bg-base-100 rounded-xl shadow-sm border border-base-200">
			{/* HEADER */}
			<div>
				<Link
					href="/dashboard"
					className="btn btn-ghost gap-2 pl-0 hover:bg-transparent hover:underline text-base-content/70"
				>
					<ArrowLeft size={18} /> Voltar para Dashboard
				</Link>
			</div>
			<div className="flex justify-between items-center mb-6">
				<div>
					<h2 className="text-xl font-bold flex items-center gap-2">
						<Tag className="w-5 h-5 text-primary" /> Gerenciar Categorias
					</h2>
					<p className="text-sm text-base-content/60">
						Organize seus produtos por cores e etiquetas.
					</p>
				</div>
				<button
					onClick={() => openModal()}
					className="btn btn-primary text-white"
				>
					<Plus className="w-4 h-4" /> Nova Categoria
				</button>
			</div>

			{/* TABELA */}
			<div className="overflow-x-auto">
				<table className="table table-zebra w-full">
					<thead>
						<tr>
							<th>Etiqueta</th>
							<th>Nome</th>
							<th>Produtos</th>
							<th className="text-end">Ações</th>
						</tr>
					</thead>
					<tbody>
						{categories.length === 0 ? (
							<tr>
								<td
									colSpan={4}
									className="text-center py-8 text-base-content/50"
								>
									Nenhuma categoria cadastrada.
								</td>
							</tr>
						) : (
							categories.map((cat) => (
								<tr key={cat.id} className="hover">
									<td>
										<div
											className="w-8 h-8 rounded-full border border-base-300 shadow-sm"
											style={{ backgroundColor: cat.color || "#ccc" }}
										></div>
									</td>
									<td className="font-semibold">{cat.name}</td>
									<td>
										<span className="badge badge-ghost font-mono">
											{cat._count?.products ?? 0} itens
										</span>
									</td>
									<td className="flex justify-end gap-2">
										<button
											onClick={() => openModal(cat)}
											className="btn btn-square btn-sm btn-ghost text-info"
										>
											<Edit className="w-4 h-4" />
										</button>
										<button
											onClick={() => handleDelete(cat.id)}
											className="btn btn-square btn-sm btn-ghost text-error"
										>
											<Trash2 className="w-4 h-4" />
										</button>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* MODAL (DaisyUI) */}
			<dialog ref={modalRef} className="modal">
				<div className="modal-box">
					<h3 className="font-bold text-lg mb-4">
						{editingCat ? "Editar Categoria" : "Nova Categoria"}
					</h3>

					{/* Usamos onSubmit para ter controle total da lógica JS */}
					{/* key={editingCat?.id} força o form a ser recriado quando muda de edição para criação, garantindo que os defaultValues atualizem */}
					<form
						key={editingCat ? editingCat.id : "new"}
						onSubmit={handleFormSubmit}
						ref={formRef}
						className="space-y-4"
					>
						<div className="form-control">
							<label className="label">
								<span className="label-text">Nome da Categoria</span>
							</label>
							<input
								name="name"
								type="text"
								placeholder="Ex: Bebidas, Limpeza..."
								className="input input-bordered w-full"
								defaultValue={editingCat?.name} // Carrega o nome se for edição
								required
							/>
						</div>

						<div className="form-control">
							<label className="label">
								<span className="label-text">Cor da Etiqueta</span>
							</label>
							<div className="flex gap-4 items-center">
								<input
									name="color"
									type="color"
									className="h-12 w-20 p-1 bg-base-100 border border-base-300 rounded cursor-pointer"
									defaultValue={editingCat?.color || "#3b82f6"} // Carrega a cor se for edição
								/>
								<span className="text-xs text-base-content/60">
									Escolha uma cor para identificar esta categoria visualmente no
									PDV.
								</span>
							</div>
						</div>

						<div className="modal-action">
							<button
								type="button"
								onClick={closeModal}
								className="btn btn-ghost"
								disabled={isLoading}
							>
								Cancelar
							</button>
							<button
								type="submit"
								className="btn btn-primary"
								disabled={isLoading}
							>
								{isLoading ? (
									<span className="loading loading-spinner"></span>
								) : (
									"Salvar"
								)}
							</button>
						</div>
					</form>
				</div>
				<form method="dialog" className="modal-backdrop">
					<button onClick={closeModal}>close</button>
				</form>
			</dialog>
		</div>
	);
}
