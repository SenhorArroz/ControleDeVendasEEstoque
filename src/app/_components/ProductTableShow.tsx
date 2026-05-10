"use client";

import {
  Package, Pencil, Trash2, MoreVertical, Barcode, Eye
} from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

interface Props {
  product: any; // Tipagem inferida
  onEdit: (p: any) => void;
  onDelete: (id: string) => void;
}

export default function ProductTableShow({ product, onEdit, onDelete }: Props) {
  const router = useRouter();
  const { data: ProductData } = api.produto.getByID.useQuery({ id: product.id });

  const formatMoney = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  // Navegar para detalhes ignorando cliques nos botões de ação
  const handleRowClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".no-row-click")) return;
    router.push(`/produtos/${product.id}`);
  };

  return (
    <tr
      onClick={handleRowClick}
      className="hover:bg-slate-50 transition-colors group cursor-pointer border-b border-slate-50 last:border-none"
    >
      {/* Produto (Imagem + Nome + SKU) */}
      <td className="pl-6 py-4 rounded-l-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-[1rem] bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shadow-inner shrink-0 group-hover:border-primary/20 transition-colors">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <Package className="w-6 h-6 text-slate-300" />
            )}
          </div>
          <div>
            <div className="font-black text-sm text-slate-800 leading-tight">{product.name}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
              SKU: {product.sku || "N/A"}
              {product.codeBarras?.length > 0 && (
                <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded-md text-slate-500" title={`${product.codeBarras.length} códigos`}>
                  <Barcode size={10} /> {product.codeBarras.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Fornecedor */}
      <td>
        <div>
          <div className="font-bold text-xs text-slate-700 truncate max-w-[150px]">{ProductData?.fornecedor?.name || "Carregando..."}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            CNPJ: {ProductData?.fornecedor?.cnpj || "N/A"}
          </div>
        </div>
      </td>

      {/* Categorias */}
      <td>
        <div className="flex flex-wrap gap-1.5 max-w-[180px]">
          {product.categories?.map((cat: any) => (
            <span
              key={cat.id}
              className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider"
              style={{ backgroundColor: cat.color + "20", color: cat.color }}
            >
              {cat.name}
            </span>
          ))}
          {(!product.categories || product.categories.length === 0) && (
            <span className="text-[10px] font-bold text-slate-300 italic">Sem categoria</span>
          )}
        </div>
      </td>

      {/* Preço de Venda */}
      <td>
        <div className="font-black text-sm text-emerald-600">
          {formatMoney(Number(product.precoVenda))}
        </div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
          Custo: {formatMoney(Number(product.precoCompra))}
        </div>
      </td>

      {/* Estoque e Unidade */}
      <td>
        {product.stock <= 0 ? (
          <span className="px-3 py-1 rounded-lg bg-rose-50 text-rose-500 text-[10px] font-black uppercase tracking-widest border border-rose-100">
            Esgotado
          </span>
        ) : (
          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${product.stock < 5 ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}>
            {product.stock} {product.unidadeMedida}
          </span>
        )}
      </td>

      {/* Ações (Dropdown Dark) */}
      <th className="text-right pr-6 rounded-r-2xl no-row-click" onClick={e => e.stopPropagation()}>
        <div className="dropdown dropdown-end dropdown-left">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-circle text-slate-400 hover:text-slate-800 hover:bg-slate-100">
            <MoreVertical size={18} />
          </div>
          <ul tabIndex={0} className="dropdown-content z-[50] menu p-2 shadow-2xl bg-slate-900 text-white rounded-2xl w-48 border border-slate-800 font-bold text-xs uppercase tracking-widest">
            <li>
              <button onClick={() => onEdit(product)} className="hover:bg-slate-800 py-3">
                <Pencil size={14} /> Editar Produto
              </button>
            </li>
            <li>
              <button onClick={() => router.push(`/produtos/${product.id}`)} className="hover:bg-slate-800 py-3">
                <Eye size={14} /> Ver Detalhes
              </button>
            </li>
            <div className="h-px bg-slate-800 my-1 w-full" />
            <li>
              <button onClick={() => onDelete(product.id)} className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-400 py-3">
                <Trash2 size={14} /> Excluir
              </button>
            </li>
          </ul>
        </div>
      </th>
    </tr>
  );
}