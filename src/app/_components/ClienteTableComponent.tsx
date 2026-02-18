"use client";

import {
	MoreVertical,
	Pencil,
	Trash2,
	MapPin,
	Phone,
	Calendar,
	DollarSign,
	AlertTriangle,
	Save,
	Loader2,
	X,
	ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

// ... (Mantenha suas interfaces e funções formatCurrency/formatDate aqui) ...
export interface ClienteData {
	id: string;
	name: string;
	phone: string | null;
	address: string | null;
	status: string;
}

const formatCurrency = (value: number) => {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(value);
};

const formatDate = (date: Date | string | null) => {
	if (!date) return "-";
	return new Date(date).toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
};

export function ClienteRow({ client }: { client: ClienteData }) {
	const router = useRouter();

	const editModalId = `edit_modal_${client.id}`;
	const deleteModalId = `delete_modal_${client.id}`;

	const [formData, setFormData] = useState({
		name: client.name,
		phone: client.phone ?? "",
		address: client.address ?? "",
	});

	const { data: lastPurchaseDate, isLoading: isLoadingDate } =
		api.cliente.lastPurchase.useQuery({ id: client.id });
	const { data: totalGastos, isLoading: isLoadingGastos } =
		api.cliente.gastosTotais.useQuery({ id: client.id });

	const utils = api.useUtils();

	const updateMutation = api.cliente.update.useMutation({
		onSuccess: () => {
			utils.cliente.getAll.invalidate();
			(document.getElementById(editModalId) as HTMLDialogElement).close();
			router.refresh();
		},
		onError: (err) => alert("Erro: " + err.message),
	});

	const deleteMutation = api.cliente.delete.useMutation({
		onSuccess: () => {
			utils.cliente.getAll.invalidate();
			router.refresh();
		},
	});

	// --- NAVEGAÇÃO ---
	const handleRowClick = () => {
		router.push(`/clientes/${client.id}`);
	};

	const handleUpdate = (e: React.FormEvent) => {
		e.preventDefault();
		updateMutation.mutate({ id: client.id, ...formData });
	};

	return (
		<>
			<tr
				onClick={handleRowClick}
				className="group hover:bg-base-200/50 transition-all duration-200 border-b border-base-200 last:border-none cursor-pointer"
			>
				{/* 1. Perfil */}
				<td className="py-4 pl-6">
					<div className="flex items-center gap-4">
						<div className="avatar placeholder">
							<div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20">
								<span className="text-lg font-bold uppercase">
									{client.name.charAt(0)}
								</span>
							</div>
						</div>
						<div>
							<div className="font-bold text-base">{client.name}</div>
							<div className="text-xs text-base-content/60 flex items-center gap-1">
								{client.phone || "Sem telefone"}
							</div>
						</div>
					</div>
				</td>

				{/* 2. Status */}
				<td>
					<div
						className={`badge badge-sm font-medium gap-1 py-3 px-3 ${
							client.status === "ATIVO"
								? "badge-success text-white"
								: "badge-warning text-white"
						}`}
					>
						{client.status}
					</div>
				</td>

				{/* 3. Gastos */}
				<td>
					<div className="font-semibold text-base-content flex items-center gap-1">
						{isLoadingGastos ? (
							<span className="loading loading-dots loading-xs" />
						) : (
							formatCurrency(totalGastos ?? 0)
						)}
					</div>
				</td>

				{/* 4. Data */}
				<td>
					<span className="text-sm opacity-70">
						{isLoadingDate ? "..." : formatDate(lastPurchaseDate as string)}
					</span>
				</td>

				{/* 5. Ações (STOP PROPAGATION AQUI) */}
				<th className="text-right pr-6" onClick={(e) => e.stopPropagation()}>
					<div className="dropdown dropdown-end dropdown-left">
						<div
							tabIndex={0}
							role="button"
							className="btn btn-ghost btn-sm btn-square"
						>
							<MoreVertical className="w-4 h-4" />
						</div>
						<ul
							tabIndex={0}
							className="dropdown-content z-[50] menu p-2 shadow-lg bg-base-100 rounded-box w-48 border border-base-200"
						>
							<li>
								<button
									onClick={() =>
										(
											document.getElementById(editModalId) as HTMLDialogElement
										).showModal()
									}
								>
									<Pencil className="w-4 h-4" /> Editar
								</button>
							</li>
							<li>
								<button
									onClick={() =>
										router.push(`clientes/${client.id}`)
									}
								>
									<ChevronRight className="w-4 h-4" /> Ver Detalhes
								</button>
							</li>
							<div className="divider my-0"></div>
							<li>
								<button
									onClick={() =>
										(
											document.getElementById(
												deleteModalId,
											) as HTMLDialogElement
										).showModal()
									}
									className="text-error"
								>
									<Trash2 className="w-4 h-4" /> Excluir
								</button>
							</li>
						</ul>
					</div>
				</th>
			</tr>

			{/* --- MANTENHA SEUS MODAIS AQUI (CÓDIGO ANTERIOR) --- */}
			{/* Apenas lembre de usar e.stopPropagation() se os modais forem clicados, 
          embora o <dialog> nativo geralmente lide bem com isso fora da árvore DOM */}
			<dialog
				id={editModalId}
				className="modal modal-bottom sm:modal-middle cursor-default"
				onClick={(e) => e.stopPropagation()}
			>
				{/* ... Conteúdo do Modal de Edição que você já fez ... */}
				<div className="modal-box">
					{/* ... form ... */}
					<form onSubmit={handleUpdate} className="space-y-4">
						{/* Inputs... */}
						<div className="form-control">
							<label className="label">Nome</label>
							<input
								className="input input-bordered"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
							/>
						</div>
						{/* ... Botões ... */}
						<div className="modal-action">
							<form method="dialog">
								<button className="btn btn-ghost">Cancelar</button>
							</form>
							<button className="btn btn-primary">Salvar</button>
						</div>
					</form>
				</div>
				<form method="dialog" className="modal-backdrop">
					<button>close</button>
				</form>
			</dialog>

			<dialog
				id={deleteModalId}
				className="modal modal-bottom sm:modal-middle cursor-default"
				onClick={(e) => e.stopPropagation()}
			>
				{/* ... Conteúdo do Modal de Exclusão ... */}
				<div className="modal-box">
					<h3 className="font-bold text-lg text-error">Excluir Cliente?</h3>
					<p className="py-4">
						Essa ação removerá o histórico de compras deste cliente.
					</p>
					<div className="modal-action">
						<form method="dialog">
							<button className="btn">Cancelar</button>
						</form>
						<button
							onClick={() => deleteMutation.mutate({ id: client.id })}
							className="btn btn-error"
						>
							Excluir
						</button>
					</div>
				</div>
				<form method="dialog" className="modal-backdrop">
					<button>close</button>
				</form>
			</dialog>
		</>
	);
}
