"use client";

import { useState, useMemo, useEffect } from "react";
import { api } from "~/trpc/react";
import {
	Search,
	ShoppingCart,
	Plus,
	Trash2,
	User,
	Banknote,
	Save,
	Loader2,
	PackageOpen,
	AlertCircle,
	Barcode,
	Filter,
	X,
	CheckCircle2,
	ArrowLeft,
	Home,
	Repeat,
	CreditCard,
	QrCode,
	Wallet,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// --- TIPOS ---
type SaleSuccessData = {
	clientName: string;
	total: number;
	paid: number;
	change: number;
	itemCount: number;
	paymentMethod: string;
};

type CartItem = {
	cartId: string;
	productId: string;
	name: string;
	price: number;
	quantity: number;
	stock: number;
	imageUrl?: string | null;
	barcodeId?: string;
	barcodeCode?: string;
};

// Opções de Pagamento
const PAYMENT_METHODS = [
	{ id: "DINHEIRO", label: "Dinheiro", icon: Banknote },
	{ id: "PIX", label: "Pix", icon: QrCode },
	{ id: "DEBITO", label: "Débito", icon: CreditCard },
	{ id: "CREDITO", label: "Crédito", icon: CreditCard },
];

export default function NewSalePage() {
	const router = useRouter();
	const utils = api.useUtils();

	// --- ESTADOS ---
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
		null,
	);
	const [selectedClientId, setSelectedClientId] = useState<string>("");
	const [cart, setCart] = useState<CartItem[]>([]);

	// Pagamento
	const [paymentAmount, setPaymentAmount] = useState<string>("");
	const [selectedPaymentMethod, setSelectedPaymentMethod] =
		useState<string>("DINHEIRO");
	const [isPending, setIsPending] = useState(false);

	// Modais
	const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
	const [selectedProductForModal, setSelectedProductForModal] = useState<
		any | null
	>(null);
	const [saleSuccessData, setSaleSuccessData] =
		useState<SaleSuccessData | null>(null);

	// --- QUERIES ---
	const { data: clients, isLoading: loadingClients } =
		api.cliente.getAll.useQuery();
	const { data: categories } = api.categoria.getAll.useQuery();

	// Nota: Buscamos todos ou filtramos. Para performance ideal com milhares de produtos,
	// a busca deveria ser feita no backend, mas aqui mantemos a lógica de cache local do React Query.
	const { data: products, isLoading: loadingProducts } =
		api.produto.getAll.useQuery({
			searchTerm: searchTerm, // Opcional: pode remover se quiser carregar tudo de uma vez
			categoryId: selectedCategoryId ?? undefined,
		});

	// --- CÁLCULOS ---
	const totalPurchase = useMemo(() => {
		return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
	}, [cart]);

	const change = useMemo(() => {
		if (selectedPaymentMethod !== "DINHEIRO") return 0;
		const paid = parseFloat(paymentAmount.replace(",", ".")) || 0;
		return paid - totalPurchase;
	}, [paymentAmount, totalPurchase, selectedPaymentMethod]);

	const formatMoney = (val: number) =>
		new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(val);

	// --- MUTATION ---
	const createSaleMutation = api.compra.create.useMutation({
		onSuccess: async (_, variables) => {
			const clientName =
				clients?.find((c) => c.id === variables.clientId)?.name || "Cliente";
			const paidValue = parseFloat(paymentAmount.replace(",", ".")) || 0;

			setSaleSuccessData({
				clientName,
				total: variables.total,
				paid: paidValue,
				change: paidValue - variables.total,
				itemCount: variables.items.reduce((acc, i) => acc + i.quantity, 0),
				paymentMethod: variables.paymentMethod,
			});

			await utils.produto.getAll.invalidate();
		},
		onError: (error) => {
			toast.error(`Erro ao processar venda: ${error.message}`);
		},
	});

	// --- EFEITOS DE INICIALIZAÇÃO ---
	useEffect(() => {
		if (clients && clients.length > 0 && !selectedClientId) {
			setSelectedClientId(clients[0]?.id ?? "");
		}
	}, [clients, selectedClientId]);

	// --- LÓGICA DE CARRINHO E BUSCA ---

	const addToCartWithSpecificBarcode = (
		product: any,
		barcodeObj: { id: string; code: string },
	) => {
		const isAlreadyInCart = cart.some(
			(item) => item.barcodeId === barcodeObj.id,
		);

		if (isAlreadyInCart) {
			toast.warning("Este item específico já está no carrinho.");
			return;
		}

		setCart((prev) => [
			{
				cartId: barcodeObj.id,
				productId: product.id,
				name: product.name,
				price: Number(product.precoVenda),
				quantity: 1,
				stock: product.stock,
				imageUrl: product.imageUrl,
				barcodeId: barcodeObj.id,
				barcodeCode: barcodeObj.code,
			},
			...prev,
		]);
		setIsBarcodeModalOpen(false);
	};

	const addGenericToCart = (product: any) => {
		setCart((prev) => {
			const existing = prev.find(
				(item) => item.productId === product.id && !item.barcodeId,
			);

			if (existing) {
				if (existing.quantity + 1 > product.stock) {
					toast.error("Estoque insuficiente.");
					return prev;
				}
				return prev.map((item) =>
					item.cartId === existing.cartId
						? { ...item, quantity: item.quantity + 1 }
						: item,
				);
			}

			return [
				...prev,
				{
					cartId: `gen-${product.id}-${Date.now()}`,
					productId: product.id,
					name: product.name,
					price: Number(product.precoVenda),
					quantity: 1,
					stock: product.stock,
					imageUrl: product.imageUrl,
				},
			];
		});
	};

	const handleProductClick = (product: any) => {
		// Se tiver código de barras, abre modal para escolher qual (opcional, dependendo da sua regra de negócio)
		// Se quiser adicionar direto ao clicar, pode simplificar aqui.
		if (product.codeBarras && product.codeBarras.length > 0) {
			setSelectedProductForModal(product);
			setIsBarcodeModalOpen(true);
		} else {
			if (product.stock > 0) addGenericToCart(product);
			else toast.error("Produto sem estoque.");
		}
	};

	const removeFromCart = (cartId: string) =>
		setCart((current) => current.filter((item) => item.cartId !== cartId));

	// --- NOVA LÓGICA DE BUSCA (FIXED) ---
	const handleSearch = () => {
		if (!products || products.length === 0 || !searchTerm) return;

		const term = searchTerm.trim();

		// 1. Busca por Código de Barras Exato
		for (const product of products) {
			// O uso do ?. previne erro se o array for undefined
			const exactBarcodeMatch = product.codeBarras?.find(
				(cb: any) => cb.code === term,
			);

			if (exactBarcodeMatch) {
				const alreadyInCart = cart.some(
					(item) => item.barcodeId === exactBarcodeMatch.id,
				);

				if (!alreadyInCart) {
					addToCartWithSpecificBarcode(product, exactBarcodeMatch);
					setSearchTerm("");
					toast.success("Item adicionado!");
				} else {
					toast.warning("Item já está no carrinho!");
					setSearchTerm("");
				}
				return; // Encerra busca se achou
			}
		}

		// 2. Busca por SKU Exato
		const exactSkuMatch = products.find((p) => p.sku === term);
		if (exactSkuMatch) {
			handleProductClick(exactSkuMatch);
			setSearchTerm("");
			return;
		}

		// 3. Se chegou aqui, não achou nada exato.
		// Opcional: toast.info("Produto não encontrado pelo código.");
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSearch();
		}
	};

	// --- FINALIZAÇÃO ---
	const handleFinishSale = () => {
		if (!selectedClientId) return toast.error("Selecione um cliente.");
		if (cart.length === 0) return toast.error("Carrinho vazio.");

		createSaleMutation.mutate({
			clientId: selectedClientId,
			status: isPending ? "PENDING" : "COMPLETED",
			total: totalPurchase,
			paymentMethod: selectedPaymentMethod,
			items: cart.map((item) => ({
				productId: item.productId,
				quantity: item.quantity,
				unitPrice: item.price,
				barcodeId: item.barcodeId,
			})),
		});
	};

	const handleResetSale = () => {
		setCart([]);
		setPaymentAmount("");
		setIsPending(false);
		setSelectedPaymentMethod("DINHEIRO");
		setSearchTerm("");
		setSaleSuccessData(null);
		if (clients && clients.length > 0)
			setSelectedClientId(clients[0]?.id ?? "");
	};

	return (
		<div className="flex flex-col lg:flex-row h-screen bg-base-200 font-sans overflow-hidden">
			{/* LADO ESQUERDO: CATÁLOGO */}
			<div className="flex-1 flex flex-col h-full overflow-hidden relative">
				<div className="p-4 space-y-4 bg-base-100/50 backdrop-blur-sm z-10">
					<div>
						<Link
							href="/dashboard"
							className="btn btn-ghost gap-2 pl-0 hover:bg-transparent hover:underline text-base-content/70"
						>
							<ArrowLeft size={18} /> Voltar para Dashboard
						</Link>
					</div>
					<div className="form-control w-full">
						<div className="relative">
							<input
								type="text"
								placeholder="Escanear Código de Barras ou Buscar SKU..."
								className="input input-bordered w-full pl-12 h-12 shadow-sm focus:input-primary transition-all font-medium"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								onKeyDown={handleKeyDown} // A MÁGICA ACONTECE AQUI
								autoFocus
							/>
							<div className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40">
								{searchTerm ? (
									<Barcode className="w-5 h-5" />
								) : (
									<Search className="w-5 h-5" />
								)}
							</div>
							{searchTerm && (
								<button
									onClick={() => setSearchTerm("")}
									className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
								>
									<X className="w-4 h-4" />
								</button>
							)}
						</div>
					</div>

					{/* Filtros de Categoria */}
					<div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
						<div
							className={`badge badge-lg gap-2 cursor-pointer h-9 px-4 transition-all ${
								selectedCategoryId === null
									? "badge-neutral"
									: "badge-ghost border-base-300"
							}`}
							onClick={() => setSelectedCategoryId(null)}
						>
							<Filter className="w-3 h-3" /> Todos
						</div>
						{categories?.map((cat) => (
							<div
								key={cat.id}
								className={`badge badge-lg cursor-pointer h-9 px-4 whitespace-nowrap transition-all ${
									selectedCategoryId === cat.id
										? "badge-primary"
										: "badge-ghost bg-base-100 border-base-300"
								}`}
								onClick={() =>
									setSelectedCategoryId(
										selectedCategoryId === cat.id ? null : cat.id,
									)
								}
							>
								{cat.name}
							</div>
						))}
					</div>
				</div>

				{/* Grid de Produtos */}
				<div className="flex-1 overflow-y-auto p-4 pt-0">
					<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-24">
						{loadingProducts &&
							Array.from({ length: 8 }).map((_, i) => (
								<div
									key={i}
									className="card bg-base-100 h-64 animate-pulse shadow-sm border border-base-200"
								></div>
							))}
						{!loadingProducts &&
							products?.map((product) => {
								const hasStock = product.stock > 0;
								return (
									<div
										key={product.id}
										onClick={() =>
											hasStock ? handleProductClick(product) : null
										}
										className={`card bg-base-100 shadow-sm border border-base-200 group transition-all duration-200 ${
											hasStock
												? "hover:shadow-md hover:border-primary/30 cursor-pointer active:scale-95"
												: "opacity-60 grayscale cursor-not-allowed"
										}`}
									>
										<figure className="h-40 w-full bg-base-200 relative overflow-hidden flex items-center justify-center">
											{product.imageUrl ? (
												<img
													src={product.imageUrl}
													alt={product.name}
													className="w-full h-full object-cover"
												/>
											) : (
												<PackageOpen className="w-12 h-12 text-base-content/20" />
											)}
											<div className="absolute top-2 right-2">
												<span
													className={`badge badge-xs font-bold ${
														hasStock ? "badge-success" : "badge-error"
													}`}
												>
													{product.stock} {product.unidadeMedida}
												</span>
											</div>
										</figure>
										<div className="card-body p-3 gap-1">
											<h3 className="font-bold text-sm line-clamp-2 leading-tight min-h-[2.5em]">
												{product.name}
											</h3>
											<div className="flex flex-col mt-auto">
												<span className="text-xs text-base-content/50 font-mono">
													SKU: {product.sku || "N/A"}
												</span>
												<div className="flex justify-between items-end mt-1">
													<span className="text-lg font-black text-primary">
														{formatMoney(Number(product.precoVenda))}
													</span>
													<button
														className={`btn btn-circle btn-xs btn-primary ${
															hasStock
																? "opacity-0 group-hover:opacity-100"
																: "hidden"
														}`}
													>
														<Plus className="w-4 h-4" />
													</button>
												</div>
											</div>
										</div>
									</div>
								);
							})}
					</div>
				</div>
			</div>

			{/* LADO DIREITO: CARRINHO E CHECKOUT */}
			<div className="w-full lg:w-[480px] bg-base-100 border-l border-base-300 flex flex-col h-full shadow-2xl z-20">
				<div className="p-4 border-b border-base-200 bg-base-100">
					<label className="form-control w-full">
						<div className="label pt-0 pb-1">
							<span className="label-text flex items-center gap-2 font-bold text-base-content/70">
								<User className="w-4 h-4" /> Cliente
							</span>
						</div>
						<select
							className="select select-bordered w-full bg-base-200/50 focus:bg-base-100"
							value={selectedClientId}
							onChange={(e) => setSelectedClientId(e.target.value)}
							disabled={loadingClients}
						>
							<option value="" disabled>
								Selecione um cliente...
							</option>
							{clients?.map((client) => (
								<option key={client.id} value={client.id}>
									{client.name}
								</option>
							))}
						</select>
					</label>
				</div>

				{/* Lista de Itens */}
				<div className="flex-1 overflow-y-auto p-0 bg-base-100 relative">
					{cart.length === 0 ? (
						<div className="absolute inset-0 flex flex-col items-center justify-center text-base-content/30 gap-4">
							<div className="bg-base-200 p-6 rounded-full">
								<ShoppingCart className="w-12 h-12" />
							</div>
							<div className="text-center">
								<p className="font-bold text-lg">Venda Vazia</p>
								<p className="text-sm max-w-[200px]">Adicione produtos.</p>
							</div>
						</div>
					) : (
						<table className="table table-pin-rows w-full">
							<thead>
								<tr className="bg-base-100 text-base-content/60 text-xs uppercase border-b-base-200">
									<th className="pl-4">Produto</th>
									<th className="text-right pr-4">Total</th>
									<th className="w-10"></th>
								</tr>
							</thead>
							<tbody>
								{cart.map((item) => (
									<tr
										key={item.cartId}
										className="group hover:bg-base-200/40 border-b-base-100"
									>
										<td className="pl-4 py-3">
											<div className="font-bold text-sm max-w-[200px] truncate">
												{item.name}
											</div>
											<div className="text-xs text-base-content/50">
												{item.barcodeCode
													? `Cod: ${item.barcodeCode}`
													: `${item.quantity} x ${formatMoney(item.price)}`}
											</div>
										</td>
										<td className="text-right font-bold text-base-content/80 pr-4 py-3">
											{formatMoney(item.price * item.quantity)}
										</td>
										<td className="pr-2 py-3">
											<button
												onClick={() => removeFromCart(item.cartId)}
												className="btn btn-ghost btn-xs text-error opacity-0 group-hover:opacity-100"
											>
												<Trash2 className="w-4 h-4" />
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</div>

				{/* Área de Pagamento */}
				<div className="p-5 bg-base-200/50 border-t border-base-300 space-y-4 backdrop-blur-md">
					<div className="flex justify-between items-end border-b border-base-content/10 pb-3">
						<span className="text-sm font-medium opacity-60 uppercase tracking-wider">
							Total
						</span>
						<span className="text-4xl font-black text-primary tracking-tight">
							{formatMoney(totalPurchase)}
						</span>
					</div>

					<div>
						<label className="label py-1 text-xs font-bold opacity-70">
							Método de Pagamento
						</label>
						<div className="grid grid-cols-4 gap-2">
							{PAYMENT_METHODS.map((method) => {
								const Icon = method.icon;
								const isSelected = selectedPaymentMethod === method.id;
								return (
									<button
										key={method.id}
										onClick={() => setSelectedPaymentMethod(method.id)}
										className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl border transition-all ${
											isSelected
												? "bg-primary text-primary-content border-primary shadow-md scale-105"
												: "bg-base-100 border-base-300 hover:bg-base-200 text-base-content/70"
										}`}
									>
										<Icon className="w-5 h-5" />
										<span className="text-[10px] font-bold">
											{method.label}
										</span>
									</button>
								);
							})}
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="form-control">
							<label className="label py-1 text-xs font-bold opacity-70">
								{selectedPaymentMethod === "DINHEIRO"
									? "Valor Recebido"
									: "Valor a Cobrar"}
							</label>
							<label
								className={`input input-bordered flex items-center gap-2 ${
									selectedPaymentMethod !== "DINHEIRO"
										? "bg-base-200 pointer-events-none"
										: "focus-within:border-success"
								}`}
							>
								<Wallet className="w-4 h-4 opacity-50" />
								<input
									type="number"
									className="grow font-mono font-bold text-lg"
									placeholder="0,00"
									value={
										selectedPaymentMethod === "DINHEIRO"
											? paymentAmount
											: totalPurchase.toFixed(2)
									}
									onChange={(e) => setPaymentAmount(e.target.value)}
									readOnly={selectedPaymentMethod !== "DINHEIRO"}
								/>
							</label>
						</div>

						<div className="form-control">
							<label className="label py-1 text-xs font-bold opacity-70">
								Troco
							</label>
							<div
								className={`input input-bordered flex items-center justify-end px-4 font-mono font-bold text-lg bg-base-200/50 ${
									change < 0 ? "text-error" : "text-success"
								}`}
							>
								{selectedPaymentMethod === "DINHEIRO"
									? formatMoney(change >= 0 ? change : 0)
									: "-"}
							</div>
						</div>
					</div>

					<div className="form-control">
						<label className="label cursor-pointer justify-start gap-3 p-0 hover:opacity-80 transition-opacity">
							<input
								type="checkbox"
								className="checkbox checkbox-warning checkbox-sm"
								checked={isPending}
								onChange={(e) => setIsPending(e.target.checked)}
							/>
							<span className="label-text font-semibold flex items-center gap-2 text-xs">
								Marcar como Pendente (Fiado){" "}
								{isPending && <AlertCircle className="w-3 h-3 text-warning" />}
							</span>
						</label>
					</div>

					<button
						onClick={handleFinishSale}
						disabled={
							cart.length === 0 ||
							createSaleMutation.isPending ||
							loadingClients
						}
						className={`btn btn-lg w-full shadow-xl border-none text-white font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-transform
            ${
							isPending
								? "bg-warning hover:bg-warning/90 text-warning-content"
								: "bg-primary hover:bg-primary/90"
						}`}
					>
						{createSaleMutation.isPending ? (
							<Loader2 className="animate-spin w-6 h-6" />
						) : (
							<>
								<Save className="w-6 h-6 mr-1" />{" "}
								{isPending ? "Salvar Pendente" : "Finalizar"}
							</>
						)}
					</button>
				</div>
			</div>

			{/* --- MODAIS --- */}
			{isBarcodeModalOpen && selectedProductForModal && (
				<dialog className="modal modal-open backdrop-blur-sm bg-black/40 z-50">
					<div className="modal-box w-11/12 max-w-lg p-0 rounded-2xl shadow-2xl bg-base-100">
						<div className="bg-base-200/80 px-6 py-4 flex justify-between border-b border-base-300">
							<h3 className="font-bold">Selecione o Código</h3>
							<button
								onClick={() => setIsBarcodeModalOpen(false)}
								className="btn btn-sm btn-circle btn-ghost"
							>
								<X className="w-4 h-4" />
							</button>
						</div>
						<div className="p-4 space-y-2 max-h-[50vh] overflow-y-auto">
							{selectedProductForModal.codeBarras?.map((cb: any) => (
								<button
									key={cb.id}
									onClick={() =>
										addToCartWithSpecificBarcode(selectedProductForModal, cb)
									}
									disabled={cart.some((i) => i.barcodeId === cb.id)}
									className="w-full btn btn-outline justify-between normal-case h-auto py-3"
								>
									<span className="font-mono">{cb.code}</span>
									{cart.some((i) => i.barcodeId === cb.id) ? (
										<CheckCircle2 className="text-success" />
									) : (
										<Plus />
									)}
								</button>
							))}
						</div>
					</div>
				</dialog>
			)}

			{saleSuccessData && (
				<dialog className="modal modal-open backdrop-blur-md bg-black/60 z-50">
					<div className="modal-box p-0 max-w-md w-full rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
						<div className="bg-success text-success-content p-8 flex flex-col items-center justify-center text-center">
							<div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
								<CheckCircle2 className="w-10 h-10 text-white" />
							</div>
							<h2 className="text-2xl font-black">Venda Realizada!</h2>
						</div>
						<div className="p-6 bg-base-100 space-y-4">
							<div className="flex justify-between py-2 border-b">
								<span className="opacity-60">Cliente</span>
								<span className="font-bold">{saleSuccessData.clientName}</span>
							</div>
							<div className="flex justify-between py-2 border-b">
								<span className="opacity-60">Pagamento</span>
								<span className="font-bold">
									{saleSuccessData.paymentMethod}
								</span>
							</div>
							<div className="flex justify-between py-2 border-b">
								<span className="opacity-60">Total</span>
								<span className="font-black text-lg">
									{formatMoney(saleSuccessData.total)}
								</span>
							</div>
							{saleSuccessData.paymentMethod === "DINHEIRO" && (
								<div className="flex justify-between py-2 text-success font-bold">
									<span>Troco</span>
									<span>{formatMoney(saleSuccessData.change)}</span>
								</div>
							)}
						</div>
						<div className="p-6 bg-base-200/50 border-t border-base-200 flex flex-col gap-3">
							<button
								onClick={handleResetSale}
								className="btn btn-primary w-full btn-lg shadow-md"
							>
								<Repeat className="w-5 h-5" /> Nova Venda
							</button>
							<Link href="/dashboard" className="btn btn-ghost w-full">
								<Home className="w-5 h-5" /> Voltar
							</Link>
						</div>
					</div>
				</dialog>
			)}
		</div>
	);
}
