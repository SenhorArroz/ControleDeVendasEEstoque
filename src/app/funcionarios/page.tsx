"use client";

import React, { useState } from 'react';
import { ArrowLeft, UserPlus, Users, Phone, User, Loader2, Mail, ShieldCheck, X } from 'lucide-react';
import { api } from '~/trpc/react';
import { useRouter } from 'next/navigation';

export default function FuncionariosPage() {
  const router = useRouter();
  const utils = api.useUtils();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  // 1. Busca de dados do banco
  const { data: funcionariosList, isLoading: isLoadingList } = api.auth.getAllFuncionarios.useQuery();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 2. Mutação para cadastrar
  const createMutation = api.auth.registerFuncionario.useMutation({
    onSuccess: async () => {
      await utils.auth.getAllFuncionarios.invalidate();
      setIsModalOpen(false);
      setFormData({ name: "", phone: "" });
    },
    onError: (error) => {
      alert(`Erro ao cadastrar: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createMutation.mutate({
      name: formData.name,
      phone: formData.phone,
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
      
      <main className="p-6 md:p-12 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-6xl mx-auto w-full">
        
        {/* ================= HEADER ================= */}
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 w-fit px-4 py-2 rounded-xl bg-white shadow-sm border border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={16} /> Dashboard
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-2">
            <div className="space-y-1">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                <ShieldCheck className="text-primary" size={36}/> Equipe
              </h1>
              <p className="text-slate-500 font-medium italic">Gerencie acessos e colaboradores do sistema.</p>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary rounded-2xl px-8 h-14 font-black shadow-xl shadow-primary/30 border-none gap-2 w-full md:w-auto hover:scale-[1.02] transition-transform"
            >
              <UserPlus size={20} /> NOVO COLABORADOR
            </button>
          </div>
        </div>

        {/* ================= CONTEÚDO PRINCIPAL (TABELA) ================= */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden transition-all hover:shadow-md">
          
          {/* Header da Tabela */}
          <div className="p-6 md:p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
            <h3 className="font-black text-slate-800 text-lg uppercase tracking-widest flex items-center gap-3">
              <Users className="text-primary w-5 h-5"/> Colaboradores Ativos
            </h3>
            <span className="px-3 py-1 bg-slate-200 text-slate-600 rounded-lg text-[10px] font-black">
              {funcionariosList?.length || 0} Reg
            </span>
          </div>

          <div className="overflow-x-auto p-4 md:p-6">
            <table className="table w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-none">
                  <th className="pl-6 py-4">Colaborador</th>
                  <th>Acesso / Contato</th>
                  <th>Senha Inicial</th>
                  <th className="text-right pr-6">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingList ? (
                  <tr>
                    <td colSpan={4} className="text-center py-20">
                      <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
                    </td>
                  </tr>
                ) : funcionariosList && funcionariosList.length > 0 ? (
                  funcionariosList.map((funcionario) => (
                    <tr key={funcionario.id} className="hover:bg-slate-50 transition-colors group">
                      
                      <td className="pl-6 py-4 rounded-l-2xl">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-inner shrink-0 border border-slate-200">
                            <span className="text-lg font-black">{funcionario.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <div className="font-black text-sm text-slate-800 tracking-tight">{funcionario.name}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Membro da Equipe</div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                            <Mail className="w-3.5 h-3.5 text-slate-400" /> {funcionario.email}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            <Phone className="w-3.5 h-3.5 text-slate-400" /> {funcionario.phone || "Não informado"}
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 tracking-widest">
                          {funcionario.phone.replace(/\D/g, '').replace("(", "").replace(")", "").replace("-", "").replace(" ", "") || "S/ Telefone"}
                        </span>
                      </td>

                      <td className="text-right pr-6 rounded-r-2xl">
                        <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border bg-emerald-50 text-emerald-600 border-emerald-100">
                          Ativo
                        </span>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-20 text-slate-400">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <Users size={32} className="text-slate-300" />
                      </div>
                      <p className="font-black text-lg text-slate-500 mb-1">Nenhum funcionário</p>
                      <p className="text-xs font-medium italic">Adicione seu primeiro colaborador clicando no botão acima.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ================= MODAL DE CADASTRO ================= */}
      {isModalOpen && (
        <dialog className="modal modal-open bg-slate-900/60 backdrop-blur-md z-[100] animate-in fade-in duration-300">
          <div className="modal-box w-11/12 max-w-lg p-10 rounded-[3rem] shadow-2xl border border-white bg-white">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-6 mb-8">
              <h3 className="font-black text-2xl tracking-tighter flex items-center gap-3 text-slate-900">
                <div className="p-2 bg-primary/10 rounded-xl text-primary"><UserPlus size={24}/></div>
                Novo Colaborador
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-ghost btn-circle btn-sm bg-slate-50 hover:bg-slate-200">
                <X size={20} className="text-slate-500"/>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="form-control w-full">
                <label className="label uppercase text-[10px] font-black text-slate-400 tracking-widest px-1">Nome Completo *</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    required
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    placeholder="Ex: Carlos Silva" 
                    className="input input-bordered w-full pl-12 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-800 h-14" 
                  />
                </div>
              </div>

              <div className="form-control w-full">
                <label className="label uppercase text-[10px] font-black text-slate-400 tracking-widest px-1">Telefone (Será a senha) *</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    required
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    placeholder="(00) 00000-0000" 
                    className="input input-bordered w-full pl-12 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-800 h-14" 
                  />
                </div>
              </div>

              <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl flex items-start gap-3 border border-blue-100">
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-[11px] font-bold leading-relaxed">
                  O sistema gerará um e-mail de acesso automático baseado no nome. A senha inicial será apenas os números do telefone.
                </p>
              </div>

              <div className="pt-6 flex gap-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-ghost flex-1 rounded-2xl font-black text-xs tracking-widest text-slate-500 hover:bg-slate-100 h-14"
                >
                  CANCELAR
                </button>
                <button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="btn btn-primary flex-1 rounded-2xl font-black text-xs tracking-widest shadow-xl shadow-primary/30 border-none h-14"
                >
                  {createMutation.isPending ? <Loader2 className="animate-spin w-5 h-5" /> : "CADASTRAR"}
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
}