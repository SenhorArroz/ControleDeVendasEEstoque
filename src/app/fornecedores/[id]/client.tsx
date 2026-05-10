"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import {
  ArrowLeft, Phone, Mail, MapPin, Package, Edit3, Save, 
  Building2, Calendar, ExternalLink, Loader2, X, FileText, Menu, Eye
} from "lucide-react";
import SideBar from "../../_components/SideBar";

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

  const formatMoney = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="drawer lg:drawer-open font-sans bg-[#F8FAFC] min-h-screen text-slate-900">
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
          
          {/* ================= HEADER ================= */}
          <div className="flex flex-col gap-4">
            <Link href="/fornecedores" className="inline-flex items-center gap-2 w-fit px-4 py-2 rounded-xl bg-white shadow-sm border border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors">
              <ArrowLeft size={16} /> Fornecedores
            </Link>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-2">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                  {supplier.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200 flex items-center gap-1.5">
                    <Building2 size={12} /> {supplier.cnpj || "Sem CNPJ"}
                  </span>
                  <span className="px-3 py-1 bg-primary/5 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary/10 flex items-center gap-1.5">
                    <Calendar size={12} /> Parceiro desde {new Date(supplier.createdAt).getFullYear()}
                  </span>
                </div>
              </div>
              
              <button onClick={() => setIsEditModalOpen(true)} className="btn btn-primary rounded-2xl px-8 h-14 font-black shadow-xl shadow-primary/30 border-none gap-2 w-full md:w-auto">
                <Edit3 size={18} /> EDITAR DADOS
              </button>
            </div>
          </div>

          {/* ================= GRID DE CONTEÚDO ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* --- COLUNA ESQUERDA: INFORMAÇÕES GERAIS --- */}
            <div className="space-y-8">
              
              {/* Card Contato */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Canais de Contato
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                    <div className="p-3 bg-white shadow-sm text-primary rounded-xl shrink-0"><Phone className="w-5 h-5" /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Telefone Principal</p>
                      <p className="font-bold text-sm text-slate-800">{supplier.phone || "Não informado"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                    <div className="p-3 bg-white shadow-sm text-secondary rounded-xl shrink-0"><Mail className="w-5 h-5" /></div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Corporativo</p>
                      {supplier.email ? (
                        <a href={`mailto:${supplier.email}`} className="font-bold text-sm text-slate-800 hover:text-primary transition-colors truncate block">
                          {supplier.email}
                        </a>
                      ) : (
                        <p className="font-bold text-sm text-slate-800">Não informado</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Endereço */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Localização
                </h2>
                
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-rose-50 text-rose-500 rounded-xl shrink-0 mt-1">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="text-sm text-slate-600 font-medium leading-relaxed">
                    {supplier.logradouro ? (
                      <>
                        <p className="font-bold text-slate-800 text-base">{supplier.logradouro}, {supplier.numero}</p>
                        {supplier.complemento && <p>{supplier.complemento}</p>}
                        <p>{supplier.bairro}</p>
                        <p>{supplier.cidade} - {supplier.estado}</p>
                        <p className="font-mono text-xs opacity-60 mt-2 tracking-widest">{supplier.cep}</p>
                      </>
                    ) : (
                      <span className="italic opacity-50">Endereço não cadastrado no sistema.</span>
                    )}
                  </div>
                </div>

                {supplier.logradouro && (
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${supplier.logradouro}, ${supplier.numero}, ${supplier.cidade}`)}`}
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full mt-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-primary transition-all flex items-center justify-center gap-2 border border-slate-200"
                  >
                    ABRIR NO GOOGLE MAPS <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              {/* Notas / Descrição */}
              {supplier.description && (
                <div className="bg-amber-50 rounded-[2.5rem] p-8 border border-amber-100/50 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400"></div>
                  <h3 className="text-[10px] font-black text-amber-600/60 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Observações Internas
                  </h3>
                  <p className="text-sm text-amber-900/80 font-medium leading-relaxed whitespace-pre-wrap">
                    {supplier.description}
                  </p>
                </div>
              )}
            </div>

            {/* --- COLUNA 2 e 3: CATÁLOGO DE PRODUTOS --- */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Resumo Rápido */}
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50 flex items-center gap-6">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0">
                  <Package className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Produtos Fornecidos</p>
                  <p className="text-3xl font-black text-slate-800 leading-none mt-1">{supplier._count?.products || 0}</p>
                </div>
              </div>

              {/* Tabela de Produtos */}
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden flex flex-col h-full">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                  <h3 className="font-black text-slate-800 text-lg uppercase tracking-widest flex items-center gap-3">
                    <Package className="text-primary w-5 h-5"/> Catálogo Vinculado
                  </h3>
                </div>
                
                <div className="overflow-x-auto p-4 flex-1">
                  <table className="table w-full border-separate border-spacing-y-2">
                    <thead>
                      <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-none">
                        <th className="pl-4">Produto</th>
                        <th>SKU</th>
                        <th>Preço de Custo</th>
                        <th className="text-center">Estoque</th>
                        <th className="text-right pr-4">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supplier.products.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-20">
                            <Package className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                            <p className="text-slate-400 font-bold italic">Nenhum produto vinculado a este fornecedor.</p>
                          </td>
                        </tr>
                      ) : (
                        supplier.products.map((prod: any) => (
                          <tr key={prod.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => router.push(`/produtos/${prod.id}`)}>
                            <td className="pl-4 rounded-l-2xl py-3">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                                  {prod.imageUrl ? (
                                    <img src={prod.imageUrl} alt="pic" className="w-full h-full object-cover" />
                                  ) : (
                                    <Package className="w-5 h-5 text-slate-300" />
                                  )}
                                </div>
                                <div className="font-black text-sm text-slate-700 group-hover:text-primary transition-colors">{prod.name}</div>
                              </div>
                            </td>
                            <td>
                              <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{prod.sku || "N/A"}</span>
                            </td>
                            <td>
                              <span className="font-black text-rose-500">{formatMoney(Number(prod.precoCompra))}</span>
                            </td>
                            <td className="text-center">
                              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${prod.stock > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                {prod.stock} {prod.unidadeMedida}
                              </span>
                            </td>
                            <td className="text-right pr-4 rounded-r-2xl">
                              <button onClick={(e) => { e.stopPropagation(); router.push(`/produtos/${prod.id}`); }} className="btn btn-sm btn-ghost btn-circle text-slate-400 hover:text-primary">
                                <Eye className="w-4 h-4" />
                              </button>
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
        </main>
      </div>

      <SideBar />

      {/* ================= MODAL DE EDIÇÃO ================= */}
      {isEditModalOpen && (
        <dialog className="modal modal-open bg-slate-900/60 backdrop-blur-md z-[100] animate-in fade-in">
          <div className="modal-box w-11/12 max-w-5xl p-0 rounded-[3rem] shadow-2xl border border-white bg-[#F8FAFC] flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="bg-white px-10 py-6 flex justify-between items-center border-b border-slate-100 z-10 sticky top-0 rounded-t-[3rem]">
              <h3 className="font-black text-2xl tracking-tighter flex items-center gap-3 text-slate-900">
                <div className="p-2 bg-primary/10 rounded-xl text-primary"><Edit3 size={24}/></div>
                Editar Fornecedor
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="btn btn-ghost btn-circle btn-sm bg-slate-50 hover:bg-slate-200">
                <X size={20} className="text-slate-500"/>
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-8 custom-scrollbar">
                
                {/* Seção 1: Dados Corporativos */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50 space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Dados Corporativos & Contato</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-control">
                      <label className="label text-[10px] font-black uppercase text-slate-400 px-1">Nome / Razão Social *</label>
                      <input className="input input-bordered w-full rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-800 h-14 px-5" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="form-control">
                      <label className="label text-[10px] font-black uppercase text-slate-400 px-1">CNPJ</label>
                      <input className="input input-bordered w-full rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold font-mono text-slate-800 h-14 px-5" value={formData.cnpj} onChange={e => setFormData({...formData, cnpj: e.target.value})} />
                    </div>
                    <div className="form-control">
                      <label className="label text-[10px] font-black uppercase text-slate-400 px-1">Email</label>
                      <input type="email" className="input input-bordered w-full rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-800 h-14 px-5" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="form-control">
                      <label className="label text-[10px] font-black uppercase text-slate-400 px-1">Telefone / WhatsApp</label>
                      <input className="input input-bordered w-full rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-800 h-14 px-5" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="form-control md:col-span-2">
                      <label className="label text-[10px] font-black uppercase text-slate-400 px-1">Observações / Descrição</label>
                      <textarea className="textarea textarea-bordered w-full rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-700 h-24 resize-none p-5" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* Seção 2: Endereço */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50 space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Localização</h4>
                  <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-4 md:col-span-3 form-control">
                      <label className="label text-[10px] font-black uppercase text-slate-400 px-1">CEP</label>
                      <input className="input input-bordered w-full rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-800 h-14 px-4" value={formData.cep} onChange={e => setFormData({...formData, cep: e.target.value})} />
                    </div>
                    <div className="col-span-8 md:col-span-7 form-control">
                      <label className="label text-[10px] font-black uppercase text-slate-400 px-1">Logradouro / Rua</label>
                      <input className="input input-bordered w-full rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-800 h-14 px-5" value={formData.logradouro} onChange={e => setFormData({...formData, logradouro: e.target.value})} />
                    </div>
                    <div className="col-span-12 md:col-span-2 form-control">
                      <label className="label text-[10px] font-black uppercase text-slate-400 px-1">Número</label>
                      <input className="input input-bordered w-full rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-800 h-14 px-5" value={formData.numero} onChange={e => setFormData({...formData, numero: e.target.value})} />
                    </div>
                    <div className="col-span-12 md:col-span-4 form-control">
                      <label className="label text-[10px] font-black uppercase text-slate-400 px-1">Bairro</label>
                      <input className="input input-bordered w-full rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-800 h-14 px-5" value={formData.bairro} onChange={e => setFormData({...formData, bairro: e.target.value})} />
                    </div>
                    <div className="col-span-8 md:col-span-6 form-control">
                      <label className="label text-[10px] font-black uppercase text-slate-400 px-1">Cidade</label>
                      <input className="input input-bordered w-full rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-800 h-14 px-5" value={formData.cidade} onChange={e => setFormData({...formData, cidade: e.target.value})} />
                    </div>
                    <div className="col-span-4 md:col-span-2 form-control">
                      <label className="label text-[10px] font-black uppercase text-slate-400 px-1">UF</label>
                      <input className="input input-bordered w-full rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-800 h-14 px-5 uppercase text-center" maxLength={2} value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})} />
                    </div>
                    <div className="col-span-12 form-control">
                      <label className="label text-[10px] font-black uppercase text-slate-400 px-1">Complemento</label>
                      <input className="input input-bordered w-full rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-800 h-14 px-5" value={formData.complemento} onChange={e => setFormData({...formData, complemento: e.target.value})} placeholder="Sala, Galpão, Ponto de referência..." />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Modal */}
              <div className="bg-white p-6 border-t border-slate-100 flex justify-end gap-4 rounded-b-[3rem] shrink-0">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn btn-ghost rounded-2xl font-black text-xs tracking-widest px-8 text-slate-500 hover:bg-slate-100 h-14" disabled={isSubmitting}>CANCELAR</button>
                <button type="submit" className="btn btn-primary rounded-2xl font-black text-xs tracking-widest px-10 shadow-xl shadow-primary/30 border-none h-14" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <><Save className="w-5 h-5 mr-1" /> SALVAR ALTERAÇÕES</>}
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
}