"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "~/trpc/react"; 
import { Mail, ArrowLeft, CheckCircle2, Loader2, Activity } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const forgotMutation = api.auth.forgotPassword.useMutation({
    onSuccess: () => setIsSubmitted(true),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    forgotMutation.mutate({ email });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center relative overflow-hidden font-sans p-4">
      
      {/* Ambient Background Glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

      {/* Back Button */}
      <div className="absolute top-8 left-8 z-20">
          <Link href="/login" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-sm border border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors">
              <ArrowLeft size={16} />
              Voltar ao Login
          </Link>
      </div>

      <div className="w-full max-w-md mx-auto relative z-10">
        
        {/* Branding / Logo */}
        <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/30 mb-4">
                <Activity size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">CashFlow</h1>
        </div>

        {/* Recovery Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          
          {!isSubmitted ? (
            <>
              <div className="text-center mb-8">
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Recuperar Conta</h2>
                  <p className="text-sm font-medium text-slate-500 mt-2 leading-relaxed">
                      Digite o endereço de e-mail associado à sua conta para receber um link de redefinição de senha.
                  </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Email Input */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Seu E-mail</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-800 outline-none placeholder:text-slate-300"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={forgotMutation.isPending}
                    className="w-full h-14 mt-2 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                    {forgotMutation.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        "ENVIAR LINK DE RECUPERAÇÃO"
                    )}
                </button>

              </form>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-6 animate-in fade-in zoom-in duration-300">
              <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-100">
                <CheckCircle2 size={48} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-3">Email Enviado!</h3>
              <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed px-4">
                Se um cadastro existir com o endereço <span className="font-bold text-slate-700">{email}</span>, você receberá as instruções em instantes.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/70 transition-colors"
              >
                TENTAR OUTRO E-MAIL
              </button>
            </div>
          )}

        </div>

        <div className="text-center mt-10 text-[10px] font-bold uppercase tracking-widest text-slate-300 animate-in fade-in duration-1000 delay-300">
            &copy; {new Date().getFullYear()} CashFlow Inc. Seguro e Criptografado.
        </div>

      </div>
    </div>
  );
}