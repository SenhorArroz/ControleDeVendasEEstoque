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
} from "lucide-react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

// --- UPLOADTHING ---
import { generateReactHelpers } from "@uploadthing/react";
// Importando o tipo do roteador lá da pasta do servidor (T3 Stack)
import type { OurFileRouter } from "~/server/api/uploadthing/core";

// Gera o hook usando a tipagem do seu backend
const { useUploadThing } = generateReactHelpers<OurFileRouter>();

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Inicializa o upload apontando para o endpoint "imageUploader"
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
        return alert("Preencha todos os campos!");
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
      alert("Conta criada! Redirecionando...");
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
        // Envia o arquivo para o UploadThing
        const uploadRes = await startUpload([formData.imageFile]);

        // Verifica se deu certo e pega a URL
        if (uploadRes && uploadRes[0]) {
          uploadedImageUrl = uploadRes[0].ufsUrl;
          console.log("Imagem salva em:", uploadedImageUrl);
        } else {
          throw new Error("Falha ao receber URL da imagem.");
        }
      }

      // 2. Registra o usuário no banco com a URL da imagem (se houver)
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
      // O alert já é chamado no onError do upload ou do mutation, 
      // mas garantimos aqui caso seja um erro genérico
      if (error instanceof Error && error.message !== "Falha ao receber URL da imagem.") {
         // Evita alert duplo se o erro veio do startUpload
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-base-200 relative overflow-hidden px-4 py-12 font-sans">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px] opacity-40 animate-pulse pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-secondary/20 blur-[100px] opacity-30 pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        <div className="card bg-base-100/80 shadow-2xl backdrop-blur-xl border border-white/20">
          <div className="card-body p-6 sm:p-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold tracking-tight">
                Crie sua conta
              </h2>
              <p className="text-base-content/60 text-sm mt-2">
                Junte-se ao{" "}
                <span className="text-primary font-bold">CashFlow</span>
              </p>
            </div>

            <ul className="steps w-full mb-8">
              <li className={`step ${step >= 1 ? "step-primary" : ""} text-sm`}>
                Login
              </li>
              <li className={`step ${step >= 2 ? "step-primary" : ""} text-sm`}>
                Perfil
              </li>
            </ul>

            <form onSubmit={handleSubmit} className="w-full">
              {/* --- PASSO 1 --- */}
              {step === 1 && (
                <div className="flex flex-col items-center gap-5 animate-in fade-in slide-in-from-right-8 duration-300">
                  <div className="form-control flex flex-col gap-2 items-center w-full">
                    <label className="label pt-0">
                      <span className="label-text font-medium">Email</span>
                    </label>
                    <label className="input input-bordered w-full rounded-2xl flex items-center gap-2 bg-base-200/50 focus-within:bg-base-100 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                      <Mail className="w-4 h-4 opacity-50" />
                      <input
                        name="email"
                        type="email"
                        placeholder="voce@email.com"
                        className="grow placeholder:text-base-content/30"
                        value={formData.email}
                        onChange={handleChange}
                        autoFocus
                      />
                    </label>
                  </div>

                  <div className="form-control flex flex-col gap-2 items-center w-full">
                    <label className="label pt-0">
                      <span className="label-text font-medium">Senha</span>
                    </label>
                    <label className="input input-bordered w-full rounded-2xl flex items-center gap-2 bg-base-200/50 focus-within:bg-base-100 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                      <Lock className="w-4 h-4 opacity-50" />
                      <input
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className="grow placeholder:text-base-content/30"
                        value={formData.password}
                        onChange={handleChange}
                      />
                    </label>
                  </div>

                  <div className="form-control flex flex-col gap-2 items-center w-full">
                    <label className="label pt-0">
                      <span className="label-text font-medium">
                        Confirmar Senha
                      </span>
                    </label>
                    <label className="input input-bordered w-full rounded-2xl flex items-center gap-2 bg-base-200/50 focus-within:bg-base-100 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                      <CheckCircle2 className="w-4 h-4 opacity-50" />
                      <input
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        className="grow placeholder:text-base-content/30"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="btn btn-primary w-full mt-2 text-lg font-bold shadow-lg rounded-full shadow-primary/20"
                  >
                    Continuar <ArrowRight className="w-5 h-5 ml-1" />
                  </button>
                </div>
              )}

              {/* --- PASSO 2 --- */}
              {step === 2 && (
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-8 duration-300">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="relative group mx-auto cursor-pointer">
                      <div className="w-32 h-32 rounded-full border-4 border-base-100 shadow-xl overflow-hidden bg-base-200 flex items-center justify-center relative z-10">
                        {formData.imagePreview ? (
                          <img
                            src={formData.imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-14 h-14 text-base-content/20" />
                        )}
                      </div>
                      <div className="absolute bottom-0 right-0 z-20 bg-primary text-white p-2 rounded-full shadow-lg border-2 border-base-100 group-hover:scale-110 transition-transform">
                        <Camera className="w-5 h-5" />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30 rounded-full"
                      />
                    </div>
                    <span className="text-sm font-medium text-base-content/60">
                      Foto de perfil (opcional)
                    </span>
                  </div>

                  <div className="form-control flex flex-col gap-2 items-center w-full">
                    <label className="label pt-0">
                      <span className="label-text font-medium">Seu Nome</span>
                    </label>
                    <label className="input input-bordered w-full rounded-2xl flex items-center gap-2 bg-base-200/50 focus-within:bg-base-100 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                      <User className="w-4 h-4 opacity-50" />
                      <input
                        name="name"
                        type="text"
                        placeholder="Ex: João Silva"
                        className="grow placeholder:text-base-content/30"
                        value={formData.name}
                        onChange={handleChange}
                        autoFocus
                      />
                    </label>
                  </div>

                  <div className="form-control flex flex-col gap-2 items-center w-full">
                    <label className="label pt-0">
                      <span className="label-text font-medium">
                        Telefone / WhatsApp
                      </span>
                    </label>
                    <label className="input input-bordered w-full rounded-2xl flex items-center gap-2 bg-base-200/50 focus-within:bg-base-100 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                      <Phone className="w-4 h-4 opacity-50" />
                      <input
                        name="phone"
                        type="tel"
                        placeholder="(00) 00000-0000"
                        className="grow placeholder:text-base-content/30"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </label>
                  </div>

                  <div className="form-control flex flex-col gap-2 items-center w-full">
                    <label className="label pt-0">
                      <span className="label-text font-medium">Bio</span>
                    </label>
                    <div className="w-full relative">
                      <FileText className="w-4 h-4 opacity-50 absolute top-3 left-3" />
                      <textarea
                        name="bio"
                        placeholder="Conte um pouco sobre você..."
                        className="textarea textarea-bordered w-full rounded-2xl pl-10 bg-base-200/50 focus:bg-base-100 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        rows={3}
                        value={formData.bio}
                        onChange={handleChange}
                      ></textarea>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="btn btn-ghost flex-1 rounded-2xl border-base-content/10"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn btn-primary flex-[2] rounded-2xl shadow-lg shadow-primary/20"
                    >
                      {isLoading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        "Finalizar Cadastro"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>

            <div className="divider text-xs text-base-content/30 mt-8 mb-2">
              Já tem conta?
            </div>
            <div className="text-center">
              <Link
                href="/login"
                className="btn btn-link btn-sm no-underline hover:no-underline text-primary"
              >
                Fazer Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}