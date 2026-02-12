"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "~/trpc/react"; 
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

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
    <div className="min-h-screen bg-base-200 font-sans text-base-content selection:bg-primary selection:text-primary-content relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Blobs (Igual à Home) */}
      <div className="absolute top-0 left-1/2 -z-10 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px] opacity-40 animate-pulse" />
      <div className="absolute bottom-0 right-0 -z-10 w-[600px] h-[600px] rounded-full bg-secondary/20 blur-[100px] opacity-30" />

      <div className="w-full max-w-md">
        <div className="mockup-window border border-base-content/10 bg-base-100/80 shadow-2xl backdrop-blur-xl">
          <div className="border-t border-base-content/10 bg-base-200/30 p-8 md:p-10">
            
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-black tracking-tight mb-2">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Recuperar Conta
                </span>
              </h1>
              <p className="text-base-content/70 text-sm">
                Digite seu email para receber o link de redefinição.
              </p>
            </div>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Email</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      type="email"
                      placeholder="seu@email.com"
                      className="input input-bordered w-full pl-10 bg-base-100 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotMutation.isPending}
                  className="btn btn-primary w-full shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300"
                >
                  {forgotMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Enviar Link de Recuperação"
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-4 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Email Enviado!</h3>
                <p className="text-base-content/70 text-sm mb-6">
                  Se um cadastro existir com este email, você receberá as instruções em instantes.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="btn btn-ghost btn-sm text-primary"
                >
                  Tentar outro email
                </button>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-base-content/10 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-base-content/60 hover:text-primary transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Voltar para o Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}