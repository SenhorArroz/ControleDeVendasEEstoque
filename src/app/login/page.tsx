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
		<div className="min-h-screen relative flex items-center justify-center bg-base-200 overflow-hidden font-sans px-4">
			<div className="absolute -top-[10%] -left-[10%] w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px] opacity-40 animate-pulse pointer-events-none" />
			<div className="absolute bottom-[0%] -right-[10%] w-[500px] h-[500px] rounded-full bg-secondary/20 blur-[100px] opacity-30 pointer-events-none" />
			<div className="absolute top-8 left-8 z-20">
				<Link href="/" className="btn btn-ghost gap-2 hover:bg-base-100/50">
					<ArrowLeft className="w-4 h-4" />
					Voltar
				</Link>
			</div>

			<div className="w-full max-w-md relative z-10">
				<div className="card bg-base-100/60 shadow-2xl backdrop-blur-xl border border-white/20">
					<div className="card-body p-8">
						<div className="text-center mb-6">
							<h2 className="text-3xl font-bold mb-2">Bem-vindo de volta!</h2>
							<p className="text-base-content/60 text-sm">
								Aceda ao{" "}
								<span className="font-bold text-primary">CashFlow</span> para
								gerir as suas finanças.
							</p>
						</div>

						{error && (
							<div
								role="alert"
								className="alert alert-error mb-4 p-3 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-2"
							>
								<AlertCircle className="w-4 h-4" />
								<span>{error}</span>
							</div>
						)}

						<form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
							<div className="flex flex-col gap-4 text-center items-center">
								<div className="form-control">
									<label className="input input-bordered min-w-5xs lg:min-w-xs flex items-center gap-2 h-12 bg-base-200/50 focus-within:bg-base-100 focus-within:border-primary transition-colors">
										<Mail className="w-4 h-4 opacity-50" />
										<input
											type="email"
											className="grow placeholder:text-base-content/40"
											placeholder="seu@email.com"
											required
											value={email}
											onChange={(e) => setEmail(e.target.value)}
										/>
									</label>
								</div>

								<div className="form-control">
									<label className="input input-bordered flex min-w-5xs lg:min-w-xs items-center gap-2 h-12 bg-base-200/50 focus-within:bg-base-100 focus-within:border-primary transition-colors">
										<Lock className="w-4 h-4 opacity-50" />
										<input
											type="password"
											className="grow placeholder:text-base-content/40"
											placeholder="••••••••"
											required
											value={password}
											onChange={(e) => setPassword(e.target.value)}
										/>
									</label>
									<label className="label">
										<Link
											href="/forgot-password"
											className="label-text-alt link link-hover text-primary"
										>
											Esqueceu a palavra-passe?
										</Link>
									</label>
								</div>
							</div>

							<button
								type="submit"
								disabled={isLoading || isGoogleLoading}
								className="btn btn-primary w-full h-12 text-lg shadow-lg shadow-primary/20 mt-2 hover:-translate-y-0.5 transition-transform disabled:opacity-50"
							>
								{isLoading ? (
									<Loader2 className="w-5 h-5 animate-spin" />
								) : (
									<>
										<LogIn className="w-5 h-5 mr-1" />
										Acessar o Painel
									</>
								)}
							</button>
						</form>

						<div className="text-center mt-6">
							<span className="text-sm text-base-content/60">
								Ainda não tem conta?{" "}
							</span>
							<Link
								href="/register"
								className="link link-primary font-bold no-underline hover:underline"
							>
								Criar agora
							</Link>
						</div>
					</div>
				</div>

				<div className="text-center mt-8 text-xs text-base-content/40">
					&copy; 2026 CashFlow Inc. Protegido por reCAPTCHA.
				</div>
			</div>
		</div>
	);
}
