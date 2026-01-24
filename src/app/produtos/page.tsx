"use client";

import { useState } from "react";
import ProductTableShow from "../_components/ProductTableShow";
import SideBar from "../_components/SideBar";
import { 
  Search, Plus, X, Barcode, Trash2, Loader2, PackageOpen, UploadCloud 
} from "lucide-react";

// Imports do tRPC
import { api } from "~/trpc/react";

// --- UPLOADTHING IMPORTS ---
import { generateReactHelpers } from "@uploadthing/react";
// Importe o tipo do seu roteador (ajuste o caminho se necessário)
import type { OurFileRouter } from "~/server/api/uploadthing/core";

// Inicializa o hook tipado
const { useUploadThing } = generateReactHelpers<OurFileRouter>();

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // --- UPLOADTHING HOOK ---
  const { startUpload } = useUploadThing("imageUploader");

  // --- DATA FETCHING ---
  const { data: products, isLoading, refetch } = api.produto.getAll.useQuery({ searchTerm });
  const { data: fornecedores } = api.fornecedor.getEvery.useQuery(); 
  const { data: categorias } = api.categoria.getAll.useQuery(); 

  // --- MUTAÇÕES ---
  const createMutation = api.produto.create.useMutation({
    onSuccess: () => {
      refetch();
      handleCloseModal();
      alert("Produto criado com sucesso!");
    },
    onError: (e) => alert("Erro ao criar: " + e.message)
  });

  const updateMutation = api.produto.update.useMutation({
    onSuccess: () => {
      refetch();
      handleCloseModal();
      alert("Produto atualizado!");
    },
  });

  const deleteMutation = api.produto.delete.useMutation({ onSuccess: () => refetch() });

  // --- ESTADOS ---
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

  // --- HANDLERS ---
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
        barcodes: product.codeBarras?.length > 0 
          ? product.codeBarras.map((b: any) => b.code) 
          : [""],
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
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // --- ONDE A MÁGICA ACONTECE (SALVAR) ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalImageUrl = imagePreview; // Mantém a URL atual caso não mude

      // 1. SE TIVER ARQUIVO NOVO, FAZ UPLOAD NO UPLOADTHING
      if (selectedImageFile) {
        // Envia o array de arquivos (mesmo sendo um só)
        const uploadRes = await startUpload([selectedImageFile]);
        
        if (uploadRes && uploadRes[0]) {
          // ATENÇÃO: Use .ufsUrl aqui
          finalImageUrl = uploadRes[0].ufsUrl;
          console.log("Imagem enviada:", finalImageUrl);
        } else {
          throw new Error("Falha no upload da imagem (UploadThing)");
        }
      }

      // 2. PREPARA DADOS
      const payload = {
        name: formData.name,
        description: formData.description,
        sku: formData.sku,
        precoVenda: parseFloat(formData.precoVenda) || 0,
        precoCompra: parseFloat(formData.precoCompra) || 0,
        stock: parseInt(formData.stock) || 0,
        unidadeMedida: formData.unidadeMedida,
        peso: parseFloat(formData.peso) || 0,
        fornecedorId: formData.fornecedorId,
        barcodes: formData.barcodes.filter(c => c.trim() !== ""),
        categoryIds: formData.categoryIds,
        imageUrl: finalImageUrl || undefined, 
      };

      // 3. SALVA NO BANCO
      if (editingId) {
        await updateMutation.mutateAsync({ ...payload, id: editingId });
      } else {
        await createMutation.mutateAsync(payload);
      }

    } catch (error: any) {
      console.error(error);
      alert("Erro ao salvar: " + (error.message || "Erro desconhecido"));
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Excluir este produto?")) deleteMutation.mutate({ id });
  };

  // --- Helpers de UI ---
  const addBarcodeField = () => setFormData(p => ({ ...p, barcodes: [...p.barcodes, ""] }));
  const removeBarcodeField = (i: number) => setFormData(p => ({ ...p, barcodes: p.barcodes.filter((_, idx) => idx !== i) }));
  const updateBarcodeField = (i: number, v: string) => {
    const newBarcodes = [...formData.barcodes];
    newBarcodes[i] = v;
    setFormData(p => ({ ...p, barcodes: newBarcodes }));
  };

  const toggleCategory = (catId: string) => {
    setFormData(prev => {
      const exists = prev.categoryIds.includes(catId);
      if (exists) return { ...prev, categoryIds: prev.categoryIds.filter(id => id !== catId) };
      return { ...prev, categoryIds: [...prev.categoryIds, catId] };
    });
  };

  return (
    <div className="drawer lg:drawer-open font-sans bg-base-200">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      
      <div className="drawer-content flex flex-col min-h-screen">
        <main className="p-4 md:p-8">
          
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-base-content">Catálogo</h1>
              <p className="text-base-content/60">Gerencie seu inventário.</p>
            </div>
            <button onClick={() => handleOpenModal()} className="btn btn-primary shadow-lg gap-2">
                <Plus className="w-4 h-4" /> Novo Produto
            </button>
          </div>

          <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 overflow-hidden">
             {/* Toolbar de Busca */}
            <div className="p-4 border-b border-base-300">
               <label className="input input-bordered flex items-center gap-2 w-full md:w-96">
                <Search className="w-4 h-4 opacity-50" />
                <input type="text" className="grow" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                {isLoading && <Loader2 className="w-4 h-4 animate-spin"/>}
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="table w-full align-middle">
                <thead>
                  <tr className="bg-base-200/50 uppercase text-xs">
                    <th>Produto</th>
                    <th>Fornecedor</th>
                    <th>Preço Venda</th>
                    <th>Estoque</th>
                    <th className="text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {!isLoading && products?.map((product) => (
                      <ProductTableShow 
                          key={product.id} 
                          product={{
                              ...product,
                              precoVenda: Number(product.precoVenda),
                              precoCompra: Number(product.precoCompra),
                              peso: product.peso ? Number(product.peso) : null,
                              barcodes: product.codeBarras
                          } as any} 
                          onEdit={handleOpenModal}
                          onDelete={handleDelete}
                      />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div> 

      <SideBar />

      {/* --- MODAL --- */}
      {isModalOpen && (
        <dialog className="modal modal-bottom sm:modal-middle modal-open bg-base-300/50 backdrop-blur-sm">
          <div className="modal-box w-11/12 max-w-5xl p-0 overflow-hidden">
            
            <div className="bg-base-200 px-6 py-4 flex justify-between items-center border-b border-base-300">
                <h3 className="font-bold text-lg">{editingId ? "Editar Produto" : "Novo Produto"}</h3>
                <button onClick={handleCloseModal} className="btn btn-sm btn-circle btn-ghost"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSave} className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* COLUNA ESQUERDA (2/3) - DADOS */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="form-control">
                        <label className="label">Nome do Produto</label>
                        <input required className="input input-bordered" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}/>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label">SKU</label>
                            <input className="input input-bordered font-mono" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})}/>
                        </div>
                        {/* DROPDOWN FORNECEDOR */}
                        <div className="form-control">
                            <label className="label">Fornecedor</label>
                            <select 
                                required
                                className="select select-bordered"
                                value={formData.fornecedorId}
                                onChange={e => setFormData({...formData, fornecedorId: e.target.value})}
                            >
                                <option value="" disabled>Selecione um fornecedor...</option>
                                {fornecedores?.map(f => (
                                    <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                            </select>
                            {!fornecedores?.length && <span className="label-text-alt text-error mt-1">Nenhum fornecedor cadastrado.</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label">Preço Compra</label>
                            <input type="number" step="0.01" className="input input-bordered" value={formData.precoCompra} onChange={e => setFormData({...formData, precoCompra: e.target.value})}/>
                        </div>
                        <div className="form-control">
                            <label className="label">Preço Venda</label>
                            <input type="number" step="0.01" className="input input-bordered input-primary" value={formData.precoVenda} onChange={e => setFormData({...formData, precoVenda: e.target.value})}/>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="form-control">
                            <label className="label">Estoque</label>
                            <input type="number" className="input input-bordered" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})}/>
                        </div>
                        <div className="form-control">
                            <label className="label">Unidade</label>
                            <select className="select select-bordered" value={formData.unidadeMedida} onChange={e => setFormData({...formData, unidadeMedida: e.target.value})}>
                                <option value="un">Unidade (un)</option>
                                <option value="kg">Quilo (kg)</option>
                                <option value="g">Grama (g)</option>
                                <option value="l">Litro (l)</option>
                                <option value="ml">Mililitro (ml)</option>
                            </select>
                        </div>
                        <div className="form-control">
                            <label className="label">Peso (g)</label>
                            <input type="number" step="0.01" className="input input-bordered" value={formData.peso} onChange={e => setFormData({...formData, peso: e.target.value})}/>
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label">Descrição</label>
                        <textarea className="textarea textarea-bordered h-20" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                    </div>
                </div>

                {/* COLUNA DIREITA (1/3) - FOTO E EXTRAS */}
                <div className="space-y-6">
                    
                    {/* UPLOAD IMAGEM */}
                    <div className="form-control">
                        <label className="label font-semibold">Imagem</label>
                        <div className="w-full aspect-square bg-base-200 rounded-xl border-2 border-dashed border-base-300 flex flex-col items-center justify-center relative overflow-hidden group hover:border-primary transition-colors">
                            {imagePreview ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center p-4 text-base-content/40">
                                    <UploadCloud className="w-10 h-10 mx-auto mb-2"/>
                                    <span className="text-sm">Clique para upload</span>
                                </div>
                            )}
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 opacity-0 cursor-pointer" 
                            />
                            {imagePreview && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-sm font-bold">Trocar Imagem</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CÓDIGOS DE BARRAS */}
                    <div className="bg-base-200/50 p-4 rounded-xl border border-base-300">
                        <div className="flex justify-between items-center mb-2">
                            <label className="font-semibold flex items-center gap-2"><Barcode className="w-4 h-4" /> Códigos de Barras</label>
                            <button type="button" onClick={addBarcodeField} className="btn btn-xs btn-ghost text-primary">+ Add</button>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {formData.barcodes.map((code, index) => (
                                <div key={index} className="flex gap-2">
                                    <input className="input input-bordered input-sm flex-1 font-mono" placeholder="EAN" value={code} onChange={(e) => updateBarcodeField(index, e.target.value)}/>
                                    <button type="button" onClick={() => removeBarcodeField(index)} className="btn btn-sm btn-square btn-ghost text-error" disabled={formData.barcodes.length === 1 && index === 0}><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CATEGORIAS */}
                    <div className="form-control">
                        <label className="label font-semibold">Categorias</label>
                        <div className="flex flex-wrap gap-2">
                            {categorias?.map(cat => {
                                const isSelected = formData.categoryIds.includes(cat.id);
                                return (
                                    <span 
                                        key={cat.id} 
                                        onClick={() => toggleCategory(cat.id)}
                                        className={`badge cursor-pointer select-none ${isSelected ? 'badge-primary' : 'badge-outline'}`}
                                    >
                                        {cat.name} {isSelected && <X className="w-3 h-3 ml-1"/>}
                                    </span>
                                )
                            })}
                            {!categorias?.length && <span className="text-xs text-base-content/50">Sem categorias</span>}
                        </div>
                    </div>
                </div>

                <div className="col-span-full flex justify-end gap-3 mt-4 pt-4 border-t border-base-300">
                    <button type="button" onClick={handleCloseModal} className="btn btn-ghost" disabled={isSubmitting}>Cancelar</button>
                    <button type="submit" className="btn btn-primary px-8" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin" /> : "Salvar Produto"}
                    </button>
                </div>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
}