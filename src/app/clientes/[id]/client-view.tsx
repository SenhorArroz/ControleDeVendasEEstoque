"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { toast } from "sonner"; // Ou alert se preferir
import {
	ArrowLeft,
	User,
	MapPin,
	Phone,
	Calendar,
	ShoppingBag,
	TrendingUp,
	DollarSign,
	Clock,
	MoreHorizontal,
	Edit,
	Save,
	Loader2,
	X,
	CreditCard,
	Banknote,
	QrCode,
	Wallet,
	CheckCircle2,
	AlertCircle,
	Ban,
} from "lucide-react";

// --- Ícones de Pagamento ---
const PaymentIcon = ({ method }: { method: string }) => {
	switch (method) {
		case "PIX":
			return <QrCode className="w-4 h-4 text-emerald-500" />;
		case "DINHEIRO":
			return <Banknote className="w-4 h-4 text-green-600" />;
		case "CREDITO":
		case "DEBITO":
			return <CreditCard className="w-4 h-4 text-blue-500" />;
		default:
			return <Wallet className="w-4 h-4 text-gray-400" />;
	}
};

interface ClientViewProps {
	client: any; // Tipo inferido do Prisma
}

export default function ClientView({ client }: ClientViewProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);

	// --- ESTADOS DE MODAL ---
	const [isClientModalOpen, setIsClientModalOpen] = useState(false);
	const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

	// Estado para Edição do Cliente
	const [clientForm, setClientForm] = useState({
		name: client.name,
		phone: client.phone || "",
		address: client.address || "",
		status: client.status,
	});

	// Estado para Edição de Status da Venda
	const [purchaseToEdit, setPurchaseToEdit] = useState<{
		id: string;
		status: string;
	} | null>(null);

	// --- MUTATIONS ---
	const updateClientMutation = api.cliente.update.useMutation({
		onSuccess: () => {
			setIsClientModalOpen(false);
			router.refresh();
			toast.success("Cliente atualizado!");
		},
		onError: (err) => toast.error(err.message),
	});

	const updatePurchaseStatusMutation = api.compra.updateStatus.useMutation({
		onSuccess: () => {
			setIsStatusModalOpen(false);
			setPurchaseToEdit(null);
			router.refresh();
			toast.success("Status da venda atualizado!");
		},
		onError: (err) => toast.error(err.message),
	});

	// --- HANDLERS ---
	const handleSaveClient = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		await updateClientMutation.mutateAsync({
			id: client.id,
			...clientForm,
		});
		setIsSubmitting(false);
	};

	const handleOpenStatusModal = (purchase: any) => {
		setPurchaseToEdit({ id: purchase.id, status: purchase.status });
		setIsStatusModalOpen(true);
	};

	const handleSaveStatus = async () => {
		if (!purchaseToEdit) return;
		setIsSubmitting(true);
		await updatePurchaseStatusMutation.mutateAsync({
			id: purchaseToEdit.id,
			status: purchaseToEdit.status,
		});
		setIsSubmitting(false);
	};

	// Cálculos
	const totalSpent = client.purchases
		.filter((p: any) => p.status === "COMPLETED")
		.reduce((acc: number, p: any) => acc + Number(p.total), 0);

	const lastOrderDate = client.purchases[0]?.date
		? new Date(client.purchases[0].date).toLocaleDateString("pt-BR")
		: "Nenhuma";

	const formatMoney = (val: number) =>
		new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(val);

	return (
		<div className="drawer-content flex flex-col bg-base-200 min-h-screen">
			<main className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
				{/* HEADER */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div className="flex items-center gap-4">
						<Link
							href="/dashboard/clientes"
							className="btn btn-circle btn-ghost hover:bg-base-300"
						>
							<ArrowLeft className="w-6 h-6" />
						</Link>
						<div className="flex items-center gap-4">
							<div className="avatar placeholder">
								<div className="bg-neutral-focus text-neutral-content rounded-xl w-14 h-14 bg-primary text-primary-content shadow-lg shadow-primary/20">
									<span className="text-2xl font-bold">
										{client.name.charAt(0).toUpperCase()}
									</span>
								</div>
							</div>
							<div>
								<h1 className="text-2xl md:text-3xl font-bold text-base-content">
									{client.name}
								</h1>
								<div className="flex items-center gap-2 mt-1 text-sm opacity-70">
									<span
										className={`badge badge-sm font-bold ${client.status === "ATIVO" ? "badge-success text-white" : "badge-ghost"}`}
									>
										{client.status}
									</span>
									<span className="flex items-center gap-1">
										<Calendar className="w-3 h-3" /> Cliente desde{" "}
										{new Date(client.createdAt).getFullYear()}
									</span>
								</div>
							</div>
						</div>
					</div>

					<button
						onClick={() => setIsClientModalOpen(true)}
						className="btn btn-outline gap-2 hover:bg-base-300"
					>
						<Edit className="w-4 h-4" /> Editar Dados
					</button>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* ESQUERDA: DADOS E STATS */}
					<div className="space-y-6">
						<div className="card bg-base-100 shadow-sm border border-base-200">
							<div className="card-body p-6">
								<h3 className="font-bold text-lg mb-4 flex items-center gap-2 border-b border-base-200 pb-2">
									<User className="w-5 h-5 text-primary" /> Dados de Contato
								</h3>
								<div className="space-y-4">
									<div className="flex items-center gap-3">
										<div className="w-8 h-8 rounded-lg bg-base-200 flex items-center justify-center text-primary">
											<Phone className="w-4 h-4" />
										</div>
										<div>
											<p className="text-xs uppercase opacity-50 font-bold">
												Telefone
											</p>
											<p className="font-medium text-sm">
												{client.phone || "—"}
											</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<div className="w-8 h-8 rounded-lg bg-base-200 flex items-center justify-center text-primary shrink-0">
											<MapPin className="w-4 h-4" />
										</div>
										<div>
											<p className="text-xs uppercase opacity-50 font-bold">
												Endereço
											</p>
											<p className="font-medium text-sm leading-tight">
												{client.address || "Endereço não cadastrado"}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className="stats stats-vertical w-full shadow-sm bg-base-100 border border-base-200">
							<div className="stat">
								<div className="stat-figure text-primary bg-primary/10 p-2 rounded-full">
									<DollarSign className="w-6 h-6" />
								</div>
								<div className="stat-title text-xs font-bold uppercase opacity-60">
									Total Pago
								</div>
								<div className="stat-value text-primary text-2xl">
									{formatMoney(totalSpent)}
								</div>
							</div>
							<div className="stat">
								<div className="stat-figure text-secondary bg-secondary/10 p-2 rounded-full">
									<ShoppingBag className="w-6 h-6" />
								</div>
								<div className="stat-title text-xs font-bold uppercase opacity-60">
									Pedidos
								</div>
								<div className="stat-value text-secondary text-2xl">
									{client.purchases.length}
								</div>
							</div>
							<div className="stat">
								<div className="stat-figure text-base-content bg-base-200 p-2 rounded-full">
									<Clock className="w-6 h-6" />
								</div>
								<div className="stat-title text-xs font-bold uppercase opacity-60">
									Última Compra
								</div>
								<div className="stat-value text-lg">{lastOrderDate}</div>
							</div>
						</div>
					</div>

					{/* DIREITA: HISTÓRICO COM PAGAMENTO E EDIÇÃO DE STATUS */}
					<div className="lg:col-span-2">
						<div className="card bg-base-100 shadow-sm border border-base-200 h-full">
							<div className="card-body p-0">
								<div className="p-6 border-b border-base-200 bg-base-100 rounded-t-2xl">
									<h3 className="font-bold text-lg flex items-center gap-2">
										<TrendingUp className="w-5 h-5 text-primary" /> Histórico de
										Compras
									</h3>
								</div>

								<div className="overflow-x-auto">
									<table className="table">
										<thead className="bg-base-200/50">
											<tr>
												<th>Data</th>
												<th>Status</th>
												<th>Pagamento</th>
												<th>Resumo</th>
												<th className="text-right">Total</th>
												<th></th>
											</tr>
										</thead>
										<tbody>
											{client.purchases.length === 0 ? (
												<tr>
													<td
														colSpan={6}
														className="text-center py-12 text-base-content/40"
													>
														<ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-20" />
														<p>Nenhuma compra registrada.</p>
													</td>
												</tr>
											) : (
												client.purchases.map((purchase: any) => {
													const itemsSummary =
														purchase.items.length > 0
															? `${purchase.items[0]?.product.name} ${purchase.items.length > 1 ? `+${purchase.items.length - 1}` : ""}`
															: "Sem itens";

													return (
														<tr
															key={purchase.id}
															className="hover:bg-base-100 transition-colors"
														>
															<td>
																<div className="flex flex-col">
																	<span className="font-bold text-sm">
																		{new Date(purchase.date).toLocaleDateString(
																			"pt-BR",
																		)}
																	</span>
																	<span className="text-xs opacity-50">
																		{new Date(purchase.date).toLocaleTimeString(
																			"pt-BR",
																			{ hour: "2-digit", minute: "2-digit" },
																		)}
																	</span>
																</div>
															</td>

															{/* STATUS EDITÁVEL (Ao clicar abre modal) */}
															<td>
																<button
																	onClick={() =>
																		handleOpenStatusModal(purchase)
																	}
																	className={`badge badge-sm font-bold gap-1 cursor-pointer hover:scale-105 transition-transform border-none py-3 ${
																		purchase.status === "COMPLETED"
																			? "bg-success/10 text-success"
																			: purchase.status === "PENDING"
																				? "bg-warning/10 text-warning"
																				: "bg-error/10 text-error"
																	}`}
																>
																	{purchase.status === "COMPLETED" && (
																		<CheckCircle2 className="w-3 h-3" />
																	)}
																	{purchase.status === "PENDING" && (
																		<AlertCircle className="w-3 h-3" />
																	)}
																	{purchase.status === "CANCELED" && (
																		<Ban className="w-3 h-3" />
																	)}

																	{purchase.status === "COMPLETED"
																		? "Pago"
																		: purchase.status === "PENDING"
																			? "Pendente"
																			: "Cancelado"}

																	<Edit className="w-3 h-3 ml-1 opacity-50" />
																</button>
															</td>

															{/* MÉTODO DE PAGAMENTO */}
															<td>
																<div className="flex items-center gap-2 text-xs font-semibold opacity-70">
																	<PaymentIcon
																		method={purchase.metodoPagamento}
																	/>
																	{purchase.metodoPagamento || "N/A"}
																</div>
															</td>

															<td>
																<div
																	className="text-sm max-w-[150px] truncate"
																	title={itemsSummary}
																>
																	{itemsSummary}
																</div>
																<div className="text-xs opacity-50">
																	{purchase.items.length} itens
																</div>
															</td>

															<td className="text-right font-mono font-bold text-base-content/80">
																{formatMoney(Number(purchase.total))}
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
				</div>
			</main>

			{/* --- MODAL 1: EDITAR CLIENTE --- */}
			{isClientModalOpen && (
				<dialog className="modal modal-open backdrop-blur-sm bg-black/40 z-50">
					<div className="modal-box w-11/12 max-w-lg p-0 rounded-2xl shadow-2xl bg-base-100">
						<div className="bg-base-200/80 px-6 py-4 flex justify-between items-center border-b border-base-300">
							<h3 className="font-bold text-lg flex items-center gap-2">
								<Edit className="w-5 h-5 text-primary" /> Editar Cliente
							</h3>
							<button
								onClick={() => setIsClientModalOpen(false)}
								className="btn btn-sm btn-circle btn-ghost"
							>
								<X className="w-5 h-5" />
							</button>
						</div>
						<form onSubmit={handleSaveClient} className="p-6 space-y-4">
							<div className="form-control">
								<label className="label text-xs font-bold uppercase opacity-60">
									Nome Completo
								</label>
								<input
									required
									className="input input-bordered"
									value={clientForm.name}
									onChange={(e) =>
										setClientForm({ ...clientForm, name: e.target.value })
									}
								/>
							</div>
							<div className="form-control">
								<label className="label text-xs font-bold uppercase opacity-60">
									Telefone
								</label>
								<input
									className="input input-bordered"
									value={clientForm.phone}
									onChange={(e) =>
										setClientForm({ ...clientForm, phone: e.target.value })
									}
								/>
							</div>
							<div className="form-control">
								<label className="label text-xs font-bold uppercase opacity-60">
									Endereço
								</label>
								<input
									className="input input-bordered"
									value={clientForm.address}
									onChange={(e) =>
										setClientForm({ ...clientForm, address: e.target.value })
									}
								/>
							</div>
							<div className="form-control">
								<label className="label text-xs font-bold uppercase opacity-60">
									Status
								</label>
								<select
									className="select select-bordered"
									value={clientForm.status}
									onChange={(e) =>
										setClientForm({ ...clientForm, status: e.target.value })
									}
								>
									<option value="ATIVO">Ativo</option>
									<option value="INATIVO">Inativo</option>
								</select>
							</div>
							<div className="pt-4 flex justify-end gap-2">
								<button
									type="button"
									onClick={() => setIsClientModalOpen(false)}
									className="btn btn-ghost"
									disabled={isSubmitting}
								>
									Cancelar
								</button>
								<button
									type="submit"
									className="btn btn-primary"
									disabled={isSubmitting}
								>
									{isSubmitting ? (
										<Loader2 className="animate-spin" />
									) : (
										"Salvar Alterações"
									)}
								</button>
							</div>
						</form>
					</div>
				</dialog>
			)}

			{/* --- MODAL 2: EDITAR STATUS DA VENDA --- */}
			{isStatusModalOpen && purchaseToEdit && (
				<dialog className="modal modal-open backdrop-blur-sm bg-black/40 z-50">
					<div className="modal-box p-0 rounded-2xl shadow-xl overflow-hidden max-w-sm">
						<div className="bg-base-100 p-6">
							<h3 className="font-bold text-lg mb-4 text-center">
								Alterar Status da Venda
							</h3>

							<div className="flex flex-col gap-2">
								<button
									onClick={() =>
										setPurchaseToEdit({
											...purchaseToEdit,
											status: "COMPLETED",
										})
									}
									className={`btn ${purchaseToEdit.status === "COMPLETED" ? "btn-success text-white" : "btn-outline border-base-300"}`}
								>
									<CheckCircle2 className="w-5 h-5" /> Pago (Concluído)
								</button>

								<button
									onClick={() =>
										setPurchaseToEdit({ ...purchaseToEdit, status: "PENDING" })
									}
									className={`btn ${purchaseToEdit.status === "PENDING" ? "btn-warning text-white" : "btn-outline border-base-300"}`}
								>
									<AlertCircle className="w-5 h-5" /> Pendente 
								</button>

								<button
									onClick={() =>
										setPurchaseToEdit({ ...purchaseToEdit, status: "CANCELED" })
									}
									className={`btn ${purchaseToEdit.status === "CANCELED" ? "btn-error text-white" : "btn-outline border-base-300"}`}
								>
									<Ban className="w-5 h-5" /> Cancelado
								</button>
							</div>

							<div className="mt-6 flex gap-2">
								<button
									onClick={() => setIsStatusModalOpen(false)}
									className="btn btn-ghost flex-1"
									disabled={isSubmitting}
								>
									Cancelar
								</button>
								<button
									onClick={handleSaveStatus}
									className="btn btn-primary flex-1"
									disabled={isSubmitting}
								>
									{isSubmitting ? (
										<Loader2 className="animate-spin" />
									) : (
										"Confirmar"
									)}
								</button>
							</div>
						</div>
					</div>
				</dialog>
			)}
		</div>
	);
}
