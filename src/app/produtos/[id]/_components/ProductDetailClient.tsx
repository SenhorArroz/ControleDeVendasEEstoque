"use client";

import { useState } from "react";
import {
  ArrowLeft, Package, Barcode, Truck, TrendingUp, Plus, Trash2, 
  Wallet, Layers, Edit3, Save, X, Loader2, Image as ImageIcon, Tag,
  ShoppingBag, Calendar
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
  const [imagePreview, setImagePreview] = useState<string | null>(product.imageUrl);

  const [formData, setFormData] = useState({
    name: product.name,
    sku: product.sku || "",
    description: product.description || "",
    precoVenda: product.precoVenda ? Number(product.precoVenda.toString()).toString() : "0",
    precoCompra: product.precoCompra ? Number(product.precoCompra.toString()).toString() : "0",
    stock: product.stock.toString(),
    unidadeMedida: product.unidadeMedida || "un",
    peso: product.peso ? Number(product.peso.toString()).toString() : "",
    fornecedorId: product.fornecedorId || "",
    barcodes: product.codeBarras?.length > 0 ? product.codeBarras.map((b: any) => b.code) : [""],
    categoryIds: product.categories?.map((c: any) => c.id) || [],
  });

  // --- LÓGICA DE BARCODES ---
  const addBarcodeField = () => setFormData((p) => ({ ...p, barcodes: [...p.barcodes, ""] }));
  const removeBarcodeField = (index: number) => setFormData((p) => ({ ...p, barcodes: p.barcodes.filter((_, idx) => idx !== index) }));
  const updateBarcodeField = (index: number, value: string) => {
    const newBarcodes = [...formData.barcodes];
    newBarcodes[index] = value;
    setFormData((p) => ({ ...p, barcodes: newBarcodes }));
  };

  // --- LÓGICA DE CATEGORIAS ---
  const toggleCategory = (id: string) => {
    setFormData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id) ? prev.categoryIds.filter(cId => cId !== id) : [...prev.categoryIds, id]
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

  const formatMoney = (val: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const pVenda = product.precoVenda ? Number(product.precoVenda.toString()) : 0;
  const pCompra = product.precoCompra ? Number(product.precoCompra.toString()) : 0;
  const lucro = pVenda - pCompra;
  const margem = pVenda > 0 ? (lucro / pVenda) * 100 : 0;

  return (
    <main className="p-6 md:p-12 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-[1600px] mx-auto w-full bg-[#F8FAFC] min-h-screen text-slate-900 font-sans">
      
      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-4">
        <Link href="/produtos" className="inline-flex items-center gap-2 w-fit px-4 py-2 rounded-xl bg-white shadow-sm border border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors">
          <ArrowLeft size={16} /> Catálogo
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-2">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">{product.name}</h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200">
                SKU: {product.sku || "N/A"}
              </span>
              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${product.stock > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                {product.stock > 0 ? 'EM ESTOQUE' : 'ESGOTADO'}
              </span>
            </div>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary rounded-2xl px-8 h-14 font-black shadow-xl shadow-primary/30 border-none gap-2 w-full md:w-auto">
            <Edit3 size={18} /> EDITAR PRODUTO
          </button>
        </div>
      </div>

      {/* ================= DASHBOARD GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* COLUNA ESQUERDA: IMAGEM E INFO */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Card da Imagem e Tags */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50 overflow-hidden">
            <div className="aspect-square bg-slate-50 rounded-[2rem] border border-slate-100 relative overflow-hidden mb-8">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                  <Package className="w-24 h-24 mb-4" />
                  <span className="text-xs font-black uppercase tracking-widest">SEM FOTO</span>
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Categorias</h4>
                <div className="flex flex-wrap gap-2">
                  {product.categories?.length > 0 ? product.categories.map((cat: any) => (
                    <span key={cat.id} className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider" style={{ backgroundColor: cat.color + "20", color: cat.color }}>
                      {cat.name}
                    </span>
                  )) : (
                    <span className="text-xs font-bold text-slate-300 italic">Nenhuma categoria</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Barcode size={14} /> Códigos Registrados
                </h4>
                <div className="flex flex-wrap gap-2">
                  {product.codeBarras?.length > 0 ? product.codeBarras.map((code: any) => (
                    <span key={code.id} className="px-3 py-1.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg text-[10px] font-black font-mono tracking-widest">
                      {code.code}
                    </span>
                  )) : (
                    <span className="text-xs font-bold text-slate-300 italic">Nenhum código</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card Descrição */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Sobre o Produto</h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
              {product.description || "Nenhuma descrição detalhada informada para este produto."}
            </p>
          </div>
        </div>

        {/* COLUNA DIREITA: STATS E LOGÍSTICA */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Stats Financeiros e Estoque */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform"><TrendingUp size={24}/></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Preço de Venda</p>
              <h3 className="text-3xl font-black text-emerald-600">{formatMoney(pVenda)}</h3>
              <p className="text-xs font-bold text-emerald-500/70 mt-3 uppercase tracking-widest">Margem: {margem.toFixed(1)}%</p>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform"><Wallet size={24}/></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Custo Unitário</p>
              <h3 className="text-3xl font-black text-rose-600">{formatMoney(pCompra)}</h3>
              <p className="text-xs font-bold text-rose-500/70 mt-3 uppercase tracking-widest">Lucro: {formatMoney(lucro)}</p>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform"><Layers size={24}/></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Estoque Atual</p>
              <h3 className="text-3xl font-black text-blue-600">{product.stock} <span className="text-sm font-bold text-blue-400">{product.unidadeMedida}</span></h3>
              <p className="text-[10px] font-bold text-blue-500/70 mt-3 uppercase tracking-widest">Valor Bruto: {formatMoney(product.stock * pVenda)}</p>
            </div>
          </div>

          {/* Logística */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-50">
            <h2 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary"><Truck size={20} /></div>
              Informações Logísticas
            </h2>
            <div className="overflow-x-auto">
              <table className="table w-full border-separate border-spacing-y-4">
                <tbody className="text-sm">
                  <tr className="bg-slate-50 rounded-2xl">
                    <td className="font-bold text-slate-400 uppercase tracking-widest text-[10px] py-4 pl-6 rounded-l-2xl">Fornecedor Registrado</td>
                    <td className="font-black text-right text-primary pr-6 rounded-r-2xl">{product.fornecedor?.name || "Sem fornecedor"}</td>
                  </tr>
                  <tr className="bg-slate-50 rounded-2xl">
                    <td className="font-bold text-slate-400 uppercase tracking-widest text-[10px] py-4 pl-6 rounded-l-2xl">Peso Unitário</td>
                    <td className="font-black text-right text-slate-700 pr-6 rounded-r-2xl">{product.peso ? Number(product.peso.toString()) : 0} kg/g</td>
                  </tr>
                  <tr className="bg-slate-50 rounded-2xl">
                    <td className="font-bold text-slate-400 uppercase tracking-widest text-[10px] py-4 pl-6 rounded-l-2xl">Data de Cadastro</td>
                    <td className="font-black text-right text-slate-700 pr-6 rounded-r-2xl">{new Date(product.createdAt).toLocaleDateString("pt-BR")}</td>
                  </tr>
                  <tr className="bg-slate-50 rounded-2xl">
                    <td className="font-bold text-slate-400 uppercase tracking-widest text-[10px] py-4 pl-6 rounded-l-2xl">Histórico de Saídas</td>
                    <td className="font-black text-right text-emerald-600 pr-6 rounded-r-2xl flex items-center justify-end gap-2">
                        <ShoppingBag size={14}/> {product._count?.purchaseItems || 0} itens vendidos
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
        <dialog className="modal modal-open bg-slate-900/60 backdrop-blur-md z-[100] animate-in fade-in">
          <div className="modal-box w-11/12 max-w-6xl p-0 rounded-[3rem] shadow-2xl border border-white flex flex-col max-h-[90vh] bg-[#F8FAFC]">
            
            {/* Header Modal */}
            <div className="bg-white px-10 py-6 flex justify-between items-center border-b border-slate-100 z-10 sticky top-0 rounded-t-[3rem]">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-2xl">
                    <Edit3 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-black text-2xl text-slate-800 tracking-tight">Editar Produto</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Ref: {formData.sku || 'N/A'}</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="btn btn-ghost btn-circle bg-slate-50 hover:bg-slate-200"><X className="w-5 h-5 text-slate-500" /></button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="overflow-y-auto p-10 flex-1 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* Coluna Dados (Esquerda) */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* Seção Identificação */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50 space-y-6">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Informações Básicas</h4>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                <div className="form-control md:col-span-8">
                                    <label className="label text-[10px] font-black uppercase text-slate-400 px-1">Nome do Produto *</label>
                                    <input required className="input input-bordered w-full rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-800 h-12" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}/>
                                </div>
                                <div className="form-control md:col-span-4">
                                    <label className="label text-[10px] font-black uppercase text-slate-400 px-1">Código SKU</label>
                                    <input className="input input-bordered w-full rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold font-mono text-slate-800 h-12" placeholder="Opcional" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})}/>
                                </div>
                            </div>
                            <div className="form-control">
                                <label className="label text-[10px] font-black uppercase text-slate-400 px-1">Descrição</label>
                                <textarea className="textarea textarea-bordered w-full rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-700 h-28 resize-none p-4" placeholder="Detalhes, especificações..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                            </div>
                        </div>

                        {/* Seção Financeira e Fornecedor */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50 space-y-6">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Precificação & Fornecimento</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="form-control">
                                    <label className="label text-[10px] font-black uppercase text-rose-400 px-1">Preço Compra</label>
                                    <div className="relative">
                                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-rose-300">R$</span>
                                      <input type="number" step="0.01" className="input input-bordered w-full pl-10 rounded-2xl bg-rose-50/50 border-none focus:ring-2 focus:ring-rose-200 font-black text-rose-600 h-12" value={formData.precoCompra} onChange={e => setFormData({...formData, precoCompra: e.target.value})}/>
                                    </div>
                                </div>
                                <div className="form-control">
                                    <label className="label text-[10px] font-black uppercase text-emerald-500 px-1">Preço Venda *</label>
                                    <div className="relative">
                                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-emerald-300">R$</span>
                                      <input type="number" step="0.01" required className="input input-bordered w-full pl-10 rounded-2xl bg-emerald-50 border-none focus:ring-2 focus:ring-emerald-200 font-black text-emerald-600 h-12" value={formData.precoVenda} onChange={e => setFormData({...formData, precoVenda: e.target.value})}/>
                                    </div>
                                </div>
                                <div className="form-control">
                                    <label className="label text-[10px] font-black uppercase text-slate-400 px-1">Fornecedor</label>
                                    <select className="select select-bordered w-full rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-700 h-12" value={formData.fornecedorId} onChange={e => setFormData({...formData, fornecedorId: e.target.value})}>
                                        <option value="">Nenhum</option>
                                        {suppliers?.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Seção Inventário */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50 space-y-6">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Estoque & Logística</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="form-control">
                                    <label className="label text-[10px] font-black uppercase text-slate-400 px-1">Qtd Estoque</label>
                                    <input type="number" required className="input input-bordered w-full rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-black text-slate-700 h-12 text-center" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})}/>
                                </div>
                                <div className="form-control">
                                    <label className="label text-[10px] font-black uppercase text-slate-400 px-1">Unidade</label>
                                    <select className="select select-bordered w-full rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-700 h-12 text-center" value={formData.unidadeMedida} onChange={e => setFormData({...formData, unidadeMedida: e.target.value})}>
                                        <option value="un">UN</option>
                                        <option value="kg">KG</option>
                                        <option value="l">Litros</option>
                                    </select>
                                </div>
                                <div className="form-control col-span-2">
                                    <label className="label text-[10px] font-black uppercase text-slate-400 px-1">Peso Líquido (g)</label>
                                    <input type="number" className="input input-bordered w-full rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-700 h-12" value={formData.peso} onChange={e => setFormData({...formData, peso: e.target.value})}/>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Coluna Mídia e Extras (Direita) */}
                    <div className="lg:col-span-4 space-y-8">
                        
                        {/* Imagem Card */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50 text-center">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Mídia Principal</h4>
                          <div className="w-full aspect-square bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group hover:border-primary/50 transition-all cursor-pointer">
                              {imagePreview ? (
                                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                              ) : (
                                  <div className="text-center p-6 text-slate-400">
                                      <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30 group-hover:text-primary transition-colors"/>
                                      <span className="text-xs font-bold">Clique para alterar</span>
                                  </div>
                              )}
                              <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                              {imagePreview && (
                                  <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <span className="text-white text-[10px] uppercase tracking-widest font-black bg-black/60 px-4 py-2 rounded-xl backdrop-blur-md">Alterar Foto</span>
                                  </div>
                              )}
                          </div>
                        </div>

                        {/* Categorias Card */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Categorias</h4>
                          <div className="flex flex-wrap gap-2">
                              {categories?.map((cat: any) => (
                                  <button 
                                      key={cat.id} 
                                      type="button"
                                      onClick={() => toggleCategory(cat.id)}
                                      className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${formData.categoryIds.includes(cat.id) ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                  >
                                      {cat.name}
                                  </button>
                              ))}
                          </div>
                        </div>

                        {/* Códigos de Barras */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50">
                          <div className="flex justify-between items-center mb-4">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Barcode size={14}/> Códigos EAN</h4>
                              <button type="button" onClick={addBarcodeField} className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"><Plus size={14}/></button>
                          </div>
                          <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                              {formData.barcodes.map((code, index) => (
                                  <div key={index} className="flex gap-2">
                                      <input className="input input-bordered h-10 rounded-xl bg-slate-50 border-none font-bold font-mono text-xs flex-1 focus:ring-2 focus:ring-primary/20 text-slate-700" placeholder="Código..." value={code} onChange={(e) => updateBarcodeField(index, e.target.value)}/>
                                      <button type="button" onClick={() => removeBarcodeField(index)} className="btn btn-sm h-10 w-10 btn-square bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white border-none rounded-xl transition-colors" disabled={formData.barcodes.length === 1}><Trash2 size={14} /></button>
                                  </div>
                              ))}
                          </div>
                        </div>

                    </div>
                </div>

                {/* Footer Fixo */}
                <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-slate-200 sticky bottom-0 bg-[#F8FAFC]">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost rounded-2xl font-black text-xs uppercase tracking-widest px-8">Cancelar</button>
                    <button type="submit" className="btn btn-primary rounded-2xl font-black text-xs uppercase tracking-widest px-10 shadow-xl shadow-primary/30 border-none" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "SALVAR ALTERAÇÕES"}
                    </button>
                </div>
            </form>
          </div>
        </dialog>
      )}
    </main>
  );
}