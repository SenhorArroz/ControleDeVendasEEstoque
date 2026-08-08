"use client";

import {
  Package, Pencil, Trash2, Barcode, Eye
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
      className="hover:bg-slate-50/50 transition-colors group cursor-pointer border-b border-slate-50 last:border-none"
    >
      {/* Produto (Imagem + Nome + SKU) */}
      <td className="pl-5 sm:pl-6 py-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[0.8rem] bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shadow-sm shrink-0 group-hover:border-orange-500/20 transition-colors">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            ) : (
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300" />
            )}
          </div>
          <div>
            <div className="font-black text-xs sm:text-sm text-slate-800 leading-tight tracking-tight">{product.name}</div>
            <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
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
      <td className="px-3 py-4">
        <div>
          <div className="font-bold text-[10px] sm:text-xs text-slate-700 truncate max-w-[100px] sm:max-w-[150px]">{ProductData?.fornecedor?.name || "Carregando..."}</div>
          <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            CNPJ: {ProductData?.fornecedor?.cnpj || "N/A"}
          </div>
        </div>
      </td>

      {/* Categorias */}
      <td className="px-3 py-4">
        <div className="flex flex-wrap gap-1.5 max-w-[150px] sm:max-w-[180px]">
          {product.categories?.map((cat: any) => (
            <span
              key={cat.id}
              className="px-2 py-1 rounded-md text-[8px] sm:text-[9px] font-black uppercase tracking-wider whitespace-nowrap"
              style={{ backgroundColor: cat.color + "20", color: cat.color }}
            >
              {cat.name}
            </span>
          ))}
          {(!product.categories || product.categories.length === 0) && (
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-300 italic">Sem categoria</span>
          )}
        </div>
      </td>

      {/* Preço de Venda */}
      <td className="px-3 py-4">
        <div className="font-black text-xs sm:text-sm text-emerald-600">
          {formatMoney(Number(product.precoVenda))}
        </div>
        <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
          Custo: {formatMoney(Number(product.precoCompra))}
        </div>
      </td>

      {/* Estoque e Unidade */}
      <td className="px-3 py-4">
        {product.stock <= 0 ? (
          <span className="px-2 sm:px-3 py-1 rounded-lg bg-rose-50 text-rose-500 text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-rose-100 whitespace-nowrap">
            Esgotado
          </span>
        ) : (
          <span className={`px-2 sm:px-3 py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest border whitespace-nowrap ${product.stock < 5 ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}>
            {product.stock} {product.unidadeMedida}
          </span>
        )}
      </td>

      {/* Ações (Botões Inline) */}
      <td className="text-right pr-5 sm:pr-6 py-4 no-row-click" onClick={e => e.stopPropagation()}>
        <div className="flex justify-end gap-1 sm:gap-1.5">
          <button 
            onClick={() => router.push(`/produtos/${product.id}`)} 
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors shrink-0"
            title="Ver Detalhes"
          >
            <Eye size={16} />
          </button>
          <button 
            onClick={() => onEdit(product)} 
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors shrink-0"
            title="Editar"
          >
            <Pencil size={14} />
          </button>
          <button 
            onClick={() => onDelete(product.id)} 
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
            title="Excluir"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}