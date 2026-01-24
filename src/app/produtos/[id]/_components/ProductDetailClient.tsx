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
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

// --- 1. IMPORTANDO O UPLOADTHING ---
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "~/server/api/uploadthing/core";

// --- 2. GERANDO O HOOK ---
const { useUploadThing } = generateReactHelpers<OurFileRouter>();

export default function ProductDetailClient({ product }: { product: any }) {
  const router = useRouter();

  // --- 3. INICIALIZANDO O HOOK ---
  const { startUpload } = useUploadThing("imageUploader");

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
    precoVenda: Number(product.precoVenda).toString(),
    precoCompra: Number(product.precoCompra).toString(),
    stock: product.stock.toString(),
    unidadeMedida: product.unidadeMedida || "un",
    peso: product.peso ? Number(product.peso).toString() : "",
    fornecedorId: product.fornecedorId,
    barcodes: product.codeBarras?.length > 0 ? product.codeBarras.map((b: any) => b.code) : [""],
    categoryIds: product.categories?.map((c: any) => c.id) || [],
  });

  // --- LÓGICA DE BARCODES ---
  const addBarcodeField = () =>
    setFormData((p) => ({ ...p, barcodes: [...p.barcodes, ""] }));

  const removeBarcodeField = (index: number) => {
    setFormData((p) => ({
      ...p,
      barcodes: p.barcodes.filter((_, idx) => idx !== index),
    }));
  };

  const updateBarcodeField = (index: number, value: string) => {
    const newBarcodes = [...formData.barcodes];
    newBarcodes[index] = value;
    setFormData((p) => ({ ...p, barcodes: newBarcodes }));
  };

  // --- MUTAÇÃO TRPC ---
  const updateMutation = api.produto.update.useMutation({
    onSuccess: () => {
      setIsModalOpen(false);
      router.refresh();
      alert("Produto atualizado com sucesso!");
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

      // --- 4. UPLOAD COM UPLOADTHING ---
      if (selectedImageFile) {
        // Envia para o UploadThing
        const uploadRes = await startUpload([selectedImageFile]);
        
        if (uploadRes && uploadRes[0]) {
           // Pega a URL nova (.ufsUrl é o padrão novo)
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

  const lucro = Number(product.precoVenda) - Number(product.precoCompra);
  const margem = Number(product.precoVenda) > 0 ? (lucro / Number(product.precoVenda)) * 100 : 0;

  return (
    <main className="p-4 md:p-8 space-y-8 bg-base-100 min-h-screen">
      {/* ... (O RESTO DO SEU JSX CONTINUA IGUAL) ... */}
      {/* Vou replicar apenas o início e fim para manter o contexto, o JSX visual não muda */}
      
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-base-300 pb-6">
        <div className="flex items-center gap-4">
          <Link href="/produtos" className="btn btn-ghost btn-circle hover:bg-base-200">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-base-content">{product.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="badge badge-ghost font-mono text-xs">SKU: {product.sku || "N/A"}</span>
              <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-error'} badge-outline text-xs`}>
                {product.stock > 0 ? 'Em Estoque' : 'Esgotado'}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary gap-2 shadow-lg shadow-primary/20 transition-transform hover:scale-105"
        >
          <Edit3 className="w-4 h-4" /> Editar Produto
        </button>
      </div>

      {/* ================= DASHBOARD GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ESQUERDA: IMAGEM + INFO BÁSICA */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card bg-base-100 shadow-xl border border-base-200 overflow-hidden group">
            <figure className="aspect-square bg-base-200 relative">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex flex-col items-center justify-center opacity-20">
                  <Package className="w-20 h-20 mb-2" />
                  <span className="text-sm font-bold uppercase">Sem imagem</span>
                </div>
              )}
            </figure>
            <div className="card-body p-6">
              <div className="flex flex-wrap gap-2 mb-2">
                {product.categories?.map((cat: any) => (
                  <span key={cat.id} className="badge badge-primary badge-outline text-xs font-bold">
                    {cat.name}
                  </span>
                ))}
              </div>
              <h2 className="card-title text-sm uppercase opacity-50 flex items-center gap-2 mt-4">
                <Barcode className="w-4 h-4" /> Códigos Cadastrados
              </h2>
              <div className="flex flex-wrap gap-2 mt-1">
                {product.codeBarras?.length > 0 ? (
                  product.codeBarras.map((code: any) => (
                    <span key={code.id} className="badge badge-ghost font-mono">
                      {code.code}
                    </span>
                  ))
                ) : (
                  <span className="text-xs italic opacity-50">Nenhum código registrado</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-6">
              <h3 className="font-bold text-lg mb-2">Sobre o Produto</h3>
              <p className="text-sm text-base-content/70 leading-relaxed whitespace-pre-wrap">
                {product.description || "Nenhuma descrição informada."}
              </p>
            </div>
          </div>
        </div>

        {/* DIREITA: FINANCEIRO E LOGÍSTICA */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stats shadow bg-base-100 border border-base-200">
              <div className="stat">
                <div className="stat-figure text-success bg-success/10 p-2 rounded-full">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="stat-title text-xs font-bold uppercase tracking-wider opacity-60">Preço de Venda</div>
                <div className="stat-value text-2xl text-success">{formatMoney(Number(product.precoVenda))}</div>
                <div className="stat-desc font-medium text-success/80">Margem: {margem.toFixed(1)}%</div>
              </div>
            </div>
            <div className="stats shadow bg-base-100 border border-base-200">
              <div className="stat">
                <div className="stat-figure text-error bg-error/10 p-2 rounded-full">
                  <Wallet className="w-6 h-6" />
                </div>
                <div className="stat-title text-xs font-bold uppercase tracking-wider opacity-60">Custo Unitário</div>
                <div className="stat-value text-2xl">{formatMoney(Number(product.precoCompra))}</div>
                <div className="stat-desc">Lucro: {formatMoney(lucro)}</div>
              </div>
            </div>
            <div className="stats shadow bg-base-100 border border-base-200">
              <div className="stat">
                <div className="stat-figure text-primary bg-primary/10 p-2 rounded-full">
                  <Layers className="w-6 h-6" />
                </div>
                <div className="stat-title text-xs font-bold uppercase tracking-wider opacity-60">Estoque Atual</div>
                <div className="stat-value text-2xl">
                  {product.stock} <span className="text-sm font-normal text-base-content/50">{product.unidadeMedida}</span>
                </div>
                <div className="stat-desc text-[10px]">Total em Venda: {formatMoney(product.stock * Number(product.precoVenda))}</div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-md border border-base-200">
            <div className="card-body">
              <h2 className="card-title text-lg mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" /> Informações Logísticas
              </h2>
              <div className="overflow-x-auto">
                <table className="table">
                  <tbody>
                    <tr className="hover:bg-base-200/50">
                      <td className="font-medium opacity-70">Fornecedor</td>
                      <td className="font-bold text-right text-primary">{product.fornecedor?.name || "N/A"}</td>
                    </tr>
                    <tr className="hover:bg-base-200/50">
                      <td className="font-medium opacity-70">Peso Unitário</td>
                      <td className="font-bold text-right">{Number(product.peso) || 0} kg/g</td>
                    </tr>
                    <tr className="hover:bg-base-200/50">
                      <td className="font-medium opacity-70">Data de Cadastro</td>
                      <td className="font-bold text-right">{new Date(product.createdAt).toLocaleDateString()}</td>
                    </tr>
                    <tr className="hover:bg-base-200/50">
                      <td className="font-medium opacity-70">Histórico de Vendas</td>
                      <td className="font-bold text-right">{product._count?.purchaseItems || 0} itens vendidos</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL DE EDIÇÃO ================= */}
      {isModalOpen && (
        <dialog className="modal modal-open backdrop-blur-sm bg-black/40 z-50 transition-all duration-300">
          <div className="modal-box w-11/12 max-w-5xl max-h-[90vh] p-0 overflow-hidden rounded-2xl shadow-2xl bg-base-100 border border-base-300 flex flex-col">
            
            <div className="bg-base-200/80 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-base-300 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">Editar Produto</h3>
                  <p className="text-xs text-base-content/60 font-mono uppercase tracking-wide">Ref: {formData.sku || 'Nova'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn btn-sm btn-circle btn-ghost hover:bg-error/20 hover:text-error"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              
              <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* --- COLUNA ESQUERDA: DADOS (8/12) --- */}
                  <div className="lg:col-span-8 space-y-6">
                    <div className="form-control">
                      <label className="label text-xs font-bold uppercase opacity-60">Nome do Produto</label>
                      <input
                        className="input input-bordered focus:input-primary h-12 text-lg font-medium bg-base-200/30"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label text-xs font-bold uppercase opacity-60">SKU</label>
                        <input
                          className="input input-bordered font-mono text-sm"
                          value={formData.sku}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        />
                      </div>
                      <div className="form-control">
                        <label className="label text-xs font-bold uppercase opacity-60">Estoque</label>
                        <div className="join w-full">
                          <input
                            type="number"
                            className="join-item input input-bordered w-full"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          />
                          <span className="join-item btn btn-ghost bg-base-200 border-base-300 no-animation text-xs">{formData.unidadeMedida}</span>
                        </div>
                      </div>
                    </div>

                    <div className="divider text-xs opacity-50 uppercase tracking-widest">Financeiro</div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label text-xs font-bold uppercase opacity-60 text-error">Custo (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="input input-bordered border-l-4 border-l-error bg-base-200/20"
                          value={formData.precoCompra}
                          onChange={(e) => setFormData({ ...formData, precoCompra: e.target.value })}
                        />
                      </div>
                      <div className="form-control">
                        <label className="label text-xs font-bold uppercase opacity-60 text-success">Venda (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="input input-bordered border-l-4 border-l-success font-bold text-success bg-base-200/20"
                          value={formData.precoVenda}
                          onChange={(e) => setFormData({ ...formData, precoVenda: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-control mt-4">
                      <label className="label text-xs font-bold uppercase opacity-60">Descrição Detalhada</label>
                      <textarea
                        className="textarea textarea-bordered h-24 leading-relaxed text-sm bg-base-200/30 focus:textarea-primary"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* --- COLUNA DIREITA: IMAGEM PEQUENA E BARCODES (4/12) --- */}
                  <div className="lg:col-span-4 space-y-6">
                    
                    {/* UPLOAD IMAGEM (Tamanho reduzido) */}
                    <div className="form-control text-center">
                      <label className="label text-xs font-bold uppercase opacity-60 justify-center w-full mb-1">Imagem Principal</label>
                      <div className="w-40 h-40 mx-auto bg-base-200 rounded-2xl border-2 border-dashed border-base-300 relative overflow-hidden group hover:border-primary transition-all shadow-inner">
                        {imagePreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 text-base-content">
                            <ImageIcon className="w-8 h-8 mb-1" />
                            <span className="text-[10px] font-bold uppercase">Foto</span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        {imagePreview && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <Edit3 className="text-white w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] opacity-40 mt-2">Clique para alterar</p>
                    </div>

                    {/* BARCODES SECTION */}
                    <div className="card bg-base-200/50 border border-base-300 shadow-sm">
                      <div className="card-body p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-xs font-black uppercase opacity-60 flex items-center gap-2">
                            <Barcode className="w-4 h-4" /> EAN / GTIN
                          </h3>
                          <button
                            type="button"
                            onClick={addBarcodeField}
                            className="btn btn-xs btn-primary btn-circle"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                          {formData.barcodes.map((code, index) => (
                            <div key={index} className="flex gap-2 items-center">
                              <input
                                type="text"
                                className="input input-sm input-bordered w-full font-mono text-xs bg-base-100"
                                placeholder="Código..."
                                value={code}
                                onChange={(e) => updateBarcodeField(index, e.target.value)}
                              />
                              <button
                                type="button"
                                onClick={() => removeBarcodeField(index)}
                                className="btn btn-sm btn-square btn-ghost text-error hover:bg-error/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* FOOTER (Fixo) */}
              <div className="border-t border-base-300 p-4 bg-base-100/80 backdrop-blur flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-ghost"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-8 shadow-lg shadow-primary/20"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Salvar Alterações
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </main>
  );
}