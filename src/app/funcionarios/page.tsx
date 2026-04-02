"use client";

import React, { useState } from 'react';
import { ArrowLeft, UserPlus, Users, Phone, User, Loader2 } from 'lucide-react';
import { api } from '~/trpc/react';
import { useRouter } from 'next/navigation';

export default function FuncionariosPage() {
  const router = useRouter();
  const utils = api.useUtils(); // Para atualizar a lista sem refresh de página
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  // 1. Busca de dados do banco
  const { data: funcionariosList, isLoading: isLoadingList } = api.auth.getAllFuncionarios.useQuery();
  console.log(funcionariosList)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 2. Mutação para cadastrar
  const createMutation = api.auth.registerFuncionario.useMutation({
    onSuccess: async () => {
      // Atualiza a lista de funcionários no cache local
      await utils.auth.getAllFuncionarios.invalidate();
      
      const modal = document.getElementById('modal_cadastro') as HTMLDialogElement;
      modal?.close();
      
      setFormData({ name: "", phone: "" });
      alert("Funcionário cadastrado com sucesso!");
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
    <div className="min-h-screen bg-[#F9FAFB] p-8 text-gray-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button 
              onClick={() => router.push('/dashboard')}
              className="flex items-center text-gray-500 hover:text-[#4F46E5] transition-colors mb-2 text-sm font-medium"
            >
              <ArrowLeft size={18} className="mr-2" />
              Voltar para Dashboard
            </button>
            <h1 className="text-3xl font-bold">Gerenciar Equipe</h1>
            <p className="text-gray-500">Visualize e cadastre os colaboradores do sistema.</p>
          </div>

          <button 
            onClick={() => (document.getElementById('modal_cadastro') as HTMLDialogElement).showModal()}
            className="flex items-center justify-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md active:scale-95"
          >
            <UserPlus size={20} />
            Novo Funcionário
          </button>
        </div>

        {/* Conteúdo Principal */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoadingList ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="animate-spin text-[#4F46E5]" size={40} />
            </div>
          ) : funcionariosList && funcionariosList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead className="bg-gray-50">
                  <tr className="text-gray-600 uppercase text-[10px] tracking-wider">
                    <th className="py-4 px-6">Nome</th>
                    <th>Email</th>
                    <th>Telefone</th>
                    <th>Senha</th>
                    <th className="text-right px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {funcionariosList.map((funcionario) => (
                    <tr key={funcionario.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 font-medium text-gray-900">{funcionario.name}</td>
                      <td className="text-gray-600">{funcionario.email}</td>
                      <td className="text-gray-600">{funcionario.phone || "-"}</td>
                      <td className="text-gray-600">{funcionario.phone.replace(/\D/g, '').replace("(", "").replace(")", "").replace("-", "").replace(" ", "") || "-"}</td>
                      <td className="text-right px-6">
                        <span className="badge badge-ghost badge-sm py-3 px-3">Ativo</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center px-4">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-[#4F46E5] mb-4">
                <Users size={40} />
              </div>
              <h3 className="text-xl font-bold">Nenhum funcionário cadastrado</h3>
              <p className="text-gray-500 max-w-xs mt-2">
                Clique no botão acima para adicionar seu primeiro colaborador.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Cadastro */}
      <dialog id="modal_cadastro" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box bg-white p-8">
          <h3 className="font-bold text-2xl mb-6">Novo Colaborador</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4"> 
            <div className="form-control w-full">
              <label className="label font-medium text-gray-700">Nome Completo</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <User size={18} />
                </span>
                <input 
                  required
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  placeholder="Nome do funcionário" 
                  className="input input-bordered w-full pl-10 focus:outline-[#4F46E5]" 
                />
              </div>
            </div>

            <div className="form-control w-full">
              <label className="label font-medium text-gray-700">Telefone</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Phone size={18} />
                </span>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  placeholder="(00) 00000-0000" 
                  className="input input-bordered w-full pl-10 focus:outline-[#4F46E5]" 
                />
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <p className="text-[11px] text-blue-700 leading-tight">
                <strong>Nota:</strong> O sistema gerará um e-mail automático baseado no nome fornecido para o primeiro acesso.
              </p>
            </div>

            <div className="modal-action mt-8 flex gap-3">
              <button 
                type="button"
                onClick={() => (document.getElementById('modal_cadastro') as HTMLDialogElement).close()}
                className="btn btn-ghost flex-1"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={createMutation.isPending}
                className="btn bg-[#4F46E5] hover:bg-[#4338CA] text-white flex-1 border-none"
              >
                {createMutation.isPending ? <Loader2 className="animate-spin" /> : "Salvar Cadastro"}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
}