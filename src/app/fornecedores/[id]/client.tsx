"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import {
  ArrowLeft, Phone, Mail, MapPin, Package, Edit3, Save, 
  Building2, Calendar, ExternalLink, Loader2, X, FileText, Activity, Eye
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
    <div className="drawer lg:drawer-open font-sans bg-slate-50 min-h-screen text-slate-900 selection:bg-orange-600/20">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      
      <div className="drawer-content flex flex-col min-h-screen min-w-0">
        
        {/* Mobile Navbar */}
        <div className="w-full navbar bg-white/80 backdrop-blur-md sticky top-0 z-40 lg:hidden border-b border-slate-200/50 px-4">
          <label htmlFor="my-drawer-2" className="btn btn-ghost btn-circle drawer-button lg:hidden">
            <Activity className="w-6 h-6 text-orange-600" strokeWidth={2.5} />
          </label>
          <div className="flex-1 font-black text-xl tracking-tighter text-slate-900 ml-2">CASHFLOW</div>
        </div>

        <main className="flex-1 px-4 py-4 sm:p-6 space-y-4 sm:space-y-6 max-w-[1600px] mx-auto w-full overflow-x-hidden min-w-0">
          
          {/* ================= HEADER ================= */}
          <div className="flex flex-col gap-3 sm:gap-4">
            <Link href="/fornecedores" className="inline-flex items-center justify-center gap-2 w-fit px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-white shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-100 text-slate-500 font-bold text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:text-orange-600 transition-colors">
              <ArrowLeft size={14} /> Voltar
            </Link>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 mt-1 sm:mt-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                  {supplier.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-3">
                  <span className="px-2.5 py-1 sm:px-3 sm:py-1 bg-slate-100 text-slate-500 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-slate-200 flex items-center gap-1.5">
                    <Building2 size={12} /> {supplier.cnpj || "Sem CNPJ"}
                  </span>
                  <span className="px-2.5 py-1 sm:px-3 sm:py-1 bg-orange-50 text-orange-600 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-orange-100 flex items-center gap-1.5">
                    <Calendar size={12} /> Parceiro desde {new Date(supplier.createdAt).getFullYear()}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={() => setIsEditModalOpen(true)} 
                className="flex items-center justify-center gap-2 bg-gradient-to-br from-orange-500 to-orange-600 text-white px-6 sm:px-8 h-10 sm:h-12 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-[0_8px_25px_rgba(234,88,12,0.3)] hover:shadow-[0_8px_30px_rgba(234,88,12,0.4)] hover:-translate-y-0.5 border-none w-full md:w-auto transition-all"
              >
                <Edit3 size={16} strokeWidth={2.5} /> Editar Dados
              </button>
            </div>
          </div>

          {/* ================= GRID DE CONTEÚDO ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            
            {/* --- COLUNA ESQUERDA: INFORMAÇÕES GERAIS --- */}
            <div className="space-y-4 sm:space-y-6">
              
              {/* Card Contato */}
              <div className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-6 lg:p-8 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100">
                <h2 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 sm:mb-6 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-orange-600" /> Canais de Contato
                </h2>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-3 sm:gap-4 bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                    <div className="p-2 sm:p-3 bg-white shadow-sm text-slate-600 rounded-lg sm:rounded-xl shrink-0"><Phone className="w-4 h-4 sm:w-5 sm:h-5" /></div>
                    <div>
                      <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Telefone Principal</p>
                      <p className="font-bold text-xs sm:text-sm text-slate-800 mt-0.5">{supplier.phone || "Não informado"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                    <div className="p-2 sm:p-3 bg-white shadow-sm text-slate-600 rounded-lg sm:rounded-xl shrink-0"><Mail className="w-4 h-4 sm:w-5 sm:h-5" /></div>
                    <div className="overflow-hidden w-full">
                      <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Email Corporativo</p>
                      {supplier.email ? (
                        <a href={`mailto:` + supplier.email} className="font-bold text-xs sm:text-sm text-slate-800 hover:text-orange-600 transition-colors truncate block mt-0.5">
                          {supplier.email}
                        </a>
                      ) : (
                        <p className="font-bold text-xs sm:text-sm text-slate-800 mt-0.5">Não informado</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Endereço */}
              <div className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-6 lg:p-8 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100">
                <h2 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 sm:mb-6 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-500" /> Localização
                </h2>
                
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2.5 sm:p-3 bg-rose-50 text-rose-500 rounded-lg sm:rounded-xl shrink-0 mt-1">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    {supplier.logradouro ? (
                      <>
                        <p className="font-bold text-slate-800 text-sm sm:text-base mb-1">{supplier.logradouro}, {supplier.numero}</p>
                        {supplier.complemento && <p>{supplier.complemento}</p>}
                        <p>{supplier.bairro}</p>
                        <p>{supplier.cidade} - {supplier.estado}</p>
                        <p className="font-mono text-[10px] sm:text-xs text-slate-400 mt-2 tracking-widest">{supplier.cep}</p>
                      </>
                    ) : (
                      <span className="italic text-slate-400">Endereço não cadastrado.</span>
                    )}
                  </div>
                </div>

                {supplier.logradouro && (
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=` + encodeURIComponent(supplier.logradouro + `, ` + supplier.numero + `, ` + supplier.cidade)}
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full mt-5 sm:mt-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-orange-600 transition-all flex items-center justify-center gap-2 border border-slate-200"
                  >
                    Abrir no Maps <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </a>
                )}
              </div>

              {/* Notas / Descrição */}
              {supplier.description && (
                <div className="bg-amber-50 rounded-2xl sm:rounded-[2rem] p-5 sm:p-6 lg:p-8 border border-amber-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 sm:w-1.5 h-full bg-amber-400"></div>
                  <h3 className="text-[9px] sm:text-[10px] font-black text-amber-700/60 uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Observações
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-900/80 font-medium leading-relaxed whitespace-pre-wrap">
                    {supplier.description}
                  </p>
                </div>
              )}
            </div>

            {/* --- COLUNA 2 e 3: CATÁLOGO DE PRODUTOS --- */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              
              {/* Resumo Rápido */}
              <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2rem] shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100 flex items-center gap-4 sm:gap-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-50 text-orange-600 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Produtos Fornecidos</p>
                  <p className="text-2xl sm:text-3xl font-black text-slate-800 leading-none mt-1">{supplier._count?.products || supplier.products?.length || 0}</p>
                </div>
              </div>

              {/* Tabela de Produtos */}
              <div className="bg-white rounded-2xl sm:rounded-[2rem] shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden flex flex-col h-full min-w-0">
                <div className="p-5 sm:p-6 lg:p-8 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-black text-slate-800 text-sm sm:text-base lg:text-lg uppercase tracking-widest flex items-center gap-2 sm:gap-3">
                    <Package className="text-orange-600 w-4 h-4 sm:w-5 sm:h-5"/> Catálogo Vinculado
                  </h3>
                </div>
                
                <div className="w-full overflow-x-auto custom-scrollbar p-2 sm:p-4">
                  <table className="w-full min-w-[600px] text-left">
                    <thead>
                      <tr className="text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
                        <th className="pl-3 sm:pl-4 py-3 sm:py-4">Produto</th>
                        <th className="px-2 sm:px-3 py-3 sm:py-4">SKU</th>
                        <th className="px-2 sm:px-3 py-3 sm:py-4">Preço Custo</th>
                        <th className="text-center px-2 sm:px-3 py-3 sm:py-4">Estoque</th>
                        <th className="text-right pr-3 sm:pr-4 py-3 sm:py-4">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {supplier.products?.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-12 sm:py-16">
                            <div className="flex flex-col items-center justify-center">
                                <Package className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-slate-200" />
                                <p className="text-slate-400 font-bold text-xs sm:text-sm">Nenhum produto vinculado.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        supplier.products?.map((prod: any) => (
                          <tr key={prod.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => router.push(`/produtos/` + prod.id)}>
                            <td className="pl-3 sm:pl-4 rounded-l-xl sm:rounded-l-2xl py-2 sm:py-3">
                              <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                                  {prod.imageUrl ? (
                                    <img src={prod.imageUrl} alt="pic" className="w-full h-full object-cover" />
                                  ) : (
                                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
                                  )}
                                </div>
                                <div className="font-black text-xs sm:text-sm text-slate-700 group-hover:text-orange-600 transition-colors">{prod.name}</div>
                              </div>
                            </td>
                            <td className="px-2 sm:px-3 py-2 sm:py-3">
                              <span className="font-mono text-[9px] sm:text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{prod.sku || "N/A"}</span>
                            </td>
                            <td className="px-2 sm:px-3 py-2 sm:py-3">
                              <span className="font-black text-xs sm:text-sm text-rose-500">{formatMoney(Number(prod.precoCompra))}</span>
                            </td>
                            <td className="text-center px-2 sm:px-3 py-2 sm:py-3">
                              <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest border ${prod.stock > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                {prod.stock} {prod.unidadeMedida}
                              </span>
                            </td>
                            <td className="text-right pr-3 sm:pr-4 rounded-r-xl sm:rounded-r-2xl py-2 sm:py-3">
                              <button onClick={(e) => { e.stopPropagation(); router.push(`/produtos/` + prod.id); }} className="h-8 sm:h-9 px-2 sm:px-3 bg-white border border-slate-200 text-slate-600 rounded-lg sm:rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:border-orange-500 hover:text-orange-600 hover:shadow-sm transition-all ml-auto">
                                <Eye size={12} className="sm:w-3.5 sm:h-3.5" /> Detalhes
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
        <dialog className="modal modal-open bg-slate-900/40 backdrop-blur-sm z-[100] animate-in fade-in" onClick={(e) => { if (e.target === e.currentTarget) setIsEditModalOpen(false); }}>
          <div className="modal-box w-11/12 max-w-4xl p-0 rounded-[2rem] shadow-2xl border border-white bg-slate-50 flex flex-col max-h-[90vh] overflow-hidden cursor-default">
            
            {/* Header Modal */}
            <div className="bg-white px-6 sm:px-8 py-5 flex justify-between items-center border-b border-slate-100 z-10 sticky top-0">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2.5 bg-orange-50 rounded-xl">
                    <Edit3 className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="font-black text-xl sm:text-2xl text-slate-800 tracking-tight">Editar Fornecedor</h3>
                </div>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 text-slate-400 transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 custom-scrollbar">
                
                {/* Seção 1: Dados Corporativos */}
                <div className="bg-white p-5 sm:p-6 rounded-[1.5rem] shadow-[0_2px_15px_rgb(0,0,0,0.02)] border border-slate-100 space-y-5">
                  <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-3">Dados Corporativos & Contato</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">Nome / Razão Social <span className="text-orange-600">*</span></label>
                      <input className="w-full rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-800 h-12 px-4 transition-all text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">CNPJ</label>
                      <input className="w-full rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold font-mono text-slate-800 h-12 px-4 transition-all text-sm" value={formData.cnpj} onChange={e => setFormData({...formData, cnpj: e.target.value})} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">Email</label>
                      <input type="email" className="w-full rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-800 h-12 px-4 transition-all text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">Telefone / WhatsApp</label>
                      <input className="w-full rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-800 h-12 px-4 transition-all text-sm" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">Observações / Descrição</label>
                      <textarea className="w-full rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-medium text-slate-700 h-24 resize-none p-4 transition-all text-sm" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* Seção 2: Endereço */}
                <div className="bg-white p-5 sm:p-6 rounded-[1.5rem] shadow-[0_2px_15px_rgb(0,0,0,0.02)] border border-slate-100 space-y-5">
                  <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-3">Localização</h4>
                  <div className="grid grid-cols-12 gap-4 sm:gap-5">
                    <div className="col-span-12 md:col-span-3 flex flex-col gap-1.5">
                      <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">CEP</label>
                      <input className="w-full rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-800 h-12 px-4 transition-all text-sm" value={formData.cep} onChange={e => setFormData({...formData, cep: e.target.value})} />
                    </div>
                    <div className="col-span-12 md:col-span-7 flex flex-col gap-1.5">
                      <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">Logradouro / Rua</label>
                      <input className="w-full rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-800 h-12 px-4 transition-all text-sm" value={formData.logradouro} onChange={e => setFormData({...formData, logradouro: e.target.value})} />
                    </div>
                    <div className="col-span-12 md:col-span-2 flex flex-col gap-1.5">
                      <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">Número</label>
                      <input className="w-full rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-800 h-12 px-4 transition-all text-sm" value={formData.numero} onChange={e => setFormData({...formData, numero: e.target.value})} />
                    </div>
                    <div className="col-span-12 md:col-span-4 flex flex-col gap-1.5">
                      <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">Bairro</label>
                      <input className="w-full rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-800 h-12 px-4 transition-all text-sm" value={formData.bairro} onChange={e => setFormData({...formData, bairro: e.target.value})} />
                    </div>
                    <div className="col-span-12 md:col-span-6 flex flex-col gap-1.5">
                      <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">Cidade</label>
                      <input className="w-full rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-800 h-12 px-4 transition-all text-sm" value={formData.cidade} onChange={e => setFormData({...formData, cidade: e.target.value})} />
                    </div>
                    <div className="col-span-12 md:col-span-2 flex flex-col gap-1.5">
                      <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">UF</label>
                      <input className="w-full rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-800 h-12 px-4 uppercase text-center transition-all text-sm" maxLength={2} value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})} />
                    </div>
                    <div className="col-span-12 flex flex-col gap-1.5">
                      <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">Complemento</label>
                      <input className="w-full rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-800 h-12 px-4 transition-all text-sm" value={formData.complemento} onChange={e => setFormData({...formData, complemento: e.target.value})} placeholder="Sala, Galpão, Ponto de referência..." />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Modal */}
              <div className="bg-white px-6 sm:px-8 py-4 sm:py-5 flex justify-end gap-3 sm:gap-4 border-t border-slate-100 z-10 sticky bottom-0 shrink-0">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex items-center justify-center px-6 sm:px-8 h-10 sm:h-12 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 transition-colors" disabled={isSubmitting}>Cancelar</button>
                <button type="submit" className="flex items-center justify-center px-8 sm:px-10 h-10 sm:h-12 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-[0_8px_20px_rgba(234,88,12,0.3)] hover:shadow-[0_8px_25px_rgba(234,88,12,0.4)] hover:-translate-y-0.5 border-none transition-all" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" /> : <><Save className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5" /> Salvar Alterações</>}
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
}