"use client";

import { useState } from "react";
import ProductTableShow from "../_components/ProductTableShow";
import SideBar from "../_components/SideBar";
import { 
  Search, Plus, X, Barcode, Trash2, Loader2, PackageOpen, UploadCloud, Info
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
    <div className="drawer lg:drawer-open font-sans bg-base-200">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col min-h-screen">
        <main className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-base-content">Catálogo</h1>
              <p className="text-base-content/60">Gerencie seu inventário centralizado.</p>
            </div>
            <button onClick={() => handleOpenModal()} className="btn btn-primary shadow-lg gap-2">
                <Plus className="w-4 h-4" /> Novo Produto
            </button>
          </div>

          <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 overflow-hidden">
            <div className="p-4 border-b border-base-300">
               <label className="input input-bordered flex items-center gap-2 w-full md:w-96">
                <Search className="w-4 h-4 opacity-50" />
                <input type="text" className="grow" placeholder="Buscar produtos..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                {isLoading && <Loader2 className="w-4 h-4 animate-spin"/>}
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="bg-base-200/50 uppercase text-xs">
                    <th>Produto</th>
                    <th>Fornecedor</th>
                    <th>Categorias</th>
                    <th>Preço Venda</th>
                    <th>Estoque</th>
                    <th className="text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {!isLoading && products?.map((product) => (
                      <ProductTableShow 
                          key={product.id} 
                          product={product as any} 
                          onEdit={handleOpenModal}
                          onDelete={(id) => confirm("Excluir?") && deleteMutation.mutate({ id })}
                      />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div> 

      <SideBar />

      {/* --- MODAL REESTRUTURADO --- */}
      {isModalOpen && (
        <dialog className="modal modal-open bg-base-300/60 backdrop-blur-sm">
          <div className="modal-box w-11/12 max-w-5xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="bg-base-100 px-6 py-4 flex justify-between items-center border-b border-base-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <PackageOpen className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-xl">{editingId ? "Editar Produto" : "Novo Produto"}</h3>
                </div>
                <button onClick={handleCloseModal} className="btn btn-sm btn-circle btn-ghost"><X className="w-5 h-5" /></button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="overflow-y-auto p-6 bg-base-200/30">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Coluna Dados (Left) */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* Seção Identificação */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="form-control md:col-span-8">
                                <label className="label"><span className="label-text font-semibold">Nome do Produto</span></label>
                                <input required className="input input-bordered w-full" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}/>
                            </div>
                            <div className="form-control md:col-span-4">
                                <label className="label"><span className="label-text font-semibold">SKU</span></label>
                                <input className="input input-bordered w-full font-mono" placeholder="Opcional" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})}/>
                            </div>
                        </div>

                        {/* Seção Financeira e Fornecedor */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-base-100 rounded-xl border border-base-300">
                            <div className="form-control">
                                <label className="label"><span className="label-text font-semibold">Preço Compra</span></label>
                                <div className="join w-full">
                                  <span className="join-item btn btn-sm btn-disabled">R$</span>
                                  <input type="number" step="0.01" className="input input-bordered input-sm join-item w-full" value={formData.precoCompra} onChange={e => setFormData({...formData, precoCompra: e.target.value})}/>
                                </div>
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text font-semibold text-primary">Preço Venda</span></label>
                                <div className="join w-full">
                                  <span className="join-item btn btn-sm btn-disabled">R$</span>
                                  <input type="number" step="0.01" className="input input-bordered input-sm input-primary join-item w-full font-bold" value={formData.precoVenda} onChange={e => setFormData({...formData, precoVenda: e.target.value})}/>
                                </div>
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text font-semibold">Fornecedor</span></label>
                                <select required className="select select-bordered select-sm w-full" value={formData.fornecedorId} onChange={e => setFormData({...formData, fornecedorId: e.target.value})}>
                                    <option value="" disabled>Selecionar...</option>
                                    {fornecedores?.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Seção Inventário */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text font-semibold">Estoque</span></label>
                                <input type="number" className="input input-bordered w-full" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})}/>
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text font-semibold">Unidade</span></label>
                                <select className="select select-bordered w-full" value={formData.unidadeMedida} onChange={e => setFormData({...formData, unidadeMedida: e.target.value})}>
                                    <option value="un">un</option>
                                    <option value="kg">kg</option>
                                    <option value="l">l</option>
                                </select>
                            </div>
                            <div className="form-control col-span-2">
                                <label className="label"><span className="label-text font-semibold">Peso Líquido (g)</span></label>
                                <input type="number" className="input input-bordered w-full" value={formData.peso} onChange={e => setFormData({...formData, peso: e.target.value})}/>
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label"><span className="label-text font-semibold">Descrição do Produto</span></label>
                            <textarea className="textarea textarea-bordered h-24 w-full" placeholder="Detalhes técnicos, material, etc..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                        </div>
                    </div>

                    {/* Coluna Mídia e Extras (Right) */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* Imagem Card */}
                        <div className="card bg-base-100 border border-base-300 shadow-sm">
                          <div className="card-body p-4">
                            <label className="label pt-0"><span className="label-text font-semibold">Mídia</span></label>
                            <div className="w-full aspect-square bg-base-200 rounded-xl border-2 border-dashed border-base-300 flex flex-col items-center justify-center relative overflow-hidden group hover:border-primary transition-all">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center p-4 text-base-content/40">
                                        <UploadCloud className="w-10 h-10 mx-auto mb-2 opacity-20"/>
                                        <span className="text-xs font-medium">Arraste ou clique para subir</span>
                                    </div>
                                )}
                                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                {imagePreview && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full border border-white/20">Alterar</span>
                                    </div>
                                )}
                            </div>
                          </div>
                        </div>

                        {/* Cod de Barras Card */}
                        <div className="card bg-base-100 border border-base-300 shadow-sm">
                          <div className="card-body p-4">
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-sm font-semibold flex items-center gap-2"><Barcode className="w-4 h-4" /> Códigos EAN</label>
                                <button type="button" onClick={() => setFormData(p => ({ ...p, barcodes: [...p.barcodes, ""] }))} className="btn btn-xs btn-circle btn-primary"><Plus className="w-3 h-3"/></button>
                            </div>
                            <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                                {formData.barcodes.map((code, index) => (
                                    <div key={index} className="flex gap-1">
                                        <input className="input input-bordered input-xs flex-1 font-mono" placeholder="789..." value={code} onChange={(e) => updateBarcodeField(index, e.target.value)}/>
                                        <button type="button" onClick={() => setFormData(p => ({ ...p, barcodes: p.barcodes.filter((_, idx) => idx !== index) }))} className="btn btn-xs btn-square btn-ghost text-error" disabled={formData.barcodes.length === 1}><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                ))}
                            </div>
                          </div>
                        </div>

                        {/* Categorias Card */}
                        <div className="card bg-base-100 border border-base-300 shadow-sm">
                          <div className="card-body p-4">
                            <label className="label pt-0"><span className="label-text font-semibold text-xs">Categorias Relacionadas</span></label>
                            <div className="flex flex-wrap gap-1.5">
                                {categorias?.map(cat => (
                                    <button 
                                        key={cat.id} 
                                        type="button"
                                        onClick={() => toggleCategory(cat.id)}
                                        className={`btn btn-xs rounded-full no-animation ${formData.categoryIds.includes(cat.id) ? 'btn-primary' : 'btn-outline opacity-60'}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                          </div>
                        </div>
                    </div>
                </div>

                {/* Footer Fixo (dentro do form para o botão submit funcionar) */}
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-base-300">
                    <button type="button" onClick={handleCloseModal} className="btn btn-ghost">Cancelar</button>
                    <button type="submit" className="btn btn-primary px-10 shadow-lg shadow-primary/20" disabled={isSubmitting}>
                        {isSubmitting ? <span className="loading loading-spinner"></span> : "Salvar Produto"}
                    </button>
                </div>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
}