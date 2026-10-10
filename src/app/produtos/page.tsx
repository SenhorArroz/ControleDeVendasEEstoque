"use client";

import { useMemo, useState } from "react";
import ProductTableShow from "../_components/ProductTableShow";
import SideBar from "../_components/SideBar";
import { 
  Search, Plus, X, Barcode, Trash2, Loader2, PackageOpen, UploadCloud, Info, Package, Menu, Activity, ChevronDown, Tags
} from "lucide-react";

import { api } from "~/trpc/react";
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "~/server/api/uploadthing/core";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

type StockFilter = "all" | "inStock" | "outOfStock";

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const { startUpload } = useUploadThing("imageUploader");

  // Queries
  const { data: products, isLoading, refetch } = api.produto.getAll.useQuery({ searchTerm });
  const productCount = api.produto.cont.useQuery();
  const { data: fornecedores } = api.fornecedor.getEvery.useQuery(); 
  const { data: categorias } = api.categoria.getAll.useQuery(); 

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter((product) => {
      const matchesStock = stockFilter === "all"
        || (stockFilter === "inStock" && product.stock > 0)
        || (stockFilter === "outOfStock" && product.stock <= 0);
      const matchesCategory = selectedCategoryIds.length === 0
        || product.categories?.some((category) => selectedCategoryIds.includes(category.id));

      return matchesStock && matchesCategory;
    });
  }, [products, selectedCategoryIds, stockFilter]);

  const toggleCategoryFilter = (categoryId: string) => {
    setSelectedCategoryIds((current) => current.includes(categoryId)
      ? current.filter((id) => id !== categoryId)
      : [...current, categoryId]);
  };

  // Mutations
  const createMutation = api.produto.create.useMutation({
    onSuccess: () => { refetch(); handleCloseModal(); },
    onError: (e) => alert("Erro ao criar: " + e.message)
  });

  const updateMutation = api.produto.update.useMutation({
    onSuccess: () => { refetch(); handleCloseModal(); },
  });

  const deleteMutation = api.produto.delete.useMutation({ onSuccess: () => refetch() });

  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    precoVenda: "",
    precoCompra: "",
    stock: "",
    unidadeMedida: "un",
    peso: "",
    fornecedorId: "",
    barcodes: [""],
    categoryIds: [] as string[]
  });

  const handleOpenModal = (product?: any) => {
    if (product) {
      setEditingId(product.id);
      setImagePreview(product.imageUrl); 
      setFormData({
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
        categoryIds: product.categories?.map((c: any) => c.id) || []
      });
    } else {
      setEditingId(null);
      setImagePreview(null);
      setSelectedImageFile(null);
      setFormData({
        name: "", sku: "", description: "", precoVenda: "", precoCompra: "", stock: "0", unidadeMedida: "un", peso: "", fornecedorId: "", barcodes: [""], categoryIds: []
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsSubmitting(false);
    setSelectedImageFile(null);
  };

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
      let finalImageUrl = imagePreview;
      if (selectedImageFile) {
        const uploadRes = await startUpload([selectedImageFile]);
        if (uploadRes?.[0]) finalImageUrl = uploadRes[0].ufsUrl;
      }

      const payload = {
        ...formData,
        precoVenda: parseFloat(formData.precoVenda) || 0,
        precoCompra: parseFloat(formData.precoCompra) || 0,
        stock: parseInt(formData.stock) || 0,
        peso: parseFloat(formData.peso) || 0,
        barcodes: formData.barcodes.filter(c => c.trim() !== ""),
        imageUrl: finalImageUrl || undefined, 
      };

      if (editingId) await updateMutation.mutateAsync({ ...payload, id: editingId });
      else await createMutation.mutateAsync(payload);
    } catch (error: any) {
      alert("Erro ao salvar: " + error.message);
      setIsSubmitting(false);
    }
  };

  const updateBarcodeField = (i: number, v: string) => {
    const newBarcodes = [...formData.barcodes];
    newBarcodes[i] = v;
    setFormData(p => ({ ...p, barcodes: newBarcodes }));
  };

  const toggleCategory = (catId: string) => {
    setFormData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(catId) 
        ? prev.categoryIds.filter(id => id !== catId) 
        : [...prev.categoryIds, catId]
    }));
  };

  return (
    <div className="drawer lg:drawer-open bg-slate-50 font-sans selection:bg-orange-600/20">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      
      <div className="drawer-content flex flex-col min-h-screen min-w-0">
        
        {/* Mobile Navbar */}
        <div className="w-full navbar bg-white/80 backdrop-blur-md sticky top-0 z-40 lg:hidden border-b border-slate-200/50 px-4">
          <label htmlFor="my-drawer-2" className="btn btn-ghost btn-circle drawer-button lg:hidden">
            <Activity className="w-6 h-6 text-orange-600" strokeWidth={2.5} />
          </label>
          <div className="flex-1 font-black text-xl tracking-tighter text-slate-900 ml-2">CASHFLOW</div>
        </div>

        <main className="flex-1 px-4 py-4 sm:p-4 2xl:p-6 lg:p-5 2xl:p-8 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden min-w-0 w-full">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <h1 className="text-lg sm:text-xl 2xl:text-2xl 2xl:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                <Package className="text-orange-600" size={32}/> Catálogo
              </h1>
              <p className="text-slate-500 font-medium text-xs sm:text-sm">Gerencie seu inventário centralizado.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="bg-white px-4 py-2.5 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex items-center gap-3 w-full sm:w-auto">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-xl"><PackageOpen size={18}/></div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Total Cadastrado</p>
                  <p className="text-lg font-black text-slate-800 leading-none">{productCount.data || 0}</p>
                </div>
              </div>
              <button 
                onClick={() => handleOpenModal()} 
                className="flex items-center justify-center gap-2 bg-gradient-to-br from-orange-500 to-orange-600 text-white px-6 sm:px-8 h-10 sm:h-12 2xl:h-14 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest shadow-[0_8px_25px_rgba(234,88,12,0.3)] hover:shadow-[0_8px_30px_rgba(234,88,12,0.4)] hover:-translate-y-0.5 border-none w-full sm:w-auto transition-all"
              >
                <Plus size={20} strokeWidth={2.5} /> Novo Produto
              </button>
            </div>
          </div>
          
          {/* Tabela de Produtos */}
          <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col overflow-hidden min-w-0 max-w-full">
            <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative group w-full max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
                  <input
                    type="text"
                    className="w-full h-10 sm:h-12 pl-10 pr-10 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-bold text-sm text-slate-700 placeholder:text-slate-300"
                    placeholder="Pesquisar por nome ou SKU..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin absolute right-4 top-1/2 -translate-y-1/2 text-orange-600"/>}
                </div>

                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
                  <div className="flex flex-1 items-center gap-1 rounded-xl bg-white p-1 border border-slate-200 sm:flex-none" role="group" aria-label="Filtrar por disponibilidade em estoque">
                    {[
                      { value: "all", label: "Todos" },
                      { value: "inStock", label: "Em estoque" },
                      { value: "outOfStock", label: "Esgotados" },
                    ].map((filter) => (
                      <button
                        key={filter.value}
                        type="button"
                        onClick={() => setStockFilter(filter.value as StockFilter)}
                        aria-pressed={stockFilter === filter.value}
                        className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 sm:flex-none ${stockFilter === filter.value
                          ? "bg-orange-600 text-white shadow-sm"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>

                  <details className="group relative w-full sm:w-auto">
                    <summary className="flex h-10 cursor-pointer list-none items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black uppercase tracking-wider text-slate-600 transition-colors hover:border-orange-200 hover:text-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2">
                      <span className="flex items-center gap-2"><Tags size={14} /> Categorias{selectedCategoryIds.length > 0 ? ` (${selectedCategoryIds.length})` : ""}</span>
                      <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="absolute right-0 z-20 mt-2 w-full min-w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg sm:w-64">
                      <div className="flex items-center justify-between px-2 pb-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Filtrar categorias</span>
                        {selectedCategoryIds.length > 0 && (
                          <button type="button" onClick={() => setSelectedCategoryIds([])} className="text-[9px] font-black uppercase tracking-wider text-orange-600 hover:text-orange-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded">
                            Limpar
                          </button>
                        )}
                      </div>
                      <div className="max-h-56 space-y-1 overflow-y-auto pr-1 custom-scrollbar">
                        {categorias?.map((category) => {
                          const isSelected = selectedCategoryIds.includes(category.id);

                          return (
                            <label key={category.id} className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-xs font-bold transition-colors ${isSelected ? "bg-orange-50 text-orange-700" : "text-slate-600 hover:bg-slate-50"}`}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleCategoryFilter(category.id)}
                                className="h-3.5 w-3.5 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                              />
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: category.color ?? "#cbd5e1" }} aria-hidden="true" />
                              <span className="truncate">{category.name}</span>
                            </label>
                          );
                        })}
                        {categorias?.length === 0 && <p className="px-2 py-3 text-xs font-medium text-slate-400">Nenhuma categoria cadastrada.</p>}
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            </div>

            <div className="w-full overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[750px] text-left">
                <thead>
                  <tr className="text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                    <th className="pl-5 sm:pl-6 py-4">Produto</th>
                    <th className="px-3 py-4">Fornecedor</th>
                    <th className="px-3 py-4">Categorias</th>
                    <th className="px-3 py-4">Precificação</th>
                    <th className="px-3 py-4">Estoque</th>
                    <th className="text-right pr-5 sm:pr-6 py-4">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    <tr><td colSpan={6} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-600"/></td></tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 font-bold italic text-slate-400 text-xs sm:text-sm">Nenhum produto encontrado.</td></tr>
                  ) : (
                    filteredProducts.map((product) => (
                        <ProductTableShow 
                            key={product.id} 
                            product={product as any} 
                            onEdit={handleOpenModal}
                            onDelete={(id) => confirm("Tem certeza que deseja excluir permanentemente este produto?") && deleteMutation.mutate({ id })}
                        />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div> 

      <SideBar />

      {/* --- MODAL DE PRODUTOS --- */}
      {isModalOpen && (
        <dialog className="modal modal-open bg-slate-900/40 backdrop-blur-sm z-[100] animate-in fade-in" onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}>
          <div className="modal-box w-11/12 max-w-5xl p-0 rounded-[2rem] shadow-2xl border border-white flex flex-col max-h-[90vh] bg-slate-50 overflow-hidden cursor-default">
            
            {/* Header Modal */}
            <div className="bg-white px-6 sm:px-8 py-5 flex justify-between items-center border-b border-slate-100 z-10 sticky top-0">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2.5 bg-orange-50 rounded-xl">
                    <PackageOpen className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="font-black text-lg sm:text-xl 2xl:text-2xl text-slate-800 tracking-tight">{editingId ? "Editar Produto" : "Novo Produto"}</h3>
                </div>
                <button type="button" onClick={handleCloseModal} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 text-slate-400 transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="overflow-y-auto p-4 sm:p-4 2xl:p-6 lg:p-5 2xl:p-8 flex-1 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                    
                    {/* Coluna Dados (Esquerda) */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* Seção Identificação */}
                        <div className="bg-white p-5 sm:p-4 2xl:p-6 lg:p-5 2xl:p-8 rounded-[1.5rem] shadow-[0_2px_15px_rgb(0,0,0,0.02)] border border-slate-100 space-y-5">
                            <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Informações Básicas</h4>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
                                <div className="flex flex-col gap-1.5 md:col-span-8">
                                    <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">Nome do Produto <span className="text-orange-600">*</span></label>
                                    <input required className="w-full rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-800 h-12 px-4 transition-all text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}/>
                                </div>
                                <div className="flex flex-col gap-1.5 md:col-span-4">
                                    <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">Código SKU</label>
                                    <input className="w-full rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold font-mono text-slate-800 h-12 px-4 transition-all text-sm placeholder:text-slate-300" placeholder="Opcional" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})}/>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">Descrição</label>
                                <textarea className="w-full rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-medium text-slate-700 h-24 sm:h-28 resize-none p-4 transition-all text-sm placeholder:text-slate-300" placeholder="Detalhes, especificações..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                            </div>
                        </div>

                        {/* Seção Financeira e Fornecedor */}
                        <div className="bg-white p-5 sm:p-4 2xl:p-6 lg:p-5 2xl:p-8 rounded-[1.5rem] shadow-[0_2px_15px_rgb(0,0,0,0.02)] border border-slate-100 space-y-5">
                            <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Precificação & Fornecimento</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                                <div className="flex flex-col gap-1.5">
                                    <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">Preço Compra</label>
                                    <div className="relative">
                                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">R$</span>
                                      <input type="number" step="0.01" className="w-full pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-black text-slate-700 h-12 transition-all text-sm" value={formData.precoCompra} onChange={e => setFormData({...formData, precoCompra: e.target.value})}/>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="uppercase text-[9px] sm:text-[10px] font-black text-orange-600 tracking-widest pl-1">Preço Venda *</label>
                                    <div className="relative">
                                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-orange-600/50">R$</span>
                                      <input type="number" step="0.01" required className="w-full pl-10 pr-4 rounded-xl bg-orange-50/50 border border-orange-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-black text-orange-600 h-12 transition-all text-sm" value={formData.precoVenda} onChange={e => setFormData({...formData, precoVenda: e.target.value})}/>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">Fornecedor *</label>
                                    <select required className="w-full px-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-700 h-12 transition-all text-sm" value={formData.fornecedorId} onChange={e => setFormData({...formData, fornecedorId: e.target.value})}>
                                        <option value="" disabled>Selecionar...</option>
                                        {fornecedores?.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Seção Inventário */}
                        <div className="bg-white p-5 sm:p-4 2xl:p-6 lg:p-5 2xl:p-8 rounded-[1.5rem] shadow-[0_2px_15px_rgb(0,0,0,0.02)] border border-slate-100 space-y-5">
                            <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Estoque & Logística</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
                                <div className="flex flex-col gap-1.5">
                                    <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">Qtd Estoque</label>
                                    <input type="number" required className="w-full px-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-black text-slate-700 h-12 text-center transition-all text-sm" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})}/>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">Unidade</label>
                                    <select className="w-full px-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-700 h-12 text-center transition-all text-sm" value={formData.unidadeMedida} onChange={e => setFormData({...formData, unidadeMedida: e.target.value})}>
                                        <option value="un">UN</option>
                                        <option value="kg">KG</option>
                                        <option value="l">Litros</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5 col-span-2">
                                    <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">Peso Líquido (g)</label>
                                    <input type="number" className="w-full px-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-700 h-12 transition-all text-sm" value={formData.peso} onChange={e => setFormData({...formData, peso: e.target.value})}/>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Coluna Mídia e Extras (Direita) */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* Imagem Card */}
                        <div className="bg-white p-5 sm:p-4 2xl:p-6 lg:p-5 2xl:p-8 rounded-[1.5rem] shadow-[0_2px_15px_rgb(0,0,0,0.02)] border border-slate-100 text-center">
                          <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Mídia Principal</h4>
                          <div className="w-full aspect-square bg-slate-50 rounded-[1.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group hover:border-orange-500/50 transition-all cursor-pointer">
                              {imagePreview ? (
                                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                              ) : (
                                  <div className="text-center p-4 sm:p-4 2xl:p-6 text-slate-400">
                                      <UploadCloud className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-30 group-hover:text-orange-600 transition-colors"/>
                                      <span className="text-[10px] sm:text-xs font-bold">Clique ou arraste a imagem</span>
                                  </div>
                              )}
                              <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                              {imagePreview && (
                                  <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <span className="text-white text-[9px] sm:text-[10px] uppercase tracking-widest font-black bg-black/60 px-4 py-2 rounded-xl backdrop-blur-md">Alterar Foto</span>
                                  </div>
                              )}
                          </div>
                        </div>

                        {/* Categorias Card */}
                        <div className="bg-white p-5 sm:p-4 2xl:p-6 lg:p-5 2xl:p-8 rounded-[1.5rem] shadow-[0_2px_15px_rgb(0,0,0,0.02)] border border-slate-100">
                          <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Categorias</h4>
                          <div className="flex flex-wrap gap-2">
                              {categorias?.map(cat => (
                                  <button 
                                      key={cat.id} 
                                      type="button"
                                      onClick={() => toggleCategory(cat.id)}
                                      className={`px-3 py-1.5 sm:px-4 sm:py-2 text-[9px] sm:text-xs font-black uppercase tracking-wider rounded-xl transition-all ${formData.categoryIds.includes(cat.id) ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100'}`}
                                  >
                                      {cat.name}
                                  </button>
                              ))}
                          </div>
                        </div>

                        {/* Códigos de Barras */}
                        <div className="bg-white p-5 sm:p-4 2xl:p-6 lg:p-5 2xl:p-8 rounded-[1.5rem] shadow-[0_2px_15px_rgb(0,0,0,0.02)] border border-slate-100">
                          <div className="flex justify-between items-center mb-4">
                              <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Barcode size={14}/> Códigos EAN</h4>
                              <button type="button" onClick={() => setFormData(p => ({ ...p, barcodes: [...p.barcodes, ""] }))} className="p-1.5 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-600 hover:text-white transition-colors"><Plus size={14}/></button>
                          </div>
                          <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                              {formData.barcodes.map((code, index) => (
                                  <div key={index} className="flex gap-2">
                                      <input className="px-3 rounded-xl bg-slate-50 border border-slate-100 font-bold font-mono text-[10px] sm:text-xs flex-1 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 text-slate-700 h-10 transition-all placeholder:text-slate-300" placeholder="Código..." value={code} onChange={(e) => updateBarcodeField(index, e.target.value)}/>
                                      <button type="button" onClick={() => setFormData(p => ({ ...p, barcodes: p.barcodes.filter((_, idx) => idx !== index) }))} className="h-10 w-10 flex items-center justify-center shrink-0 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-colors" disabled={formData.barcodes.length === 1}><Trash2 size={14} /></button>
                                  </div>
                              ))}
                          </div>
                        </div>

                    </div>
                </div>
            </form>

            {/* Footer Fixo */}
            <div className="bg-white px-6 sm:px-8 py-4 sm:py-5 flex justify-end gap-3 sm:gap-4 border-t border-slate-100 z-10 sticky bottom-0">
                <button type="button" onClick={handleCloseModal} className="flex items-center justify-center px-6 sm:px-8 h-10 sm:h-12 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 transition-colors">Cancelar</button>
                <button type="button" onClick={handleSave} className="flex items-center justify-center px-8 sm:px-10 h-10 sm:h-12 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-[0_8px_20px_rgba(234,88,12,0.3)] hover:shadow-[0_8px_25px_rgba(234,88,12,0.4)] hover:-translate-y-0.5 border-none transition-all" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : "Salvar Produto"}
                </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
