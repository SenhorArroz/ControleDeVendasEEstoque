"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";
import {
  Truck,
  Plus,
  Search,
  MoreHorizontal,
  Phone,
  Mail,
  MapPin,
  Trash2,
  Building2,
  Loader2,
  AlertCircle,
  Menu,
  X,
  Eye
} from "lucide-react";
import SideBar from "../_components/SideBar"; 

export default function SuppliersClient() {
  // --- ESTADOS ---
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Formulário de Criação
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    cnpj: "",
    email: "",
    phone: "",
  });

  // --- TRPC (Backend) ---
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

  // --- HANDLERS ---
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newSupplier);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza? Isso pode afetar produtos vinculados ao fornecedor.")) {
      setIsDeleting(id);
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="drawer lg:drawer-open bg-[#F8FAFC] font-sans min-h-screen">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />

      {/* --- CONTEÚDO --- */}
      <div className="drawer-content flex flex-col">
        
        {/* Navbar Mobile */}
        <div className="w-full navbar bg-white lg:hidden border-b border-slate-100 px-6">
          <label htmlFor="my-drawer-2" className="btn btn-ghost drawer-button lg:hidden">
            <Menu className="w-6 h-6 text-primary" />
          </label>
          <div className="flex-1 font-black text-xl tracking-tighter">CASHFLOW</div>
        </div>

        <main className="flex-1 p-6 md:p-12 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-7xl mx-auto w-full">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                <Truck className="text-primary" size={36} /> Fornecedores
              </h1>
              <p className="text-slate-500 font-medium italic">Cadastre e gerencie seus parceiros comerciais.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 w-full sm:w-auto">
                <div className="p-2 bg-primary/10 text-primary rounded-xl"><Building2 size={18}/></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Parceiros</p>
                  <p className="text-xl font-black text-slate-800 leading-none">{suppliers?.length || 0}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="btn btn-primary rounded-2xl px-8 h-14 font-black shadow-xl shadow-primary/30 border-none gap-2 w-full sm:w-auto"
              >
                <Plus size={20} /> ADICIONAR
              </button>
            </div>
          </div>

          {/* Tabela de Listagem */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-50 flex flex-col overflow-hidden transition-all hover:shadow-md">
            
            {/* Barra de Busca (Embutida no topo do Card) */}
            <div className="p-6 border-b border-slate-50 bg-slate-50/30">
              <div className="relative group w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome, email ou documento..."
                  className="w-full h-12 pl-11 pr-10 bg-white border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary/5 transition-all font-bold text-sm text-slate-700 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {isLoading && <Loader2 className="w-4 h-4 animate-spin absolute right-4 top-1/2 -translate-y-1/2 text-primary"/>}
              </div>
            </div>

            <div className="overflow-x-auto p-4">
              <table className="table w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-none">
                    <th className="pl-6 py-4">Empresa / Fornecedor</th>
                    <th className="hidden md:table-cell">Contatos</th>
                    <th className="hidden lg:table-cell">Localização</th>
                    <th className="text-right pr-6">Ações</th>
                  </tr>
                </thead>
                
                <tbody>
                  {/* Loading State */}
                  {isLoading && Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="pl-6 py-4"><div className="h-12 bg-slate-100 rounded-2xl w-48"></div></td>
                      <td className="hidden md:table-cell"><div className="h-4 bg-slate-100 rounded-lg w-32"></div></td>
                      <td className="hidden lg:table-cell"><div className="h-4 bg-slate-100 rounded-lg w-24"></div></td>
                      <td></td>
                    </tr>
                  ))}

                  {/* Empty State */}
                  {!isLoading && suppliers?.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-20">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Building2 className="w-10 h-10 text-slate-300" />
                          </div>
                          <p className="text-sm font-bold tracking-tight mb-2">Nenhum fornecedor encontrado.</p>
                          <button onClick={() => setIsCreateModalOpen(true)} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                            Cadastrar Primeiro Parceiro
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Lista Real */}
                  {!isLoading && suppliers?.map((supplier) => (
                    <tr key={supplier.id} className="group hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => document.getElementById(`link-${supplier.id}`)?.click()}>
                      
                      {/* Coluna Nome */}
                      <td className="pl-6 py-4 rounded-l-2xl">
                        <div className="flex items-center gap-4">
                          <Link id={`link-${supplier.id}`} href={`/fornecedores/${supplier.id}`} className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-inner shrink-0">
                            <span className="text-lg font-black">{supplier.name.charAt(0).toUpperCase()}</span>
                          </Link>
                          <div>
                            <Link href={`/fornecedores/${supplier.id}`} className="font-black text-slate-800 text-sm tracking-tight hover:text-primary transition-colors block">
                              {supplier.name}
                            </Link>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                              CNPJ: {supplier.cnpj || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Coluna Contato */}
                      <td className="hidden md:table-cell">
                        <div className="space-y-1.5">
                          {supplier.email && (
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                              <Mail className="w-3.5 h-3.5 text-slate-400" /> {supplier.email}
                            </div>
                          )}
                          {supplier.phone && (
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                              <Phone className="w-3.5 h-3.5 text-slate-400" /> {supplier.phone}
                            </div>
                          )}
                          {!supplier.email && !supplier.phone && (
                            <span className="text-[10px] font-bold text-slate-300 italic uppercase tracking-widest">Sem contato</span>
                          )}
                        </div>
                      </td>

                      {/* Coluna Localização */}
                      <td className="hidden lg:table-cell">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {supplier.cidade ? `${supplier.cidade} - ${supplier.estado}` : <span className="opacity-50 italic">Não informada</span>}
                        </div>
                      </td>

                      {/* Coluna Ações */}
                      <td className="text-right pr-6 rounded-r-2xl" onClick={e => e.stopPropagation()}>
                        <div className="dropdown dropdown-end dropdown-left">
                          <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-circle text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors">
                            <MoreHorizontal className="w-5 h-5" />
                          </div>
                          <ul tabIndex={0} className="dropdown-content z-[50] menu p-2 shadow-2xl bg-slate-900 text-white rounded-2xl w-48 border border-slate-800 font-bold text-xs uppercase tracking-widest">
                            <li>
                              <Link href={`/fornecedores/${supplier.id}`} className="hover:bg-slate-800 py-3">
                                <Eye className="w-4 h-4" /> Detalhes
                              </Link>
                            </li>
                            <div className="h-px bg-slate-800 my-1 w-full" />
                            <li>
                              <button 
                                onClick={() => handleDelete(supplier.id)} 
                                className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-400 py-3"
                                disabled={isDeleting === supplier.id}
                              >
                                {isDeleting === supplier.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Excluir
                              </button>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <SideBar />

      {/* --- MODAL DE CRIAÇÃO (Glassmorphism & SaaS Design) --- */}
      {isCreateModalOpen && (
        <dialog className="modal modal-open bg-slate-900/60 backdrop-blur-md z-[100] animate-in fade-in duration-300">
          <div className="modal-box w-11/12 max-w-xl p-10 rounded-[3rem] shadow-2xl border border-white bg-white">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-6 mb-8">
              <h3 className="font-black text-2xl tracking-tighter flex items-center gap-3 text-slate-900">
                <div className="p-2 bg-primary/10 rounded-xl text-primary"><Building2 size={24}/></div>
                Novo Fornecedor
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="btn btn-ghost btn-circle btn-sm bg-slate-50 hover:bg-slate-200">
                <X size={20} className="text-slate-500"/>
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-6">
              
              <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl flex items-start gap-3 border border-blue-100">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="text-xs font-bold leading-relaxed">Você poderá adicionar o endereço completo e demais informações na tela de detalhes do fornecedor.</span>
              </div>

              <div className="form-control">
                <label className="label uppercase text-[10px] font-black text-slate-400 tracking-widest px-1">Nome da Empresa *</label>
                <input 
                  required
                  className="input input-bordered w-full rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-800 h-14 px-5" 
                  placeholder="Ex: Distribuidora Alpha Ltda"
                  value={newSupplier.name}
                  onChange={e => setNewSupplier({...newSupplier, name: e.target.value})}
                />
              </div>

              <div className="form-control">
                <label className="label uppercase text-[10px] font-black text-slate-400 tracking-widest px-1">CNPJ</label>
                <input 
                  className="input input-bordered w-full rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold font-mono text-slate-800 h-14 px-5" 
                  placeholder="00.000.000/0001-00"
                  value={newSupplier.cnpj}
                  onChange={e => setNewSupplier({...newSupplier, cnpj: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label uppercase text-[10px] font-black text-slate-400 tracking-widest px-1">Email Comercial</label>
                  <input 
                    type="email"
                    className="input input-bordered w-full rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-800 h-14 px-5" 
                    placeholder="contato@empresa.com"
                    value={newSupplier.email}
                    onChange={e => setNewSupplier({...newSupplier, email: e.target.value})}
                  />
                </div>
                <div className="form-control">
                  <label className="label uppercase text-[10px] font-black text-slate-400 tracking-widest px-1">Telefone</label>
                  <input 
                    className="input input-bordered w-full rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-800 h-14 px-5" 
                    placeholder="(00) 00000-0000"
                    value={newSupplier.phone}
                    onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn btn-ghost flex-1 rounded-2xl font-black text-xs tracking-widest text-slate-500 hover:bg-slate-100 h-14"
                >
                  CANCELAR
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary flex-1 rounded-2xl font-black text-xs tracking-widest shadow-xl shadow-primary/30 border-none h-14"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? <Loader2 className="animate-spin w-5 h-5" /> : "SALVAR FORNECEDOR"}
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
}