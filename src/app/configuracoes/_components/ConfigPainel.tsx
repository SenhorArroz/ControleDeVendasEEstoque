"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail, Package, Users, TrendingUp, Camera, Calendar, ArrowLeft,
  Phone, User, Type, AlertTriangle, ShieldAlert, Save, Loader2
} from "lucide-react";

import { api } from "~/trpc/react";
import { uploadRegistrationImage } from "~/app/actions/upload";

// Tipagem dos dados que vêm do Pai (page.tsx)
type SettingsFormProps = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    phone?: string | null;
    bio?: string | null;
    createdAt?: Date | string;
  };
  stats: {
    clients: number;
    products: number;
    sales: number;
  };
};

export function SettingsForm({ user, stats }: SettingsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Inicializa o estado com os dados vindos do banco
  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    bio: user.bio || "",
    imagePreview: user.image || null,
    imageFile: null as File | null,
  });

  const deleteMutation = api.auth.deleteUser.useMutation({
    onError: (error) => {
      alert(error.message);
      setIsLoading(false);
    },
    onSuccess: () => {
      setIsLoading(false);
      router.push("/"); // Vai para a tela inicial / login
    },
  });

  const updateMutation = api.auth.updateUser.useMutation({
    onError: (error) => {
      alert(error.message);
      setIsLoading(false);
    },
    onSuccess: () => {
      setIsLoading(false);
      router.refresh(); 
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let uploadedImageUrl = formData.imagePreview;

      // PASSO A: Se tiver NOVO arquivo, faz upload
      if (formData.imageFile) {
        const data = new FormData();
        data.append("image", formData.imageFile);

        const uploadRes = await uploadRegistrationImage(data);
        if (uploadRes && uploadRes.success) {
          uploadedImageUrl = uploadRes.url;
        }
      }

      // PASSO B: Chama o backend
      await updateMutation.mutateAsync({
        name: formData.name,
        phone: formData.phone || undefined,
        bio: formData.bio || undefined,
        image: uploadedImageUrl || undefined,
      });
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Ocorreu um erro ao salvar.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({
        ...formData,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      });
    }
  };

  return (
    <div className="w-full py-5 max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700 font-sans text-slate-900">
      
      {/* HEADER */}
      <div className="flex flex-col gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 w-fit px-4 py-2 rounded-xl bg-white shadow-sm border border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={16} /> Voltar
        </Link>
        <div>
          <h1 className="text-4xl font-black tracking-tight">Configurações da Conta</h1>
          <p className="text-slate-500 font-medium italic mt-1">
            Gerencie suas informações pessoais, biografia e segurança.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* ================= COLUNA ESQUERDA: PERFIL ================= */}
        <div className="lg:col-span-1 space-y-8 sticky top-10">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden relative">
            {/* Decoração Gradient */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent z-0"></div>
            
            <div className="p-8 relative z-10 flex flex-col items-center text-center mt-4">
              
              {/* Avatar Upload Interativo */}
              <div className="relative group cursor-pointer mb-6">
                <div className="w-36 h-36 rounded-[2rem] bg-white p-2 shadow-xl shadow-slate-200/50">
                  <div className="w-full h-full rounded-[1.5rem] bg-slate-100 overflow-hidden relative">
                    <img
                      src={formData.imagePreview || "/placeholder-user.jpg"}
                      alt="Avatar"
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Overlay Escuro no Hover */}
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera size={28} className="text-white" />
                    </div>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
              </div>

              <h2 className="text-2xl font-black tracking-tight">{user.name}</h2>
              <div className="flex items-center justify-center gap-1.5 mt-2 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full">
                <Calendar size={14} className="text-primary" /> Membro Ativo
              </div>

              <div className="w-full h-px bg-slate-100 my-8"></div>

              {/* Informações Resumo */}
              <div className="w-full space-y-3">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl text-left">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary shrink-0">
                    <Mail size={18} />
                  </div>
                  <div className="overflow-hidden min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">E-mail de Acesso</p>
                    <p className="font-bold text-sm text-slate-700 truncate" title={user.email || ""}>{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl text-left">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-secondary shrink-0">
                    <Phone size={18} />
                  </div>
                  <div className="overflow-hidden min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Telefone Contato</p>
                    <p className="font-bold text-sm text-slate-700 truncate">{formData.phone || "Não informado"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= COLUNA DIREITA: STATS & FORMS ================= */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* STATS RÁPIDOS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Clientes", val: stats.clients, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
              { label: "Produtos", val: stats.products, icon: Package, color: "text-purple-500", bg: "bg-purple-50" },
              { label: "Vendas", val: stats.sales, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-50 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-800">{stat.val}</p>
                </div>
              </div>
            ))}
          </div>

          {/* FORMULÁRIO DE EDIÇÃO */}
          <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-50 p-8 md:p-10">
            <h3 className="font-black text-xl mb-8 flex items-center gap-3 text-slate-800 uppercase tracking-widest">
              <div className="p-2 bg-primary/10 rounded-xl text-primary"><User size={20} /></div>
              Dados do Perfil
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2 md:col-span-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1">Nome de Exibição</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="text"
                    required
                    className="w-full h-14 pl-12 pr-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1">Celular / WhatsApp</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="tel"
                    className="w-full h-14 pl-12 pr-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <div className="flex justify-between items-end px-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Bio / Sobre mim</label>
                  <span className="text-[10px] font-bold text-slate-300">{formData.bio?.length || 0}/200</span>
                </div>
                <div className="relative">
                  <textarea
                    className="w-full h-32 p-5 bg-slate-50 border-none rounded-2xl font-medium text-slate-700 focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none"
                    placeholder="Escreva algo sobre você ou seu negócio..."
                    maxLength={200}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  ></textarea>
                  <Type size={18} className="absolute top-5 right-5 text-slate-300" />
                </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-50 flex flex-col sm:flex-row justify-end gap-4">
              <button
                type="button"
                className="py-4 px-8 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Descartar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="py-4 px-8 rounded-2xl font-black text-xs uppercase tracking-widest text-white bg-primary shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> SALVAR ALTERAÇÕES</>}
              </button>
            </div>
          </form>

          {/* ================= ZONA DE PERIGO ================= */}
          <div className="bg-white rounded-[2.5rem] border border-rose-100 p-8 md:p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-rose-500"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h3 className="text-xl font-black flex items-center gap-3 text-rose-600 tracking-tight">
                  <div className="p-2 bg-rose-100 rounded-xl"><AlertTriangle size={20} /></div>
                  Zona de Perigo
                </h3>
                <p className="text-sm font-medium text-slate-500 mt-2 max-w-md leading-relaxed">
                  Ao excluir sua conta, você perderá permanentemente o acesso ao sistema, relatórios, clientes e inventário.
                </p>
              </div>
              <button
                type="button"
                className="py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-500 hover:text-white transition-all shrink-0 flex items-center gap-2"
                onClick={() => (document.getElementById("delete_modal") as HTMLDialogElement).showModal()}
              >
                <ShieldAlert size={16} /> Excluir Conta
              </button>
            </div>

            {/* MODAL DE EXCLUSÃO */}
            <dialog id="delete_modal" className="modal bg-slate-900/60 backdrop-blur-md">
              <div className="modal-box p-0 overflow-hidden bg-white rounded-[3rem] shadow-2xl max-w-md border border-rose-100 text-center">
                <div className="h-3 w-full bg-rose-500" />
                
                <div className="p-10">
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-rose-50 border-8 border-white shadow-xl">
                    <AlertTriangle size={40} className="text-rose-500" />
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Tem certeza absoluta?</h3>
                  <p className="text-slate-500 font-medium text-sm mb-8">Esta ação excluirá permanentemente sua conta e todos os dados associados. Não pode ser desfeita.</p>

                  <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 mb-8 text-left flex gap-4">
                    <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black text-[10px] uppercase tracking-widest text-rose-600 block mb-2">O que será perdido:</span>
                      <ul className="list-disc list-inside text-slate-600 font-medium space-y-1 text-xs">
                        <li>Todos os clientes cadastrados.</li>
                        <li>Histórico financeiro e relatórios.</li>
                        <li>Acesso imediato ao painel.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      className="py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white bg-rose-500 shadow-xl shadow-rose-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                      onClick={() => deleteMutation.mutate()}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : "SIM, EXCLUIR MINHA CONTA"}
                    </button>
                    <form method="dialog">
                      <button className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors">
                        Cancelar, Quero Ficar
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </dialog>
          </div>
        </div>
      </div>
    </div>
  );
}