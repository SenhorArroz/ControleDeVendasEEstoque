"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { 
  Search, Plus, Loader2, Users, Phone, MapPin, User, Menu, ChevronRight, X 
} from "lucide-react";

import SideBar from "../../_components/SideBar"; 
import { ClienteRow } from "../../_components/ClienteTableComponent";

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", address: "" });

  const { data: clients, isLoading, refetch } = api.cliente.getAll.useQuery({ search: searchTerm });

  const createMutation = api.cliente.create.useMutation({
    onSuccess: () => {
      setIsModalOpen(false);
      setFormData({ name: "", phone: "", address: "" });
      refetch();
    },
    onError: (err) => alert(err.message),
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  // Garante que a lista fique sempre em ordem alfabética
  const sortedClients = clients ? [...clients].sort((a, b) => a.name.localeCompare(b.name)) : [];

  return (
    <div className="drawer lg:drawer-open bg-[#F8FAFC] min-h-screen font-sans text-slate-900">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      
      <div className="drawer-content flex flex-col min-h-screen">
        {/* Mobile Navbar */}
        <div className="w-full navbar bg-white lg:hidden border-b border-slate-100 px-6">
          <label htmlFor="my-drawer-2" className="btn btn-ghost drawer-button lg:hidden">
            <Menu className="w-6 h-6 text-primary" />
          </label>
          <div className="flex-1 font-black text-xl tracking-tighter text-slate-900">CASHFLOW</div>
        </div>

        <main className="flex-1 p-6 md:p-12 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-[1600px] mx-auto w-full">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                <Users className="text-primary" size={36}/> Clientes
              </h1>
              <p className="text-slate-500 font-medium italic">Base de dados e histórico de relacionamento.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              {/* Barra de Busca Corrigida */}
              <div className="relative group w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Pesquisar cliente..." 
                  className="w-full h-14 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm text-slate-800 outline-none placeholder:text-slate-400 placeholder:font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button onClick={() => setIsModalOpen(true)} className="btn btn-primary rounded-2xl h-14 px-8 font-black shadow-xl shadow-primary/30 gap-2 border-none hover:scale-[1.02] transition-transform w-full sm:w-auto">
                <Plus size={20} /> ADICIONAR
              </button>
            </div>
          </div>

          {/* Tabela Section */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden transition-all hover:shadow-md">
            <div className="overflow-x-auto p-4">
              <table className="table w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-none bg-slate-50/50 rounded-xl">
                    <th className="py-5 pl-8 rounded-l-xl">Informações Básicas</th>
                    <th>Status</th>
                    <th>LTV (Total Gasto)</th>
                    <th>Último Contato</th>
                    <th className="text-right pr-8 rounded-r-xl">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-20">
                        <Loader2 className="animate-spin mx-auto text-primary" size={32}/>
                      </td>
                    </tr>
                  ) : sortedClients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-20 text-slate-400 font-bold italic">
                        {searchTerm ? "Nenhum cliente encontrado para esta busca." : "Nenhum cliente na base de dados."}
                      </td>
                    </tr>
                  ) : (
                    sortedClients.map((client) => (
                      <ClienteRow key={client.id} client={client as any} />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div> 

      <SideBar />

      {/* MODAL DE CRIAÇÃO (SaaS Premium) */}
      {isModalOpen && (
        <dialog className="modal modal-open bg-slate-900/60 backdrop-blur-md z-[100] animate-in fade-in duration-300">
          <div className="modal-box w-11/12 max-w-xl rounded-[3rem] p-10 shadow-2xl border border-white bg-white">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-6 mb-8">
              <h3 className="font-black text-2xl tracking-tighter flex items-center gap-3 text-slate-900">
                <div className="p-2 bg-primary/10 rounded-xl text-primary"><User size={24}/></div>
                Novo Cadastro
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost btn-circle btn-sm bg-slate-50 hover:bg-slate-200">
                <X size={20} className="text-slate-500"/>
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-6">
              
              <div className="form-control">
                <label className="label uppercase text-[10px] font-black text-slate-400 tracking-widest px-1">Nome Completo *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    type="text" 
                    required 
                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-800 outline-none"
                    placeholder="Ex: Maria Oliveira"
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label uppercase text-[10px] font-black text-slate-400 tracking-widest px-1">Telefone / WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input 
                      type="tel" 
                      className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-800 outline-none"
                      placeholder="(00) 00000-0000"
                      value={formData.phone} 
                      onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="form-control">
                  <label className="label uppercase text-[10px] font-black text-slate-400 tracking-widest px-1">Localização / Endereço</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input 
                      type="text" 
                      className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-800 outline-none"
                      placeholder="Ex: São Paulo, SP"
                      value={formData.address} 
                      onChange={(e) => setFormData({...formData, address: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 flex gap-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-1/3 h-14 bg-slate-50 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors" disabled={createMutation.isPending}>
                  CANCELAR
                </button>
                <button type="submit" className="flex-1 h-14 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="animate-spin" size={20}/> : "CONFIRMAR CADASTRO"}
                </button>
              </div>

            </form>
          </div>
        </dialog>
      )}
    </div>
  );
}