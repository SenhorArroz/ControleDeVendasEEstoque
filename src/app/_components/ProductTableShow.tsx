"use client";

import {
	Package,
	Pencil,
	Trash2,
	MoreVertical,
	Tag,
	Barcode,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Product } from "@/types/product"; // Importe a interface acima

interface Props {
	product: Product;
	onEdit: (p: Product) => void;
	onDelete: (id: string) => void;
}

export default function ProductTableShow({ product, onEdit, onDelete }: Props) {
	const router = useRouter();

	// Formata moeda
	const formatMoney = (val: number) =>
		new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(val);

	// Navegar para detalhes (evita disparar se clicar no dropdown)
	const handleRowClick = (e: React.MouseEvent) => {
		// Se o clique foi dentro de um botão ou dropdown, não navega
		if ((e.target as HTMLElement).closest(".no-row-click")) return;
		router.push(`/produtos/${product.id}`);
	};

	return (
		<tr
			onClick={handleRowClick}
			className="hover:bg-base-200/30 transition-colors group cursor-pointer"
		>
			<th className="no-row-click">
				<label>
					<input type="checkbox" className="checkbox checkbox-xs" />
				</label>
			</th>

			{/* Produto (Imagem + Nome + SKU) */}
			<td>
				<div className="flex items-center gap-4">
					<div className="avatar">
						<div className="mask mask-squircle w-14 h-14 bg-base-200 border border-base-300">
							{product.imageUrl ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img src={product.imageUrl} alt={product.name} />
							) : (
								<div className="flex items-center justify-center w-full h-full text-base-content/20">
									<Package className="w-6 h-6" />
								</div>
							)}
						</div>
					</div>
					<div>
						<div className="font-bold text-base">{product.name}</div>
						<div className="text-xs opacity-50 font-mono tracking-wide flex items-center gap-1">
							SKU: {product.sku || "N/A"}
							{/* Indicador visual se tem códigos de barras cadastrados */}
							{product.barcodes?.length > 0 && (
								<span
									className="tooltip"
									data-tip={`${product.barcodes.length} códigos`}
								>
									<Barcode className="w-3 h-3 text-base-content/40" />
								</span>
							)}
						</div>
					</div>
				</div>
			</td>

			{/* Categorias */}
			<td>
				<div className="flex flex-wrap gap-1 max-w-[200px]">
					{product.categories?.map((cat) => (
						<span
							key={cat.id}
							className="badge badge-sm badge-ghost bg-base-200 border-base-300 text-xs"
						>
							{cat.name}
						</span>
					))}
					{product.categories?.length === 0 && (
						<span className="text-xs opacity-30">-</span>
					)}
				</div>
			</td>

			{/* Preço de Venda */}
			<td>
				<div className="font-medium text-primary">
					{formatMoney(product.precoVenda)}
				</div>
				<div className="text-[10px] opacity-60">
					Custo: {formatMoney(product.precoCompra)}
				</div>
			</td>

			{/* Estoque e Unidade */}
			<td>
				<div className="flex flex-col">
					{product.stock <= 0 ? (
						<span className="badge badge-error badge-outline gap-1 text-xs font-bold bg-error/5">
							Esgotado
						</span>
					) : (
						<span
							className={`badge badge-outline gap-1 text-xs font-bold ${product.stock < 5 ? "badge-warning bg-warning/5" : "badge-success bg-success/5"}`}
						>
							{product.stock} {product.unidadeMedida}
						</span>
					)}
				</div>
			</td>

			{/* Ações */}
			<th className="text-right no-row-click">
				<div className="dropdown dropdown-end dropdown-left">
					<div
						tabIndex={0}
						role="button"
						className="btn btn-ghost btn-sm btn-square opacity-70 group-hover:opacity-100"
					>
						<MoreVertical className="w-4 h-4" />
					</div>
					<ul
						tabIndex={0}
						className="dropdown-content z-[20] menu p-2 shadow-lg bg-base-100 rounded-box w-48 border border-base-200"
					>
						<li>
							<button onClick={() => onEdit(product)}>
								<Pencil className="w-4 h-4" /> Editar Produto
							</button>
						</li>
						<li>
							<a>
								<Tag className="w-4 h-4" /> Categorias
							</a>
						</li>
						<div className="divider my-0"></div>
						<li>
							<button
								className="text-error hover:bg-error/10"
								onClick={() => onDelete(product.id)}
							>
								<Trash2 className="w-4 h-4" /> Excluir
							</button>
						</li>
					</ul>
				</div>
			</th>
		</tr>
	);
}
