"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";
import {
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Trash2,
  Building2,
  Loader2,
  AlertCircle,
  X,
  Eye,
  Activity
} from "lucide-react";
import SideBar from "../_components/SideBar"; 

export default function SuppliersClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const [newSupplier, setNewSupplier] = useState({
    name: "",
    cnpj: "",
    email: "",
    phone: "",
  });

  const { data: suppliers, isLoading, refetch } = api.fornecedor.getAll.useQuery({
    searchTerm,
  });

  const createMutation = api.fornecedor.create.useMutation({
    onSuccess: () => {
      setIsCreateModalOpen(false);
      setNewSupplier({ name: "", cnpj: "", email: "", phone: "" });
      refetch();
    },
    onError: (err) => alert("Erro ao criar: " + err.message),
  });

  const deleteMutation = api.fornecedor.delete.useMutation({
    onSuccess: () => {
      refetch();
      setIsDeleting(null);
    },
    onError: (err) => {
        setIsDeleting(null);
        alert("Erro ao excluir: " + err.message)
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newSupplier);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Tem certeza? Isso pode afetar produtos vinculados ao fornecedor.")) {
      setIsDeleting(id);
      deleteMutation.mutate({ id });
    }
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

        <main className="flex-1 px-4 py-4 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden min-w-0 w-full">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                <Truck className="text-orange-600" size={32}/> Fornecedores
              </h1>
              <p className="text-slate-500 font-medium text-xs sm:text-sm">Cadastre e gerencie seus parceiros comerciais.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="bg-white px-4 py-2.5 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex items-center gap-3 w-full sm:w-auto">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-xl"><Building2 size={18}/></div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Parceiros</p>
                  <p className="text-lg font-black text-slate-800 leading-none">{suppliers?.length || 0}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(true)} 
                className="flex items-center justify-center gap-2 bg-gradient-to-br from-orange-500 to-orange-600 text-white px-6 sm:px-8 h-12 sm:h-14 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest shadow-[0_8px_25px_rgba(234,88,12,0.3)] hover:shadow-[0_8px_30px_rgba(234,88,12,0.4)] hover:-translate-y-0.5 border-none w-full sm:w-auto transition-all"
              >
                <Plus size={20} strokeWidth={2.5} /> Novo Fornecedor
              </button>
            </div>
          </div>

          {/* Tabela de Fornecedores */}
          <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col overflow-hidden min-w-0 max-w-full">
            
            <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100 bg-slate-50/50">
               <div className="relative group w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
                <input 
                  type="text" 
                  className="w-full h-10 sm:h-12 pl-10 pr-10 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-bold text-sm text-slate-700 placeholder:text-slate-300" 
                  placeholder="Pesquisar por nome, email ou documento..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                />
                {isLoading && <Loader2 className="w-4 h-4 animate-spin absolute right-4 top-1/2 -translate-y-1/2 text-orange-600"/>}
              </div>
            </div>

            <div className="w-full overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[750px] text-left">
                <thead>
                  <tr className="text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                    <th className="pl-5 sm:pl-6 py-4">Fornecedor</th>
                    <th className="px-3 py-4">Contatos</th>
                    <th className="text-right pr-5 sm:pr-6 py-4">Ações</th>
                  </tr>
                </thead>
                
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    <tr><td colSpan={3} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-600"/></td></tr>
                  ) : suppliers?.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Building2 className="w-8 h-8 text-slate-300" />
                          </div>
                          <p className="text-xs sm:text-sm font-bold tracking-tight mb-2">Nenhum fornecedor encontrado.</p>
                          <button onClick={() => setIsCreateModalOpen(true)} className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:underline">
                            Cadastrar Primeiro Parceiro
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    suppliers?.map((supplier) => (
                      <tr key={supplier.id} className="group hover:bg-slate-50 transition-colors">
                        
                        <td className="pl-5 sm:pl-6 py-4">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 transition-all shrink-0">
                              <span className="text-base sm:text-lg font-black uppercase">{supplier.name.charAt(0)}</span>
                            </div>
                            <div>
                              <span className="font-black text-slate-800 text-xs sm:text-sm tracking-tight block">
                                {supplier.name}
                              </span>
                              <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                CNPJ: {supplier.cnpj || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-4">
                          <div className="space-y-1.5">
                            {supplier.email && (
                              <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-500">
                                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" /> <span className="truncate max-w-[150px]">{supplier.email}</span>
                              </div>
                            )}
                            {supplier.phone && (
                              <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-500">
                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {supplier.phone}
                              </div>
                            )}
                            {!supplier.email && !supplier.phone && (
                              <span className="text-[9px] sm:text-[10px] font-bold text-slate-300 italic uppercase tracking-widest">Sem contato</span>
                            )}
                          </div>
                        </td>

                        <td className="text-right pr-5 sm:pr-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link 
                                href={`/fornecedores/${supplier.id}`}
                                className="h-8 sm:h-9 px-3 bg-white border border-slate-200 text-slate-600 rounded-lg sm:rounded-xl flex items-center justify-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:border-orange-500 hover:text-orange-600 hover:shadow-sm transition-all"
                            >
                                <Eye size={14} /> Detalhes
                            </Link>
                            <button
                                onClick={(e) => handleDelete(supplier.id, e)}
                                disabled={isDeleting === supplier.id}
                                className="w-8 h-8 sm:w-9 sm:h-9 bg-rose-50 text-rose-500 rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors disabled:opacity-50"
                                title="Excluir"
                            >
                                {isDeleting === supplier.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <SideBar />

      {/* --- MODAL DE CRIAÇÃO --- */}
      {isCreateModalOpen && (
        <dialog className="modal modal-open bg-slate-900/40 backdrop-blur-sm z-[100] animate-in fade-in" onClick={(e) => { if (e.target === e.currentTarget) setIsCreateModalOpen(false); }}>
          <div className="modal-box w-11/12 max-w-lg p-0 rounded-[2rem] shadow-2xl border border-white flex flex-col max-h-[90vh] bg-slate-50 overflow-hidden cursor-default">
            
            <div className="bg-white px-6 sm:px-8 py-5 flex justify-between items-center border-b border-slate-100 z-10 sticky top-0">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2.5 bg-orange-50 rounded-xl">
                    <Building2 className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="font-black text-xl sm:text-2xl text-slate-800 tracking-tight">Novo Fornecedor</h3>
                </div>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 text-slate-400 transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <form onSubmit={handleCreate} className="overflow-y-auto p-4 sm:p-5 flex-1 custom-scrollbar space-y-6">
              
              <div className="bg-blue-50 text-blue-600 p-4 rounded-[1.5rem] flex items-start gap-3 border border-blue-100">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="text-[10px] sm:text-xs font-bold leading-relaxed">Você poderá adicionar o endereço completo e demais informações na tela de detalhes do fornecedor.</span>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-[1.5rem] shadow-[0_2px_15px_rgb(0,0,0,0.02)] border border-slate-100 space-y-5">
                <div className="flex flex-col gap-1.5">
                    <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">Nome da Empresa <span className="text-orange-600">*</span></label>
                    <input 
                        required
                        className="w-full rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-800 h-12 px-4 transition-all text-sm" 
                        placeholder="Ex: Distribuidora Alpha Ltda"
                        value={newSupplier.name}
                        onChange={e => setNewSupplier({...newSupplier, name: e.target.value})}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">CNPJ</label>
                    <input 
                        className="w-full rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold font-mono text-slate-800 h-12 px-4 transition-all text-sm placeholder:text-slate-300" 
                        placeholder="00.000.000/0001-00"
                        value={newSupplier.cnpj}
                        onChange={e => setNewSupplier({...newSupplier, cnpj: e.target.value})}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">Email</label>
                        <input 
                            type="email"
                            className="w-full rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-800 h-12 px-4 transition-all text-sm placeholder:text-slate-300" 
                            placeholder="contato@empresa.com"
                            value={newSupplier.email}
                            onChange={e => setNewSupplier({...newSupplier, email: e.target.value})}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">Telefone</label>
                        <input 
                            className="w-full rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-800 h-12 px-4 transition-all text-sm placeholder:text-slate-300" 
                            placeholder="(00) 00000-0000"
                            value={newSupplier.phone}
                            onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})}
                        />
                    </div>
                </div>
              </div>

            </form>
            
            <div className="bg-white px-6 sm:px-8 py-4 sm:py-5 flex justify-end gap-3 sm:gap-4 border-t border-slate-100 z-10 sticky bottom-0">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex items-center justify-center px-6 sm:px-8 h-10 sm:h-12 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 transition-colors">Cancelar</button>
                <button type="submit" onClick={handleCreate} className="flex items-center justify-center px-8 sm:px-10 h-10 sm:h-12 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-[0_8px_20px_rgba(234,88,12,0.3)] hover:shadow-[0_8px_25px_rgba(234,88,12,0.4)] hover:-translate-y-0.5 border-none transition-all" disabled={createMutation.isPending}>
                    {createMutation.isPending ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : "Salvar Fornecedor"}
                </button>
            </div>

          </div>
        </dialog>
      )}
    </div>
  );
}