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
  AlertCircle
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
      alert("Fornecedor criado com sucesso!");
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
    if (window.confirm("Tem certeza? Isso pode afetar produtos vinculados.")) {
      setIsDeleting(id);
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="drawer lg:drawer-open bg-base-200 font-sans min-h-screen">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />

      {/* --- CONTEÚDO --- */}
      <div className="drawer-content flex flex-col">
        
        {/* Navbar Mobile */}
        <div className="w-full navbar bg-base-100 lg:hidden shadow-sm z-50">
          <div className="flex-none">
            <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </label>
          </div>
          <div className="flex-1 px-2 mx-2 font-bold text-xl text-primary">Fornecedores</div>
        </div>

        <main className="flex-1 p-4 md:p-8 space-y-6 overflow-y-auto">
          
          {/* Cabeçalho */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-base-content flex items-center gap-2">
                <Truck className="w-8 h-8 text-primary" /> Gestão de Fornecedores
              </h1>
              <p className="text-base-content/60 text-sm mt-1">
                Cadastre e gerencie seus parceiros comerciais.
              </p>
            </div>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="btn btn-primary text-white shadow-lg shadow-primary/20 gap-2"
            >
              <Plus className="w-5 h-5" /> Novo Fornecedor
            </button>
          </div>

          {/* Cards de Resumo (Opcional, mas dá um visual pro) */}
          {!isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <div className="stats shadow-sm bg-base-100 border border-base-200">
                  <div className="stat">
                    <div className="stat-title text-xs font-bold uppercase opacity-60">Total Cadastrado</div>
                    <div className="stat-value text-primary">{suppliers?.length || 0}</div>
                  </div>
               </div>
               {/* Você pode adicionar mais stats aqui futuramente */}
            </div>
          )}

          {/* Barra de Busca */}
          <div className="bg-base-100 p-4 rounded-xl shadow-sm border border-base-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar fornecedor por nome, email ou documento..."
                className="input input-bordered w-full pl-10 focus:input-primary transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
            </div>
          </div>

          {/* Tabela de Listagem */}
          <div className="card bg-base-100 shadow-xl border border-base-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table table-lg">
                {/* Cabeçalho da Tabela */}
                <thead className="bg-base-200/50 text-base-content/70">
                  <tr>
                    <th>Fornecedor</th>
                    <th className="hidden md:table-cell">Contato</th>
                    <th className="hidden lg:table-cell">Localização</th>
                    <th className="text-right">Ações</th>
                  </tr>
                </thead>
                
                <tbody>
                  {/* Loading State */}
                  {isLoading && Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td><div className="h-12 bg-base-300 rounded w-48"></div></td>
                      <td className="hidden md:table-cell"><div className="h-4 bg-base-300 rounded w-32"></div></td>
                      <td className="hidden lg:table-cell"><div className="h-4 bg-base-300 rounded w-24"></div></td>
                      <td></td>
                    </tr>
                  ))}

                  {/* Empty State */}
                  {!isLoading && suppliers?.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-16">
                        <div className="flex flex-col items-center justify-center text-base-content/30">
                          <Building2 className="w-16 h-16 mb-4" />
                          <p className="text-lg font-medium">Nenhum fornecedor encontrado.</p>
                          <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-link no-underline mt-2">
                            Cadastre o primeiro agora
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Lista Real */}
                  {!isLoading && suppliers?.map((supplier) => (
                    <tr key={supplier.id} className="group hover:bg-base-100 transition-colors">
                      
                      {/* Coluna Nome (Link Principal) */}
                      <td>
                        <div className="flex items-center gap-4">
                          <Link href={`/fornecedores/${supplier.id}`} className="avatar placeholder">
                            <div className="bg-neutral-focus text-neutral-content rounded-xl w-12 h-12 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                              <span className="text-xl font-bold">{supplier.name.charAt(0).toUpperCase()}</span>
                            </div>
                          </Link>
                          <div>
                            <Link 
                                href={`/fornecedores/${supplier.id}`} 
                                className="font-bold text-lg hover:text-primary transition-colors block"
                            >
                              {supplier.name}
                            </Link>
                            <div className="text-xs opacity-50 font-mono mt-1">
                              {supplier.cnpj || "CNPJ não informado"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Coluna Contato */}
                      <td className="hidden md:table-cell">
                        <div className="space-y-1">
                          {supplier.email && (
                            <div className="flex items-center gap-2 text-sm opacity-70" title="Email">
                              <Mail className="w-3 h-3" /> {supplier.email}
                            </div>
                          )}
                          {supplier.phone && (
                            <div className="flex items-center gap-2 text-sm opacity-70" title="Telefone">
                              <Phone className="w-3 h-3" /> {supplier.phone}
                            </div>
                          )}
                          {!supplier.email && !supplier.phone && (
                            <span className="text-xs opacity-40 italic">Sem contato registrado</span>
                          )}
                        </div>
                      </td>

                      {/* Coluna Localização */}
                      <td className="hidden lg:table-cell">
                        <div className="flex items-center gap-2 text-sm opacity-70">
                            <MapPin className="w-4 h-4" />
                            {supplier.cidade ? `${supplier.cidade} - ${supplier.estado}` : <span className="opacity-50 italic">--</span>}
                        </div>
                      </td>

                      {/* Coluna Ações */}
                      <td className="text-right">
                        <div className="join">
                            <Link 
                                href={`/dashboard/suppliers/${supplier.id}`}
                                className="btn btn-sm btn-ghost join-item tooltip"
                                data-tip="Detalhes"
                            >
                                <MoreHorizontal className="w-4 h-4" />
                            </Link>
                            <button 
                                onClick={() => handleDelete(supplier.id)}
                                className="btn btn-sm btn-ghost text-error join-item tooltip"
                                data-tip="Excluir"
                                disabled={isDeleting === supplier.id}
                            >
                                {isDeleting === supplier.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
                            </button>
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

      {/* --- MODAL DE CRIAÇÃO RÁPIDA --- */}
      {isCreateModalOpen && (
        <dialog className="modal modal-open backdrop-blur-sm bg-black/40 z-[60]">
          <div className="modal-box w-11/12 max-w-lg p-0 overflow-hidden rounded-2xl shadow-2xl bg-base-100 animate-in zoom-in-95 duration-200">
            
            {/* Header Modal */}
            <div className="bg-base-200/90 px-6 py-4 flex justify-between items-center border-b border-base-300">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" /> Novo Fornecedor
              </h3>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="alert alert-info py-2 text-xs flex items-center">
                <AlertCircle className="w-4 h-4" />
                <span>Você poderá adicionar endereço completo na próxima tela.</span>
              </div>

              <div className="form-control">
                <label className="label text-xs font-bold uppercase opacity-60">Nome da Empresa *</label>
                <input 
                  required
                  className="input input-bordered focus:input-primary w-full" 
                  placeholder="Ex: Distribuidora Alpha Ltda"
                  value={newSupplier.name}
                  onChange={e => setNewSupplier({...newSupplier, name: e.target.value})}
                />
              </div>

              <div className="form-control">
                <label className="label text-xs font-bold uppercase opacity-60">CNPJ</label>
                <input 
                  className="input input-bordered focus:input-primary w-full" 
                  placeholder="00.000.000/0001-00"
                  value={newSupplier.cnpj}
                  onChange={e => setNewSupplier({...newSupplier, cnpj: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label text-xs font-bold uppercase opacity-60">Email</label>
                  <input 
                    type="email"
                    className="input input-bordered focus:input-primary w-full" 
                    placeholder="comercial@alpha.com"
                    value={newSupplier.email}
                    onChange={e => setNewSupplier({...newSupplier, email: e.target.value})}
                  />
                </div>
                <div className="form-control">
                  <label className="label text-xs font-bold uppercase opacity-60">Telefone</label>
                  <input 
                    className="input input-bordered focus:input-primary w-full" 
                    placeholder="(11) 99999-9999"
                    value={newSupplier.phone}
                    onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-base-200 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn btn-ghost"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary px-8"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
}