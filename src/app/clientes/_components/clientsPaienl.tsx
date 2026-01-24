"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { 
  Search, Plus, Loader2, Users, Phone, MapPin, User, Menu 
} from "lucide-react";

import SideBar from "../../_components/SideBar"; 
import { ClienteRow } from "../../_components/ClienteTableComponent"; // Importe o componente que criamos acima

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({ name: "", phone: "", address: "" });

  const { data: clients, isLoading, refetch } = api.cliente.getAll.useQuery({ search: searchTerm });

  const createMutation = api.cliente.create.useMutation({
    onSuccess: () => {
      alert("Cliente cadastrado!");
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
    <div className="drawer lg:drawer-open bg-base-200 min-h-screen">
      
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      
      {/* CONTEÚDO */}
      <div className="drawer-content flex flex-col">
        
        {/* Menu Mobile */}
        <div className="w-full navbar bg-base-100 lg:hidden shadow-sm mb-4">
            <div className="flex-none">
                <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost">
                    <Menu className="w-6 h-6" />
                </label>
            </div>
            <div className="flex-1 px-2 mx-2 font-bold text-lg">CashFlow</div>
        </div>

        <main className="p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
            
            {/* Header da Página */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Users className="text-primary"/> Meus Clientes
                    </h1>
                    <p className="text-base-content/60">Gerencie sua carteira de clientes.</p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-base-content/50" />
                        <input 
                            type="text" 
                            placeholder="Buscar..." 
                            className="input input-bordered w-full pl-10 bg-base-100 focus:input-primary"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="btn btn-primary gap-2 shadow-lg">
                        <Plus size={18} /> <span className="hidden sm:inline">Novo Cliente</span>
                    </button>
                </div>
            </div>

            {/* TABELA DE CLIENTES */}
            <div className="card bg-base-100 shadow-xl border border-base-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        {/* Cabeçalho Atualizado para combinar com o ClienteRow */}
                        <thead>
                            <tr className="bg-base-200/50 text-sm uppercase text-base-content/70">
                                <th className="py-4 pl-6">Cliente</th>
                                <th>Status</th>
                                <th>Total Gasto</th>
                                <th>Última Compra</th>
                                <th className="text-right pr-6">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Loading */}
                            {isLoading && (
                                <tr><td colSpan={5} className="text-center py-10"><Loader2 className="animate-spin mx-auto"/></td></tr>
                            )}
                            
                            {/* Vazio */}
                            {!isLoading && clients?.length === 0 && (
                                <tr><td colSpan={5} className="text-center py-10 text-base-content/50">Nenhum cliente encontrado.</td></tr>
                            )}
                            
                            {/* Linhas (Usando o novo componente) */}
                            {clients?.map((client) => (
                                <ClienteRow key={client.id} client={client} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
      </div> 

      {/* SIDEBAR */}
      <SideBar />

      {/* MODAL DE CADASTRO */}
      {isModalOpen && (
        <dialog className="modal modal-open bg-black/50 backdrop-blur-sm z-50">
          <div className="modal-box w-11/12 max-w-lg">
            <h3 className="font-bold text-xl flex items-center gap-2 border-b border-base-200 pb-3 mb-4">
              <User className="text-primary"/> Adicionar Cliente
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="form-control">
                <label className="label font-medium"><span className="label-text">Nome *</span></label>
                <div className="relative">
                    <User className="absolute left-3 top-3.5 w-4 h-4 text-base-content/40" />
                    <input type="text" required autoFocus className="input input-bordered w-full pl-10" 
                        value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label font-medium"><span className="label-text">Telefone</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-4 h-4 text-base-content/40" />
                    <input type="tel" className="input input-bordered w-full pl-10" 
                        value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>
                <div className="form-control">
                  <label className="label font-medium"><span className="label-text">Endereço</span></label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-base-content/40" />
                    <input type="text" className="input input-bordered w-full pl-10" 
                        value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="modal-action pt-4">
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="animate-spin" size={18}/> : <Plus size={18}/>} Salvar
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
}