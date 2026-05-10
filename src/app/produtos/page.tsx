"use client";

import { useState } from "react";
import ProductTableShow from "../_components/ProductTableShow";
import SideBar from "../_components/SideBar";
import { 
  Search, Plus, X, Barcode, Trash2, Loader2, PackageOpen, UploadCloud, Info, Package, Menu
} from "lucide-react";

import { api } from "~/trpc/react";
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "~/server/api/uploadthing/core";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { startUpload } = useUploadThing("imageUploader");

  // Queries
  const { data: products, isLoading, refetch } = api.produto.getAll.useQuery({ searchTerm });
  const productCount = api.produto.cont.useQuery();
  const { data: fornecedores } = api.fornecedor.getEvery.useQuery(); 
  const { data: categorias } = api.categoria.getAll.useQuery(); 

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
    <div className="drawer lg:drawer-open font-sans bg-[#F8FAFC] min-h-screen">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      
      <div className="drawer-content flex flex-col min-h-screen">
        {/* Mobile Navbar */}
        <div className="w-full navbar bg-white lg:hidden border-b border-slate-100 px-6">
          <label htmlFor="my-drawer-2" className="btn btn-ghost drawer-button lg:hidden">
            <Menu className="w-6 h-6" />
          </label>
          <div className="flex-1 font-black text-xl tracking-tighter">CASHFLOW</div>
        </div>

        <main className="flex-1 p-6 md:p-12 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-[1600px] mx-auto w-full">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                <Package className="text-primary" size={36}/> Catálogo
              </h1>
              <p className="text-slate-500 font-medium italic">Gerencie seu inventário centralizado.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 w-full sm:w-auto">
                <div className="p-2 bg-primary/10 text-primary rounded-xl"><PackageOpen size={18}/></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Cadastrado</p>
                  <p className="text-xl font-black text-slate-800 leading-none">{productCount.data || 0}</p>
                </div>
              </div>
              <button onClick={() => handleOpenModal()} className="btn btn-primary w-full sm:w-auto rounded-2xl px-8 h-14 font-black shadow-xl shadow-primary/30 border-none gap-2">
                <Plus size={20} /> NOVO PRODUTO
              </button>
            </div>
          </div>
          
          {/* Tabela de Produtos */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-50 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-slate-50/30">
               <div className="relative group w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  className="w-full h-12 pl-11 pr-10 bg-white border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary/5 transition-all font-bold text-sm text-slate-700 outline-none" 
                  placeholder="Pesquisar por nome ou SKU..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                />
                {isLoading && <Loader2 className="w-4 h-4 animate-spin absolute right-4 top-1/2 -translate-y-1/2 text-primary"/>}
              </div>
            </div>

            <div className="overflow-x-auto p-4">
              <table className="table w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-none">
                    <th className="pl-6 py-4">Produto</th>
                    <th>Fornecedor</th>
                    <th>Categorias</th>
                    <th>Precificação</th>
                    <th>Estoque</th>
                    <th className="text-right pr-6">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={6} className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary"/></td></tr>
                  ) : products?.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-20 font-bold italic text-slate-400">Nenhum produto encontrado.</td></tr>
                  ) : (
                    products?.map((product) => (
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
        <dialog className="modal modal-open bg-slate-900/60 backdrop-blur-md z-[100] animate-in fade-in">
          <div className="modal-box w-11/12 max-w-6xl p-0 rounded-[3rem] shadow-2xl border border-white flex flex-col max-h-[90vh] bg-[#F8FAFC]">
            
            {/* Header Modal */}
            <div className="bg-white px-10 py-6 flex justify-between items-center border-b border-slate-100 z-10 sticky top-0 rounded-t-[3rem]">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-2xl">
                    <PackageOpen className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-black text-2xl text-slate-800 tracking-tight">{editingId ? "Editar Produto" : "Novo Produto"}</h3>
                </div>
                <button onClick={handleCloseModal} className="btn btn-ghost btn-circle bg-slate-50 hover:bg-slate-200"><X className="w-5 h-5 text-slate-500" /></button>
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
                                    <label className="label text-[10px] font-black uppercase text-slate-400 px-1">Preço Compra</label>
                                    <div className="relative">
                                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">R$</span>
                                      <input type="number" step="0.01" className="input input-bordered w-full pl-10 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-black text-slate-700 h-12" value={formData.precoCompra} onChange={e => setFormData({...formData, precoCompra: e.target.value})}/>
                                    </div>
                                </div>
                                <div className="form-control">
                                    <label className="label text-[10px] font-black uppercase text-primary px-1">Preço Venda *</label>
                                    <div className="relative">
                                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-primary/50">R$</span>
                                      <input type="number" step="0.01" required className="input input-bordered w-full pl-10 rounded-2xl bg-primary/5 border-none focus:ring-2 focus:ring-primary/20 font-black text-primary h-12" value={formData.precoVenda} onChange={e => setFormData({...formData, precoVenda: e.target.value})}/>
                                    </div>
                                </div>
                                <div className="form-control">
                                    <label className="label text-[10px] font-black uppercase text-slate-400 px-1">Fornecedor *</label>
                                    <select required className="select select-bordered w-full rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-700 h-12" value={formData.fornecedorId} onChange={e => setFormData({...formData, fornecedorId: e.target.value})}>
                                        <option value="" disabled>Selecionar...</option>
                                        {fornecedores?.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
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
                                      <UploadCloud className="w-12 h-12 mx-auto mb-3 opacity-30 group-hover:text-primary transition-colors"/>
                                      <span className="text-xs font-bold">Clique ou arraste a imagem</span>
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
                              {categorias?.map(cat => (
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
                              <button type="button" onClick={() => setFormData(p => ({ ...p, barcodes: [...p.barcodes, ""] }))} className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"><Plus size={14}/></button>
                          </div>
                          <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                              {formData.barcodes.map((code, index) => (
                                  <div key={index} className="flex gap-2">
                                      <input className="input input-bordered h-10 rounded-xl bg-slate-50 border-none font-bold font-mono text-xs flex-1 focus:ring-2 focus:ring-primary/20 text-slate-700" placeholder="Código..." value={code} onChange={(e) => updateBarcodeField(index, e.target.value)}/>
                                      <button type="button" onClick={() => setFormData(p => ({ ...p, barcodes: p.barcodes.filter((_, idx) => idx !== index) }))} className="btn btn-sm h-10 w-10 btn-square bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white border-none rounded-xl transition-colors" disabled={formData.barcodes.length === 1}><Trash2 size={14} /></button>
                                  </div>
                              ))}
                          </div>
                        </div>

                    </div>
                </div>

                {/* Footer Fixo */}
                <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-slate-200 sticky bottom-0 bg-[#F8FAFC]">
                    <button type="button" onClick={handleCloseModal} className="btn btn-ghost rounded-2xl font-black text-xs uppercase tracking-widest px-8">Cancelar</button>
                    <button type="submit" className="btn btn-primary rounded-2xl font-black text-xs uppercase tracking-widest px-10 shadow-xl shadow-primary/30 border-none" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "SALVAR PRODUTO"}
                    </button>
                </div>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
}