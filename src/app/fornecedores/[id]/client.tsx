"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Package,
  Edit3,
  Save,
  Building2,
  Calendar,
  ExternalLink,
  Loader2,
  X
} from "lucide-react";

export default function FornecedorDetailClient({ supplier }: { supplier: any }) {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado local para o formulário
  const [formData, setFormData] = useState({
    name: supplier.name,
    cnpj: supplier.cnpj || "",
    email: supplier.email || "",
    phone: supplier.phone || "",
    description: supplier.description || "",
    cep: supplier.cep || "",
    logradouro: supplier.logradouro || "",
    numero: supplier.numero || "",
    complemento: supplier.complemento || "",
    bairro: supplier.bairro || "",
    cidade: supplier.cidade || "",
    estado: supplier.estado || "",
  });

  // Mutation
  const updateMutation = api.fornecedor.update.useMutation({
    onSuccess: () => {
      setIsEditModalOpen(false);
      setIsSubmitting(false);
      router.refresh();
      alert("Fornecedor atualizado!");
    },
    onError: (err) => {
      setIsSubmitting(false);
      alert("Erro: " + err.message);
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    updateMutation.mutate({ id: supplier.id, ...formData });
  };

  // Utilitário de formatação de moeda
  const formatMoney = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8 font-sans">
      
      {/* HEADER DE NAVEGAÇÃO */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/fornecedores" className="btn btn-circle btn-ghost hover:bg-base-300">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-base-content flex items-center gap-2">
              {supplier.name}
            </h1>
            <div className="flex items-center gap-3 text-sm opacity-60 mt-1">
              <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {supplier.cnpj || "Sem CNPJ"}</span>
              <span className="hidden sm:flex items-center gap-1"><Calendar className="w-3 h-3" /> Cliente desde {new Date(supplier.createdAt).getFullYear()}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="btn btn-primary gap-2 shadow-lg shadow-primary/20"
        >
          <Edit3 className="w-4 h-4" /> <span className="hidden sm:inline">Editar Dados</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- COLUNA 1: INFORMAÇÕES GERAIS --- */}
        <div className="space-y-6">
          
          {/* Card Contato */}
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body">
              <h2 className="card-title text-sm uppercase opacity-50 mb-2">Canais de Contato</h2>
              
              <div className="flex items-center gap-3 p-3 bg-base-200/50 rounded-xl">
                <div className="p-2 bg-primary/10 text-primary rounded-lg"><Phone className="w-5 h-5" /></div>
                <div>
                  <p className="text-xs opacity-60">Telefone</p>
                  <p className="font-semibold">{supplier.phone || "--"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-base-200/50 rounded-xl">
                <div className="p-2 bg-secondary/10 text-secondary rounded-lg"><Mail className="w-5 h-5" /></div>
                <div>
                  <p className="text-xs opacity-60">Email</p>
                  <a href={`mailto:${supplier.email}`} className="font-semibold hover:text-primary transition-colors truncate max-w-[200px] block">
                    {supplier.email || "--"}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Card Endereço */}
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body">
              <h2 className="card-title text-sm uppercase opacity-50 mb-2">Endereço</h2>
              <div className="flex gap-3">
                <MapPin className="w-6 h-6 text-error/70 mt-1 shrink-0" />
                <div className="text-sm">
                  {supplier.logradouro ? (
                    <>
                      <p className="font-bold">{supplier.logradouro}, {supplier.numero}</p>
                      <p>{supplier.bairro}</p>
                      <p>{supplier.cidade} - {supplier.estado}</p>
                      <p className="font-mono text-xs opacity-50 mt-1">{supplier.cep}</p>
                    </>
                  ) : (
                    <span className="italic opacity-50">Endereço não cadastrado.</span>
                  )}
                </div>
              </div>
              {supplier.logradouro && (
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${supplier.logradouro}, ${supplier.numero}, ${supplier.cidade}`)}`}
                  target="_blank" 
                  rel="noreferrer"
                  className="btn btn-xs btn-outline btn-block mt-4 gap-2"
                >
                  Abrir no Mapa <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Notas */}
          {supplier.description && (
            <div className="card bg-warning/10 border border-warning/20">
              <div className="card-body p-4">
                <h3 className="font-bold text-warning text-sm">Observações</h3>
                <p className="text-sm opacity-80">{supplier.description}</p>
              </div>
            </div>
          )}
        </div>

        {/* --- COLUNA 2 e 3: CATÁLOGO DE PRODUTOS --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Resumo Rápido */}
          <div className="stats shadow-sm bg-base-100 w-full border border-base-200">
            <div className="stat">
              <div className="stat-figure text-primary bg-primary/10 p-2 rounded-full">
                <Package className="w-6 h-6" />
              </div>
              <div className="stat-title">Produtos Fornecidos</div>
              <div className="stat-value text-primary">{supplier._count?.products || 0}</div>
              <div className="stat-desc">Itens ativos no sistema</div>
            </div>
          </div>

          {/* Tabela de Produtos */}
          <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body p-0">
              <div className="p-5 border-b border-base-200">
                <h3 className="font-bold text-lg">Catálogo de Itens</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead className="bg-base-200/50">
                    <tr>
                      <th>Produto</th>
                      <th>SKU</th>
                      <th>Preço de Custo</th>
                      <th className="text-center">Estoque</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplier.products.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-base-content/40">
                          <Package className="w-12 h-12 mx-auto mb-2 opacity-20" />
                          <p>Nenhum produto vinculado a este fornecedor.</p>
                        </td>
                      </tr>
                    ) : (
                      supplier.products.map((prod: any) => (
                        <tr key={prod.id} className="hover:bg-base-100">
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="avatar rounded bg-base-300 w-10 h-10 flex items-center justify-center">
                                {prod.imageUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={prod.imageUrl} alt="pic" className="rounded" />
                                ) : (
                                  <Package className="w-5 h-5 opacity-30" />
                                )}
                              </div>
                              <div className="font-bold">{prod.name}</div>
                            </div>
                          </td>
                          <td className="font-mono text-xs opacity-70">{prod.sku || "-"}</td>
                          <td className="font-medium text-error">{formatMoney(Number(prod.precoCompra))}</td>
                          <td className="text-center">
                            <span className={`badge badge-sm ${prod.stock > 0 ? 'badge-success badge-outline' : 'badge-ghost opacity-50'}`}>
                              {prod.stock} {prod.unidadeMedida}
                            </span>
                          </td>
                          <td className="text-right">
                            <Link href={`/produtos/${prod.id}`} className="btn btn-xs btn-ghost">
                              Ver
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL DE EDIÇÃO --- */}
      {isEditModalOpen && (
        <dialog className="modal modal-open backdrop-blur-sm bg-black/40 z-50">
          <div className="modal-box w-11/12 max-w-4xl p-0 overflow-hidden rounded-2xl shadow-2xl bg-base-100 border border-base-300">
            
            {/* Header Modal */}
            <div className="bg-base-200/90 px-6 py-4 flex justify-between items-center border-b border-base-300 sticky top-0 z-10">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-primary" /> Editar Fornecedor
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="btn btn-sm btn-circle btn-ghost">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col h-[70vh] md:h-auto">
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                
                {/* Seção 1: Dados Corporativos */}
                <div>
                  <h4 className="text-xs font-bold uppercase opacity-50 mb-3 border-b pb-1">Dados Corporativos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label text-xs font-bold">Nome / Razão Social</label>
                      <input className="input input-bordered" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="form-control">
                      <label className="label text-xs font-bold">CNPJ</label>
                      <input className="input input-bordered" value={formData.cnpj} onChange={e => setFormData({...formData, cnpj: e.target.value})} />
                    </div>
                    <div className="form-control">
                      <label className="label text-xs font-bold">Email</label>
                      <input className="input input-bordered" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="form-control">
                      <label className="label text-xs font-bold">Telefone</label>
                      <input className="input input-bordered" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="form-control md:col-span-2">
                      <label className="label text-xs font-bold">Descrição</label>
                      <textarea className="textarea textarea-bordered h-20" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* Seção 2: Endereço */}
                <div>
                  <h4 className="text-xs font-bold uppercase opacity-50 mb-3 border-b pb-1">Endereço</h4>
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-4 md:col-span-3 form-control">
                      <label className="label text-xs font-bold">CEP</label>
                      <input className="input input-bordered" value={formData.cep} onChange={e => setFormData({...formData, cep: e.target.value})} />
                    </div>
                    <div className="col-span-8 md:col-span-7 form-control">
                      <label className="label text-xs font-bold">Logradouro</label>
                      <input className="input input-bordered" value={formData.logradouro} onChange={e => setFormData({...formData, logradouro: e.target.value})} />
                    </div>
                    <div className="col-span-12 md:col-span-2 form-control">
                      <label className="label text-xs font-bold">Número</label>
                      <input className="input input-bordered" value={formData.numero} onChange={e => setFormData({...formData, numero: e.target.value})} />
                    </div>
                    <div className="col-span-12 md:col-span-4 form-control">
                      <label className="label text-xs font-bold">Bairro</label>
                      <input className="input input-bordered" value={formData.bairro} onChange={e => setFormData({...formData, bairro: e.target.value})} />
                    </div>
                    <div className="col-span-8 md:col-span-6 form-control">
                      <label className="label text-xs font-bold">Cidade</label>
                      <input className="input input-bordered" value={formData.cidade} onChange={e => setFormData({...formData, cidade: e.target.value})} />
                    </div>
                    <div className="col-span-4 md:col-span-2 form-control">
                      <label className="label text-xs font-bold">UF</label>
                      <input className="input input-bordered uppercase" maxLength={2} value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})} />
                    </div>
                    <div className="col-span-12 form-control">
                      <label className="label text-xs font-bold">Complemento</label>
                      <input className="input input-bordered" value={formData.complemento} onChange={e => setFormData({...formData, complemento: e.target.value})} />
                    </div>
                  </div>
                </div>

              </div>

              {/* Footer Modal */}
              <div className="p-4 bg-base-100 border-t border-base-300 flex justify-end gap-3 sticky bottom-0 z-10">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn btn-ghost" disabled={isSubmitting}>Cancelar</button>
                <button type="submit" className="btn btn-primary px-8" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <><Save className="w-4 h-4 mr-1" /> Salvar</>}
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
}