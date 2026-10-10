"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { 
  Search, Plus, Loader2, Users, Phone, MapPin, User, Activity, X 
} from "lucide-react";

import SideBar from "../../_components/SideBar"; 
import { ClienteRow } from "../../_components/ClienteTableComponent";

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [clientFilter, setClientFilter] = useState<"all" | "pending">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", address: "" });

  const { data: clients, isLoading, refetch } = api.cliente.getAll.useQuery({
    search: searchTerm,
    pendingPurchases: clientFilter === "pending",
  });

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
    <div className="drawer lg:drawer-open bg-slate-50 min-h-screen font-sans text-slate-900 selection:bg-orange-600/20">
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
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 sm:gap-6 mt-1 sm:mt-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                  <Users className="text-orange-600" size={32}/> Clientes
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium italic mt-2">Base de dados e histórico de relacionamento.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto">
                <div className="relative group w-full md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Pesquisar cliente..." 
                    className="w-full h-10 sm:h-12 pl-10 sm:pl-12 pr-4 bg-white border border-slate-200 rounded-xl sm:rounded-2xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-bold text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 placeholder:font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)} 
                  className="flex items-center justify-center gap-2 bg-gradient-to-br from-orange-500 to-orange-600 text-white px-6 sm:px-8 h-10 sm:h-12 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-[0_8px_25px_rgba(234,88,12,0.3)] hover:shadow-[0_8px_30px_rgba(234,88,12,0.4)] hover:-translate-y-0.5 border-none w-full sm:w-auto transition-all"
                >
                  <Plus size={18} strokeWidth={2.5} /> Adicionar
                </button>
              </div>
            </div>
          </div>

          <div className="flex w-full items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 sm:w-fit" role="group" aria-label="Filtrar clientes por pendências">
            <button
              type="button"
              onClick={() => setClientFilter("all")}
              aria-pressed={clientFilter === "all"}
              className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 sm:flex-none ${clientFilter === "all" ? "bg-orange-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setClientFilter("pending")}
              aria-pressed={clientFilter === "pending"}
              className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 sm:flex-none ${clientFilter === "pending" ? "bg-amber-500 text-white shadow-sm" : "text-amber-700 hover:bg-amber-50 hover:text-amber-800"}`}
            >
              Com pendência
            </button>
          </div>

          {/* ================= TABELA ================= */}
          <div className="bg-white rounded-2xl sm:rounded-[2rem] shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden flex flex-col min-w-0">
            <div className="w-full overflow-x-auto custom-scrollbar p-2 sm:p-4">
              <table className="w-full min-w-[800px] text-left">
                <thead>
                  <tr className="text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                    <th className="pl-4 sm:pl-6 py-4">Informações Básicas</th>
                    <th className="px-3 py-4">Status</th>
                    <th className="px-3 py-4">LTV (Total Gasto)</th>
                    <th className="px-3 py-4">Último Contato</th>
                    <th className="text-right pr-4 sm:pr-6 py-4">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 sm:py-20">
                        <Loader2 className="animate-spin mx-auto text-orange-600" size={32}/>
                      </td>
                    </tr>
                  ) : sortedClients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 sm:py-20">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-slate-300" />
                          </div>
                          <p className="font-bold text-xs sm:text-sm">
                            {clientFilter === "pending"
                              ? "Nenhum cliente com compra pendente encontrado."
                              : searchTerm ? "Nenhum cliente encontrado para esta busca." : "Nenhum cliente na base de dados."}
                          </p>
                        </div>
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

      {/* ================= MODAL DE CRIAÇÃO ================= */}
      {isModalOpen && (
        <dialog className="modal modal-open bg-slate-900/40 backdrop-blur-sm z-[100] animate-in fade-in duration-200" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="modal-box w-11/12 max-w-lg p-0 rounded-[2rem] shadow-2xl border border-white bg-slate-50 flex flex-col max-h-[90vh] overflow-hidden cursor-default">
            
            <div className="bg-white px-6 sm:px-8 py-5 flex justify-between items-center border-b border-slate-100 z-10 sticky top-0">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2.5 bg-orange-50 rounded-xl">
                    <User className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="font-black text-xl sm:text-2xl text-slate-800 tracking-tight">Novo Cadastro</h3>
                </div>
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 text-slate-400 transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>
            
            <form onSubmit={handleCreate} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto p-4 sm:p-5 flex-1 custom-scrollbar space-y-6">
                
                <div className="bg-white p-5 sm:p-6 rounded-[1.5rem] shadow-[0_2px_15px_rgb(0,0,0,0.02)] border border-slate-100 space-y-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">Nome Completo <span className="text-orange-600">*</span></label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
                      <input 
                        type="text" 
                        required 
                        className="w-full rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-800 h-10 sm:h-12 pl-10 sm:pl-12 pr-4 transition-all text-xs sm:text-sm"
                        placeholder="Ex: Maria Oliveira"
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">Telefone / WhatsApp</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
                        <input 
                          type="tel" 
                          className="w-full rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-800 h-10 sm:h-12 pl-10 sm:pl-12 pr-4 transition-all text-xs sm:text-sm"
                          placeholder="(00) 00000-0000"
                          value={formData.phone} 
                          onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="uppercase text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest pl-1">Localização / Endereço</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
                        <input 
                          type="text" 
                          className="w-full rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-800 h-10 sm:h-12 pl-10 sm:pl-12 pr-4 transition-all text-xs sm:text-sm"
                          placeholder="Ex: São Paulo, SP"
                          value={formData.address} 
                          onChange={(e) => setFormData({...formData, address: e.target.value})} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              
              <div className="bg-white px-6 sm:px-8 py-4 sm:py-5 flex justify-end gap-3 sm:gap-4 border-t border-slate-100 z-10 sticky bottom-0 shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex items-center justify-center px-6 sm:px-8 h-10 sm:h-12 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 transition-colors" disabled={createMutation.isPending}>
                  Cancelar
                </button>
                <button type="submit" className="flex items-center justify-center px-8 sm:px-10 h-10 sm:h-12 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-[0_8px_20px_rgba(234,88,12,0.3)] hover:shadow-[0_8px_25px_rgba(234,88,12,0.4)] hover:-translate-y-0.5 border-none transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[0_8px_20px_rgba(234,88,12,0.3)]" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" /> : "Confirmar Cadastro"}
                </button>
              </div>

            </form>
          </div>
        </dialog>
      )}
    </div>
  );
}
