"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "~/trpc/react"; // Verifique seu import do tRPC
import { Lock, KeyRound, ArrowRight, Loader2, AlertCircle } from "lucide-react";

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
      setError("Token inválido.");
      return;
    }

    resetMutation.mutate({
      token: params.token,
      password,
    });
  };

  return (
    <div className="min-h-screen bg-base-200 font-sans text-base-content selection:bg-primary selection:text-primary-content relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Blobs (Igual à Home) */}
      <div className="absolute top-0 right-1/2 -z-10 w-[800px] h-[800px] translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/20 blur-[120px] opacity-40 animate-pulse" />
      <div className="absolute bottom-0 left-0 -z-10 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[100px] opacity-30" />

      <div className="w-full max-w-md">
        <div className="mockup-window border border-base-content/10 bg-base-100/80 shadow-2xl backdrop-blur-xl">
          <div className="border-t border-base-content/10 bg-base-200/30 p-8 md:p-10">
            
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-black tracking-tight mb-2">
                Nova <span className="text-primary">Senha</span>
              </h1>
              <p className="text-base-content/70 text-sm">
                Crie uma senha forte para proteger sua conta.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Campo Senha */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Nova Senha</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="input input-bordered w-full pl-10 bg-base-100 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
              </div>

              {/* Campo Confirmar Senha */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Confirmar Senha</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="input input-bordered w-full pl-10 bg-base-100 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Mensagem de Erro */}
              {error && (
                <div className="alert alert-error shadow-lg text-sm py-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={resetMutation.isPending}
                className="btn btn-primary w-full shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all duration-300"
              >
                {resetMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Alterar Senha
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}