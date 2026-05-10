"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "~/trpc/react"; 
import { Lock, KeyRound, ArrowRight, Loader2, AlertCircle, Activity } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const resetMutation = api.auth.resetPassword.useMutation({
    onSuccess: () => {
      router.push("/login?reset=success");
      router.refresh();
    },
    onError: (e) => setError(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (!params?.token) {
      setError("Token inválido ou expirado.");
      return;
    }

    resetMutation.mutate({
      token: params.token as string,
      password,
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center relative overflow-hidden font-sans p-4">
      
      {/* Ambient Background Glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/10 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md mx-auto relative z-10">
        
        {/* Branding / Logo */}
        <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/30 mb-4">
                <Activity size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">CashFlow</h1>
        </div>

        {/* Reset Password Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            
            <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Nova Senha</h2>
                <p className="text-sm font-medium text-slate-500 mt-2 leading-relaxed">
                    Crie uma senha forte e segura para proteger o seu acesso ao sistema.
                </p>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 mb-6 animate-in fade-in zoom-in duration-300">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Campo Nova Senha */}
              <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Nova Senha</label>
                  <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input
                          type="password"
                          required
                          minLength={8}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary/10 transition-all font-black text-slate-800 tracking-widest outline-none placeholder:text-slate-300 placeholder:tracking-normal placeholder:font-bold"
                      />
                  </div>
              </div>

              {/* Campo Confirmar Senha */}
              <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Confirmar Senha</label>
                  <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary/10 transition-all font-black text-slate-800 tracking-widest outline-none placeholder:text-slate-300 placeholder:tracking-normal placeholder:font-bold"
                      />
                  </div>
              </div>

              {/* Submit Button */}
              <button
                  type="submit"
                  disabled={resetMutation.isPending}
                  className="w-full h-14 mt-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                  {resetMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                      <>
                          ALTERAR SENHA <ArrowRight className="w-4 h-4" />
                      </>
                  )}
              </button>

            </form>
        </div>

        <div className="text-center mt-10 text-[10px] font-bold uppercase tracking-widest text-slate-300 animate-in fade-in duration-1000 delay-300">
            &copy; {new Date().getFullYear()} CashFlow Inc. Seguro e Criptografado.
        </div>

      </div>
    </div>
  );
}