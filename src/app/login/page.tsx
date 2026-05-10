"use client"; 

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation"; 
import { signIn } from "next-auth/react";
import {
    Mail,
    Lock,
    ArrowLeft,
    LogIn,
    Loader2,
    AlertCircle,
    Activity
} from "lucide-react";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [error, setError] = useState("");

    const handleGoogleLogin = () => {
        setIsGoogleLoading(true);
        signIn("google", { callbackUrl: "/dashboard" });
    };

    const handleEmailLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        signIn("credentials", {
            redirect: false,
            email,
            password,
        })
        .then((result) => {
            if (result?.error) {
                setError("Email ou palavra-passe incorretos.");
                setIsLoading(false);
            } else {
                router.refresh();
                router.push("/dashboard");
            }
        })
        .catch((err) => {
            setError("Ocorreu um erro inesperado. Tente novamente.");
            setIsLoading(false);
        });
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center relative overflow-hidden font-sans p-4">
            
            {/* Ambient Background Glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

            {/* Back Button */}
            <div className="absolute top-8 left-8 z-20">
                <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-sm border border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors">
                    <ArrowLeft size={16} />
                    Voltar
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

                {/* Login Card */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                    
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Bem-vindo de volta!</h2>
                        <p className="text-sm font-medium text-slate-500 mt-2">
                            Acesse sua conta para continuar.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 mb-6 animate-in fade-in zoom-in duration-300">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleEmailLogin} className="space-y-5">
                        
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

                        {/* Password Input */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Sua Senha</label>
                                <Link href="/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/70 transition-colors">
                                    Esqueceu?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary/10 transition-all font-black text-slate-800 tracking-widest outline-none placeholder:text-slate-300 placeholder:tracking-normal placeholder:font-bold"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading || isGoogleLoading}
                            className="w-full h-14 mt-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4" /> ACESSAR O PAINEL
                                </>
                            )}
                        </button>

                    </form>

                    {/* Divisor */}
                    <div className="flex items-center gap-4 my-8">
                        <div className="flex-1 h-px bg-slate-100"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Ou continue com</span>
                        <div className="flex-1 h-px bg-slate-100"></div>
                    </div>

                    {/* Google Login Button */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isLoading || isGoogleLoading}
                        className="w-full h-14 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isGoogleLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                Google
                            </>
                        )}
                    </button>
                    
                </div>

                {/* Register Link */}
                <div className="text-center mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    <span className="text-xs font-bold text-slate-500">
                        Ainda não possui uma conta?{" "}
                    </span>
                    <Link
                        href="/register"
                        className="text-xs font-black uppercase tracking-widest text-primary hover:underline ml-1"
                    >
                        Criar agora
                    </Link>
                </div>

                <div className="text-center mt-10 text-[10px] font-bold uppercase tracking-widest text-slate-300 animate-in fade-in duration-1000 delay-300">
                    &copy; {new Date().getFullYear()} CashFlow Inc. Seguro e Criptografado.
                </div>
            </div>
        </div>
    );
}