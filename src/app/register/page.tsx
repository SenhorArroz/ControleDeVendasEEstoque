"use client";

import Link from "next/link";
import { useState, ChangeEvent } from "react";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Camera,
  Loader2,
  Phone,
  FileText,
  Activity
} from "lucide-react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

// --- UPLOADTHING ---
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "~/server/api/uploadthing/core";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: () => {
      console.log("Upload concluído no cliente");
    },
    onUploadError: (e) => {
      console.error("Erro no UploadThing:", e);
      alert("Erro ao enviar imagem: " + e.message);
    },
  });

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    bio: "",
    imagePreview: null as string | null,
    imageFile: null as File | null,
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        imageFile: file,
        imagePreview: previewUrl,
      });
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.email || !formData.password)
        return alert("Preencha todos os campos obrigatórios!");
      if (formData.password !== formData.confirmPassword)
        return alert("As senhas não coincidem!");
      setStep(2);
    }
  };

  const registerMutation = api.auth.register.useMutation({
    onError: (error) => {
      setIsLoading(false);
      alert(error.message);
    },
    onSuccess: () => {
      alert("Conta criada com sucesso! Redirecionando...");
      router.push("/login");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let uploadedImageUrl = "";

      // 1. Se o usuário selecionou imagem, faz o upload primeiro
      if (formData.imageFile) {
        const uploadRes = await startUpload([formData.imageFile]);

        if (uploadRes && uploadRes[0]) {
          uploadedImageUrl = uploadRes[0].ufsUrl;
          console.log("Imagem salva em:", uploadedImageUrl);
        } else {
          throw new Error("Falha ao receber URL da imagem.");
        }
      }

      // 2. Registra o usuário no banco
      await registerMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone || undefined,
        bio: formData.bio || undefined,
        image: uploadedImageUrl || undefined,
      });
    } catch (error) {
      console.error("Erro no processo de registro:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center relative overflow-hidden font-sans p-4 py-20">
      
      {/* Ambient Background Glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

      {/* Back Button */}
      <div className="absolute top-8 left-8 z-20">
          <Link href={step === 1 ? "/login" : "#"} onClick={() => step === 2 && setStep(1)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-sm border border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors">
              <ArrowLeft size={16} />
              Voltar
          </Link>
      </div>

      <div className="w-full max-w-xl mx-auto relative z-10">
        
        {/* Branding / Logo */}
        <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/30 mb-4">
                <Activity size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Criar Conta</h1>
        </div>

        {/* Card do Formulário */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          
          {/* Indicador de Passos Customizado */}
          <div className="flex gap-2 mb-10">
            <div className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-center transition-all duration-500 ${step >= 1 ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-50 text-slate-400'}`}>
              1. Acesso
            </div>
            <div className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-center transition-all duration-500 ${step === 2 ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-50 text-slate-400'}`}>
              2. Perfil
            </div>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            
            {/* --- PASSO 1: DADOS DE ACESSO --- */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-300">
                
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1 block">Email *</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="seu@email.com"
                            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-800 outline-none placeholder:text-slate-300"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1 block">Senha *</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input
                            name="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary/10 transition-all font-black text-slate-800 tracking-widest outline-none placeholder:text-slate-300 placeholder:tracking-normal placeholder:font-bold"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1 block">Confirmar Senha *</label>
                    <div className="relative">
                        <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input
                            name="confirmPassword"
                            type="password"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary/10 transition-all font-black text-slate-800 tracking-widest outline-none placeholder:text-slate-300 placeholder:tracking-normal placeholder:font-bold"
                        />
                    </div>
                </div>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full h-14 mt-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                >
                  Continuar <ArrowRight size={18} />
                </button>
              </div>
            )}

            {/* --- PASSO 2: DADOS DO PERFIL --- */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                
                {/* Upload de Imagem Circular */}
                <div className="flex flex-col items-center justify-center mb-6">
                  <div className="relative group mx-auto cursor-pointer w-32 h-32">
                    <div className="w-full h-full rounded-[2.5rem] border-4 border-white shadow-xl shadow-slate-200/50 overflow-hidden bg-slate-50 flex items-center justify-center relative z-10 group-hover:border-primary/20 transition-all">
                      {formData.imagePreview ? (
                        <img
                          src={formData.imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera className="w-10 h-10 text-slate-300 group-hover:text-primary transition-colors" />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-slate-900/40 rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <span className="text-white text-[10px] font-black uppercase tracking-widest bg-black/60 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                        Alterar Foto
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                    />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-4">
                    Foto do Perfil (Opcional)
                  </span>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1 block">Nome Completo *</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Ex: João da Silva"
                            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-800 outline-none placeholder:text-slate-300"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1 block">Telefone / WhatsApp</label>
                    <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="(00) 00000-0000"
                            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-800 outline-none placeholder:text-slate-300"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1 block">Biografia</label>
                    <div className="relative">
                        <FileText className="absolute left-4 top-5 w-5 h-5 text-slate-300" />
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder="Conte um pouco sobre seu negócio..."
                            className="w-full min-h-[120px] pt-4 pl-12 pr-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary/10 transition-all font-medium text-slate-700 outline-none placeholder:text-slate-300 resize-none"
                        ></textarea>
                    </div>
                </div>

                <div className="flex gap-4 mt-6 pt-4 border-t border-slate-50">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 h-14 bg-slate-50 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors flex items-center justify-center"
                    disabled={isLoading}
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 h-14 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "FINALIZAR CADASTRO"}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Login Link */}
          <div className="text-center mt-10">
            <span className="text-xs font-bold text-slate-500">
                Já possui uma conta?{" "}
            </span>
            <Link
                href="/login"
                className="text-xs font-black uppercase tracking-widest text-primary hover:underline ml-1"
            >
                Fazer Login
            </Link>
          </div>

        </div>

        <div className="text-center mt-10 text-[10px] font-bold uppercase tracking-widest text-slate-300 animate-in fade-in duration-1000 delay-300">
            &copy; {new Date().getFullYear()} CashFlow Inc. Seguro e Criptografado.
        </div>

      </div>
    </div>
  );
}