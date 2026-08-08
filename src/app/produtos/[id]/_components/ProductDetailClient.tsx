"use client";

import { useState } from "react";
import {
	ArrowLeft,
	Package,
	Barcode,
	Truck,
	TrendingUp,
	Plus,
	Trash2,
	Wallet,
	Layers,
	Edit3,
	Save,
	X,
	Loader2,
	Image as ImageIcon,
	Tag,
	ShoppingBag,
	Calendar,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

// --- IMPORTANDO O UPLOADTHING ---
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "~/server/api/uploadthing/core";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

export default function ProductDetailClient({ product }: { product: any }) {
	const router = useRouter();
	const { startUpload } = useUploadThing("imageUploader");

	// --- BUSCAS DE DADOS ---
	const { data: categories } = api.categoria.getAll.useQuery();
	const { data: suppliers } = api.fornecedor.getAll.useQuery({});

	// --- ESTADOS ---
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(
		product.imageUrl,
	);

	const [formData, setFormData] = useState({
		name: product.name,
		sku: product.sku || "",
		description: product.description || "",
		precoVenda: product.precoVenda
			? Number(product.precoVenda.toString()).toString()
			: "0",
		precoCompra: product.precoCompra
			? Number(product.precoCompra.toString()).toString()
			: "0",
		stock: product.stock.toString(),
		unidadeMedida: product.unidadeMedida || "un",
		peso: product.peso ? Number(product.peso.toString()).toString() : "",
		fornecedorId: product.fornecedorId || "",
		barcodes:
			product.codeBarras?.length > 0
				? product.codeBarras.map((b: any) => b.code)
				: [""],
		categoryIds: product.categories?.map((c: any) => c.id) || [],
	});

	// --- LÓGICA DE BARCODES ---
	const addBarcodeField = () =>
		setFormData((p) => ({ ...p, barcodes: [...p.barcodes, ""] }));
	const removeBarcodeField = (index: number) =>
		setFormData((p) => ({
			...p,
			barcodes: p.barcodes.filter((_, idx) => idx !== index),
		}));
	const updateBarcodeField = (index: number, value: string) => {
		const newBarcodes = [...formData.barcodes];
		newBarcodes[index] = value;
		setFormData((p) => ({ ...p, barcodes: newBarcodes }));
	};

	// --- LÓGICA DE CATEGORIAS ---
	const toggleCategory = (id: string) => {
		setFormData((prev) => ({
			...prev,
			categoryIds: prev.categoryIds.includes(id)
				? prev.categoryIds.filter((cId) => cId !== id)
				: [...prev.categoryIds, id],
		}));
	};

	// --- MUTAÇÃO TRPC ---
	const updateMutation = api.produto.update.useMutation({
		onSuccess: () => {
			setIsModalOpen(false);
			router.refresh();
		},
		onError: (err) => alert("Erro: " + err.message),
	});

	// --- HANDLERS ---
	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setSelectedImageFile(file);
			setImagePreview(URL.createObjectURL(file));
		}
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			let finalImageUrl = product.imageUrl;

			if (selectedImageFile) {
				const uploadRes = await startUpload([selectedImageFile]);
				if (uploadRes && uploadRes[0]) {
					finalImageUrl = uploadRes[0].ufsUrl;
				} else {
					throw new Error("Falha ao fazer upload da imagem");
				}
			}

			await updateMutation.mutateAsync({
				id: product.id,
				...formData,
				precoVenda: parseFloat(formData.precoVenda),
				precoCompra: parseFloat(formData.precoCompra),
				stock: parseInt(formData.stock),
				peso: parseFloat(formData.peso) || 0,
				imageUrl: finalImageUrl,
				categoryIds: formData.categoryIds,
				fornecedorId: formData.fornecedorId || null,
				barcodes: formData.barcodes.filter((b: string) => b.trim() !== ""),
			});
		} catch (err: any) {
			console.error(err);
			alert("Erro ao salvar: " + err.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const formatMoney = (val: number) =>
		new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(val);

	const pVenda = product.precoVenda ? Number(product.precoVenda.toString()) : 0;
	const pCompra = product.precoCompra
		? Number(product.precoCompra.toString())
		: 0;
	const lucro = pVenda - pCompra;
	const margem = pVenda > 0 ? (lucro / pVenda) * 100 : 0;

	return (
		<main className="px-4 py-4 sm:p-6 space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-[1600px] mx-auto w-full bg-slate-50 min-h-screen text-slate-900 font-sans">
			{/* ================= HEADER ================= */}
			<div className="flex flex-col gap-4">
				<Link
					href="/produtos"
					className="inline-flex items-center gap-2 w-fit px-4 py-2 rounded-xl bg-white shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100 text-slate-500 font-bold text-[10px] sm:text-xs uppercase tracking-widest hover:bg-slate-50 hover:text-orange-600 transition-colors"
				>
					<ArrowLeft size={16} /> Voltar ao Catálogo
				</Link>
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-2">
					<div>
						<h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
							{product.name}
						</h1>
						<div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
							<span className="px-2 sm:px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-slate-200">
								SKU: {product.sku || "N/A"}
							</span>
							<span
								className={`px-2 sm:px-3 py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest border ${product.stock > 0 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}
							>
								{product.stock > 0 ? "EM ESTOQUE" : "ESGOTADO"}
							</span>
						</div>
					</div>
					<button
						onClick={() => setIsModalOpen(true)}
						className="flex items-center justify-center gap-2 bg-gradient-to-br from-orange-500 to-orange-600 text-white px-6 sm:px-8 h-10 sm:h-12 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest shadow-[0_8px_25px_rgba(234,88,12,0.3)] hover:shadow-[0_8px_30px_rgba(234,88,12,0.4)] hover:-translate-y-0.5 border-none w-full md:w-auto transition-all"
					>
						<Edit3 size={18} strokeWidth={2.5} /> Editar Produto
					</button>
				</div>
			</div>

			{/* ================= DASHBOARD GRID ================= */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
				{/* COLUNA ESQUERDA: IMAGEM E INFO */}
				<div className="lg:col-span-1 space-y-4 sm:space-y-5">
					{/* Card da Imagem e Tags */}
					<div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden">
						<div className="aspect-square bg-slate-50 rounded-[1.5rem] border border-slate-100 relative overflow-hidden mb-6 sm:mb-8">
							{product.imageUrl ? (
								<img
									src={product.imageUrl}
									alt={product.name}
									className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
								/>
							) : (
								<div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
									<Package className="w-20 h-20 sm:w-24 sm:h-24 mb-4" />
									<span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">
										SEM FOTO
									</span>
								</div>
							)}
						</div>

						<div className="space-y-5 sm:space-y-6">
							<div>
								<h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
									Categorias
								</h4>
								<div className="flex flex-wrap gap-2">
									{product.categories?.length > 0 ? (
										product.categories.map((cat: any) => (
											<span
												key={cat.id}
												className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider"
												style={{
													backgroundColor: cat.color + "20",
													color: cat.color,
												}}
											>
												{cat.name}
											</span>
										))
									) : (
										<span className="text-[10px] sm:text-xs font-bold text-slate-300 italic">
											Nenhuma categoria
										</span>
									)}
								</div>
							</div>

							<div>
								<h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
									<Barcode size={14} /> Códigos Registrados
								</h4>
								<div className="flex flex-wrap gap-2">
									{product.codeBarras?.length > 0 ? (
										product.codeBarras.map((code: any) => (
											<span
												key={code.id}
												className="px-2 sm:px-3 py-1 sm:py-1.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg text-[9px] sm:text-[10px] font-black font-mono tracking-widest"
											>
												{code.code}
											</span>
										))
									) : (
										<span className="text-[10px] sm:text-xs font-bold text-slate-300 italic">
											Nenhum código
										</span>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Card Descrição */}
					<div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100">
						<h3 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 sm:mb-4">
							Sobre o Produto
						</h3>
						<p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
							{product.description ||
								"Nenhuma descrição detalhada informada para este produto."}
						</p>
					</div>
				</div>

				{/* COLUNA DIREITA: STATS E LOGÍSTICA */}
				<div className="lg:col-span-2 space-y-4 sm:space-y-5">
					{/* Stats Financeiros e Estoque */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
						<div className="bg-white p-3 sm:p-4 rounded-xl shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
							<div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
							<div className="p-2.5 sm:p-3 bg-emerald-50 text-emerald-600 rounded-xl sm:rounded-2xl w-fit mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
								<TrendingUp size={20} className="sm:w-5 sm:h-5" />
							</div>
							<p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
								Preço de Venda
							</p>
							<h3 className="text-base sm:text-lg font-black text-emerald-600">
								{formatMoney(pVenda)}
							</h3>
							<p className="text-[10px] sm:text-xs font-bold text-emerald-500/70 mt-2 sm:mt-3 uppercase tracking-widest">
								Margem: {margem.toFixed(1)}%
							</p>
						</div>

						<div className="bg-white p-3 sm:p-4 rounded-xl shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
							<div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
							<div className="p-2.5 sm:p-3 bg-rose-50 text-rose-600 rounded-xl sm:rounded-2xl w-fit mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
								<Wallet size={20} className="sm:w-5 sm:h-5" />
							</div>
							<p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
								Custo Unitário
							</p>
							<h3 className="text-base sm:text-lg font-black text-rose-600">
								{formatMoney(pCompra)}
							</h3>
							<p className="text-[10px] sm:text-xs font-bold text-rose-500/70 mt-2 sm:mt-3 uppercase tracking-widest">
								Lucro: {formatMoney(lucro)}
							</p>
						</div>

						<div className="bg-white p-3 sm:p-4 rounded-xl shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
							<div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
							<div className="p-2.5 sm:p-3 bg-blue-50 text-blue-600 rounded-xl sm:rounded-2xl w-fit mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
								<Layers size={20} className="sm:w-5 sm:h-5" />
							</div>
							<p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
								Estoque Atual
							</p>
							<h3 className="text-base sm:text-lg font-black text-blue-600">
								{product.stock}{" "}
								<span className="text-xs sm:text-sm font-bold text-blue-400">
									{product.unidadeMedida}
								</span>
							</h3>
							<p className="text-[9px] sm:text-[10px] font-bold text-blue-500/70 mt-2 sm:mt-3 uppercase tracking-widest">
								Valor Bruto: {formatMoney(product.stock * pVenda)}
							</p>
						</div>
					</div>

					{/* Logística */}
					<div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100">
						<h2 className="text-base sm:text-lg font-black text-slate-800 mb-6 sm:mb-8 flex items-center gap-3">
							<div className="p-2 bg-orange-50 rounded-xl text-orange-600">
								<Truck size={20} />
							</div>
							Informações Logísticas
						</h2>
						<div className="overflow-x-auto w-full custom-scrollbar">
							<table className="w-full text-left border-separate border-spacing-y-2 sm:border-spacing-y-4">
								<tbody className="text-[11px] sm:text-sm">
									<tr className="bg-slate-50">
										<td className="font-bold text-slate-400 uppercase tracking-widest py-3 sm:py-4 pl-4 sm:pl-6 rounded-l-xl sm:rounded-l-2xl">
											Fornecedor Registrado
										</td>
										<td className="font-black text-right text-orange-600 pr-4 sm:pr-6 rounded-r-xl sm:rounded-r-2xl">
											{product.fornecedor?.name || "Sem fornecedor"}
										</td>
									</tr>
									<tr className="bg-slate-50">
										<td className="font-bold text-slate-400 uppercase tracking-widest py-3 sm:py-4 pl-4 sm:pl-6 rounded-l-xl sm:rounded-l-2xl">
											Peso Unitário
										</td>
										<td className="font-black text-right text-slate-700 pr-4 sm:pr-6 rounded-r-xl sm:rounded-r-2xl">
											{product.peso ? Number(product.peso.toString()) : 0} kg/g
										</td>
									</tr>
									<tr className="bg-slate-50">
										<td className="font-bold text-slate-400 uppercase tracking-widest py-3 sm:py-4 pl-4 sm:pl-6 rounded-l-xl sm:rounded-l-2xl">
											Data de Cadastro
										</td>
										<td className="font-black text-right text-slate-700 pr-4 sm:pr-6 rounded-r-xl sm:rounded-r-2xl">
											{new Date(product.createdAt).toLocaleDateString("pt-BR")}
										</td>
									</tr>
									<tr className="bg-slate-50">
										<td className="font-bold text-slate-400 uppercase tracking-widest py-3 sm:py-4 pl-4 sm:pl-6 rounded-l-xl sm:rounded-l-2xl">
											Histórico de Saídas
										</td>
										<td className="font-black text-right text-emerald-600 pr-4 sm:pr-6 rounded-r-xl sm:rounded-r-2xl flex items-center justify-end gap-2 h-[48px] sm:h-[56px]">
											<ShoppingBag size={14} />{" "}
											{product._count?.purchaseItems || 0} itens vendidos
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>

			{/* ================= MODAL DE EDIÇÃO ================= */}
			{isModalOpen && (
				<dialog
					className="modal modal-open bg-slate-900/40 backdrop-blur-sm z-[100] animate-in fade-in"
					onClick={(e) => {
						if (e.target === e.currentTarget) setIsModalOpen(false);
					}}
				>
					<div className="modal-box w-11/12 max-w-5xl p-0 rounded-[2rem] shadow-2xl border border-white flex flex-col max-h-[90vh] bg-slate-50 overflow-hidden cursor-default">
						{/* Header Modal */}
						<div className="bg-white px-5 sm:px-6 py-4 flex justify-between items-center border-b border-slate-100 z-10 sticky top-0">
							<div className="flex items-center gap-3 sm:gap-4">
								<div className="p-2.5 bg-orange-50 rounded-xl">
									<Edit3 className="w-5 h-5 text-orange-600" />
								</div>
								<div>
									<h3 className="font-black text-lg sm:text-xl text-slate-800 tracking-tight">
										Editar Produto
									</h3>
									<p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
										Ref: {formData.sku || "N/A"}
									</p>
								</div>
							</div>
							<button
								type="button"
								onClick={() => setIsModalOpen(false)}
								className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 text-slate-400 transition-colors"
							>
								<X className="w-4 h-4" />
							</button>
						</div>

						{/* Form */}
						<form
							onSubmit={handleSave}
							className="overflow-y-auto p-4 sm:p-5 flex-1 custom-scrollbar"
						>
							<div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
								{/* Coluna Dados (Esquerda) */}
								<div className="lg:col-span-8 space-y-6">
									{/* Seção Identificação */}
									<div className="bg-white p-4 sm:p-5 rounded-[1.5rem] shadow-[0_2px_15px_rgb(0,0,0,0.02)] border border-slate-100 space-y-5">
										<h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">
											Informações Básicas
										</h4>
										<div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
											<div className="flex flex-col gap-1.5 md:col-span-8">
												<label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">
													Nome do Produto{" "}
													<span className="text-orange-600">*</span>
												</label>
												<input
													required
													className="w-full rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-800 h-12 px-4 transition-all text-sm"
													value={formData.name}
													onChange={(e) =>
														setFormData({ ...formData, name: e.target.value })
													}
												/>
											</div>
											<div className="flex flex-col gap-1.5 md:col-span-4">
												<label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">
													Código SKU
												</label>
												<input
													className="w-full rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold font-mono text-slate-800 h-12 px-4 transition-all text-sm placeholder:text-slate-300"
													placeholder="Opcional"
													value={formData.sku}
													onChange={(e) =>
														setFormData({ ...formData, sku: e.target.value })
													}
												/>
											</div>
										</div>
										<div className="flex flex-col gap-1.5">
											<label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">
												Descrição
											</label>
											<textarea
												className="w-full rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-medium text-slate-700 h-24 sm:h-28 resize-none p-4 transition-all text-sm placeholder:text-slate-300"
												placeholder="Detalhes, especificações..."
												value={formData.description}
												onChange={(e) =>
													setFormData({
														...formData,
														description: e.target.value,
													})
												}
											></textarea>
										</div>
									</div>

									{/* Seção Financeira e Fornecedor */}
									<div className="bg-white p-4 sm:p-5 rounded-[1.5rem] shadow-[0_2px_15px_rgb(0,0,0,0.02)] border border-slate-100 space-y-5">
										<h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">
											Precificação & Fornecimento
										</h4>
										<div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
											<div className="flex flex-col gap-1.5">
												<label className="uppercase text-[9px] sm:text-[10px] font-black text-rose-400 tracking-widest pl-1">
													Preço Compra
												</label>
												<div className="relative">
													<span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-rose-300">
														R$
													</span>
													<input
														type="number"
														step="0.01"
														className="w-full pl-10 pr-4 rounded-xl bg-rose-50/50 border border-rose-100 focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 font-black text-rose-600 h-12 transition-all text-sm"
														value={formData.precoCompra}
														onChange={(e) =>
															setFormData({
																...formData,
																precoCompra: e.target.value,
															})
														}
													/>
												</div>
											</div>
											<div className="flex flex-col gap-1.5">
												<label className="uppercase text-[9px] sm:text-[10px] font-black text-emerald-500 tracking-widest pl-1">
													Preço Venda *
												</label>
												<div className="relative">
													<span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-emerald-300">
														R$
													</span>
													<input
														type="number"
														step="0.01"
														required
														className="w-full pl-10 pr-4 rounded-xl bg-emerald-50 border border-emerald-100 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-black text-emerald-600 h-12 transition-all text-sm"
														value={formData.precoVenda}
														onChange={(e) =>
															setFormData({
																...formData,
																precoVenda: e.target.value,
															})
														}
													/>
												</div>
											</div>
											<div className="flex flex-col gap-1.5">
												<label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">
													Fornecedor
												</label>
												<select
													className="w-full px-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-700 h-12 transition-all text-sm"
													value={formData.fornecedorId}
													onChange={(e) =>
														setFormData({
															...formData,
															fornecedorId: e.target.value,
														})
													}
												>
													<option value="">Nenhum</option>
													{suppliers?.map((f) => (
														<option key={f.id} value={f.id}>
															{f.name}
														</option>
													))}
												</select>
											</div>
										</div>
									</div>

									{/* Seção Inventário */}
									<div className="bg-white p-4 sm:p-5 rounded-[1.5rem] shadow-[0_2px_15px_rgb(0,0,0,0.02)] border border-slate-100 space-y-5">
										<h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">
											Estoque & Logística
										</h4>
										<div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
											<div className="flex flex-col gap-1.5">
												<label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">
													Qtd Estoque
												</label>
												<input
													type="number"
													required
													className="w-full px-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-black text-slate-700 h-12 text-center transition-all text-sm"
													value={formData.stock}
													onChange={(e) =>
														setFormData({ ...formData, stock: e.target.value })
													}
												/>
											</div>
											<div className="flex flex-col gap-1.5">
												<label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">
													Unidade
												</label>
												<select
													className="w-full px-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-700 h-12 text-center transition-all text-sm"
													value={formData.unidadeMedida}
													onChange={(e) =>
														setFormData({
															...formData,
															unidadeMedida: e.target.value,
														})
													}
												>
													<option value="un">UN</option>
													<option value="kg">KG</option>
													<option value="l">Litros</option>
												</select>
											</div>
											<div className="flex flex-col gap-1.5 col-span-2">
												<label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">
													Peso Líquido (g)
												</label>
												<input
													type="number"
													className="w-full px-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-700 h-12 transition-all text-sm"
													value={formData.peso}
													onChange={(e) =>
														setFormData({ ...formData, peso: e.target.value })
													}
												/>
											</div>
										</div>
									</div>
								</div>

								{/* Coluna Mídia e Extras (Direita) */}
								<div className="lg:col-span-4 space-y-6">
									{/* Imagem Card */}
									<div className="bg-white p-4 sm:p-5 rounded-[1.5rem] shadow-[0_2px_15px_rgb(0,0,0,0.02)] border border-slate-100 text-center">
										<h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
											Mídia Principal
										</h4>
										<div className="w-full aspect-square bg-slate-50 rounded-[1.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group hover:border-orange-500/50 transition-all cursor-pointer">
											{imagePreview ? (
												<img
													src={imagePreview}
													alt="Preview"
													className="w-full h-full object-cover"
												/>
											) : (
												<div className="text-center p-4 sm:p-4 text-slate-400">
													<ImageIcon className="w-10 h-10 sm:w-12 mx-auto mb-3 opacity-30 group-hover:text-orange-600 transition-colors" />
													<span className="text-[10px] sm:text-xs font-bold">
														Clique para alterar
													</span>
												</div>
											)}
											<input
												type="file"
												accept="image/*"
												onChange={handleImageChange}
												className="absolute inset-0 opacity-0 cursor-pointer"
											/>
											{imagePreview && (
												<div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
													<span className="text-white text-[9px] sm:text-[10px] uppercase tracking-widest font-black bg-black/60 px-4 py-2 rounded-xl backdrop-blur-md">
														Alterar Foto
													</span>
												</div>
											)}
										</div>
									</div>

									{/* Categorias Card */}
									<div className="bg-white p-4 sm:p-5 rounded-[1.5rem] shadow-[0_2px_15px_rgb(0,0,0,0.02)] border border-slate-100">
										<h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
											Categorias
										</h4>
										<div className="flex flex-wrap gap-2">
											{categories?.map((cat: any) => (
												<button
													key={cat.id}
													type="button"
													onClick={() => toggleCategory(cat.id)}
													className={`px-3 py-1.5 sm:px-4 sm:py-2 text-[9px] sm:text-xs font-black uppercase tracking-wider rounded-xl transition-all ${formData.categoryIds.includes(cat.id) ? "bg-orange-600 text-white shadow-md shadow-orange-600/30" : "bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100"}`}
												>
													{cat.name}
												</button>
											))}
										</div>
									</div>

									{/* Códigos de Barras */}
									<div className="bg-white p-4 sm:p-5 rounded-[1.5rem] shadow-[0_2px_15px_rgb(0,0,0,0.02)] border border-slate-100">
										<div className="flex justify-between items-center mb-4">
											<h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
												<Barcode size={14} /> Códigos EAN
											</h4>
											<button
												type="button"
												onClick={addBarcodeField}
												className="p-1.5 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-600 hover:text-white transition-colors"
											>
												<Plus size={14} />
											</button>
										</div>
										<div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar pr-2">
											{formData.barcodes.map((code, index) => (
												<div key={index} className="flex gap-2">
													<input
														className="px-3 rounded-xl bg-slate-50 border border-slate-100 font-bold font-mono text-[10px] sm:text-xs flex-1 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 text-slate-700 h-10 transition-all placeholder:text-slate-300"
														placeholder="Código..."
														value={code}
														onChange={(e) =>
															updateBarcodeField(index, e.target.value)
														}
													/>
													<button
														type="button"
														onClick={() => removeBarcodeField(index)}
														className="h-10 w-10 flex items-center justify-center shrink-0 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-colors"
														disabled={formData.barcodes.length === 1}
													>
														<Trash2 size={14} />
													</button>
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
						</form>

						{/* Footer Fixo */}
						<div className="bg-white px-6 sm:px-8 py-4 sm:py-5 flex justify-end gap-3 sm:gap-4 border-t border-slate-100 z-10 sticky bottom-0">
							<button
								type="button"
								onClick={() => setIsModalOpen(false)}
								className="flex items-center justify-center px-6 sm:px-8 h-10 sm:h-12 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 transition-colors"
							>
								Cancelar
							</button>
							<button
								type="button"
								onClick={handleSave}
								className="flex items-center justify-center px-8 sm:px-10 h-10 sm:h-12 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-[0_8px_20px_rgba(234,88,12,0.3)] hover:shadow-[0_8px_25px_rgba(234,88,12,0.4)] hover:-translate-y-0.5 border-none transition-all"
								disabled={isSubmitting}
							>
								{isSubmitting ? (
									<Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
								) : (
									"Salvar Alterações"
								)}
							</button>
						</div>
					</div>
				</dialog>
			)}
		</main>
	);
}
