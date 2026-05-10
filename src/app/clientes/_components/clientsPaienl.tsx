"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { 
  Search, Plus, Loader2, Users, Phone, MapPin, User, Menu, ChevronRight 
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

  return (
    <div className="drawer lg:drawer-open bg-[#F8FAFC] min-h-screen font-sans">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      
      <div className="drawer-content flex flex-col">
        {/* Mobile Navbar */}
        <div className="w-full navbar bg-white lg:hidden border-b border-slate-100 px-6">
          <label htmlFor="my-drawer-2" className="btn btn-ghost drawer-button lg:hidden">
            <Menu className="w-6 h-6" />
          </label>
          <div className="flex-1 font-black text-xl tracking-tighter">CASHFLOW</div>
        </div>

        <main className="p-6 md:p-12 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                <Users className="text-primary" size={36}/> Clientes
              </h1>
              <p className="text-slate-500 font-medium italic">Base de dados e histórico de relacionamento</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative group flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Pesquisar cliente..." 
                  className="input w-full md:w-80 pl-11 bg-white border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/5 transition-all font-semibold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button onClick={() => setIsModalOpen(true)} className="btn btn-primary rounded-2xl px-6 font-black shadow-lg shadow-primary/20 gap-2 border-none">
                <Plus size={20} /> ADICIONAR
              </button>
            </div>
          </div>

          {/* Tabela Section */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden transition-all hover:shadow-md">
            <div className="overflow-x-auto">
              <table className="table w-full border-separate border-spacing-0">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="py-6 pl-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-none">Informações Básicas</th>
                    <th className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-none">Status</th>
                    <th className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-none">LTV (Total Gasto)</th>
                    <th className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-none">Último Contato</th>
                    <th className="text-right pr-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-none">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    <tr><td colSpan={5} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-primary" size={32}/></td></tr>
                  ) : clients?.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-20 text-slate-400 font-bold italic">Nenhum cliente na base de dados.</td></tr>
                  ) : (
                    clients?.map((client) => (
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

      {/* MODAL REESTILIZADO */}
      {isModalOpen && (
        <dialog className="modal modal-open bg-slate-900/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300">
          <div className="modal-box w-11/12 max-w-xl rounded-[3rem] p-10 shadow-2xl border border-white">
            <div className="flex justify-between items-center border-b border-slate-100 pb-6 mb-8">
              <h3 className="font-black text-2xl tracking-tighter flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl text-primary"><User size={24}/></div>
                Novo Cadastro
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-ghost btn-circle btn-sm"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="form-control">
                <label className="label uppercase text-[10px] font-black text-slate-400 tracking-widest px-1">Nome Completo</label>
                <input type="text" required className="input input-bordered w-full rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold" 
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label uppercase text-[10px] font-black text-slate-400 tracking-widest px-1">Telefone / WhatsApp</label>
                  <input type="tel" className="input input-bordered w-full rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold" 
                    value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="form-control">
                  <label className="label uppercase text-[10px] font-black text-slate-400 tracking-widest px-1">Localização / Endereço</label>
                  <input type="text" className="input input-bordered w-full rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold" 
                    value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                </div>
              </div>

              <div className="pt-6">
                <button type="submit" className="btn btn-primary w-full h-14 rounded-2xl font-black shadow-xl shadow-primary/20 border-none" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="animate-spin" size={24}/> : "CONFIRMAR CADASTRO"}
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
}