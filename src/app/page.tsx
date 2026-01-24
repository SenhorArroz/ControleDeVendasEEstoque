import Link from "next/link";
import {
	BarChart3,
	Package,
	LayoutDashboard,
	ShieldCheck,
	History,
	Users,
	ArrowRight,
} from "lucide-react";

export default async function Home() {
	return (
		<div className="min-h-screen bg-base-200 font-sans text-base-content selection:bg-primary selection:text-primary-content overflow-x-hidden">
			<nav className="navbar fixed top-0 z-50 border-b border-white/10 bg-base-100/70 backdrop-blur-md transition-all">
				<div className="container mx-auto flex items-center justify-between px-4">
					<div className="flex-none">
						<Link
							href="/"
							className="btn btn-ghost normal-case text-xl font-extrabold tracking-tight hover:bg-transparent px-0"
						>
							<span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
								Cash
							</span>
							Flow
						</Link>
					</div>

					<div className="flex-none flex items-center gap-3">
						<Link
							href="/login"
							className="btn btn-ghost btn-sm hidden sm:inline-flex font-medium"
						>
							Entrar
						</Link>
						<Link
							href="/register"
							className="btn btn-primary btn-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
						>
							Criar Conta Grátis
						</Link>
					</div>
				</div>
			</nav>

			<section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32">
				<div className="absolute top-0 left-1/2 -z-10 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px] opacity-40 animate-pulse" />
				<div className="absolute bottom-0 right-0 -z-10 w-[600px] h-[600px] rounded-full bg-secondary/20 blur-[100px] opacity-30" />

				<div className="container mx-auto px-4 text-center">
					<h1 className="mb-6 text-5xl font-black leading-tight tracking-tight md:text-7xl lg:text-8xl">
						Gerencie seu caixa <br className="hidden md:block" />
						<span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
							sem perder o controle.
						</span>
					</h1>

					<p className="mx-auto mb-10 max-w-2xl text-lg text-base-content/70 md:text-xl font-medium leading-relaxed">
						Abandone as planilhas complexas. Tenha previsibilidade financeira,
						relatórios em tempo real e controle total em uma única plataforma.
						Tudo isso com uma interface moderna e intuitiva.
					</p>

					<div className="mb-20 flex flex-col justify-center gap-4 sm:flex-row">
						<Link
							href="/register"
							className="btn btn-primary btn-lg h-14 px-8 text-lg shadow-xl shadow-primary/30 hover:-translate-y-1 hover:shadow-primary/50 transition-all duration-300"
						>
							Começar Agora
							<svg
								aria-hidden="true"
								className="ml-2 -mr-1 w-5 h-5"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fillRule="evenodd"
									d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
									clipRule="evenodd"
								></path>
							</svg>
						</Link>
						<Link
							href="#features"
							className="btn btn-outline btn-lg h-14 px-8 text-lg hover:bg-base-content hover:text-base-100 transition-all"
						>
							Ver Demo
						</Link>
					</div>

					<div className="relative mx-auto max-w-5xl">
						<div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary via-accent to-secondary opacity-30 blur-lg" />

						<div className="mockup-window border border-base-content/10 bg-base-100/80 shadow-2xl backdrop-blur-xl">
							<p className="text-center text-lg font-bold mb-5">
								Exemplo de utilização
							</p>
							<div className="flex flex-col border-t border-base-content/10 bg-base-200/50 p-8 md:p-12">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									<div className="flex flex-col p-6 rounded-2xl bg-base-100 shadow-sm border border-base-content/5">
										<span className="text-sm text-base-content/60 mb-2">
											Entradas Hoje
										</span>
										<span className="text-3xl font-bold text-success">
											R$ 4.200
										</span>
										<div className="mt-2 text-xs font-medium text-success bg-success/10 py-1 px-2 rounded-lg self-start">
											+12.5% vs ontem
										</div>
									</div>
									<div className="flex flex-col p-6 rounded-2xl bg-base-100 shadow-sm border border-base-content/5">
										<span className="text-sm text-base-content/60 mb-2">
											Saídas Hoje
										</span>
										<span className="text-3xl font-bold text-error">
											R$ 1.150
										</span>
										<div className="mt-2 text-xs font-medium text-error bg-error/10 py-1 px-2 rounded-lg self-start">
											-2.4% vs ontem
										</div>
									</div>
									<div className="flex flex-col p-6 rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-content shadow-lg">
										<span className="text-sm opacity-80 mb-2">Saldo Total</span>
										<span className="text-3xl font-bold">R$ 124.500</span>
										<div className="mt-2 text-xs font-medium bg-white/20 py-1 px-2 rounded-lg self-start text-white">
											Em dia
										</div>
									</div>
								</div>

								<div className="mt-6 h-32 w-full rounded-xl bg-base-100 border border-base-content/5 flex items-end justify-between px-6 pb-6 gap-2 opacity-60">
									{[40, 70, 45, 90, 60, 80, 50, 95, 65, 85].map((h, i) => (
										<div
											key={i}
											style={{ height: `${h}%` }}
											className="w-full bg-primary/20 rounded-t-sm hover:bg-primary transition-colors cursor-pointer"
										/>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section id="features" className="relative py-24 bg-base-100">
				<div className="container mx-auto px-4">
					{/* ... Títulos ... */}

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="group card bg-base-200/50 hover:bg-base-100 border border-white/5 hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
							<div className="card-body">
								{/* Icon Container - Azul/Roxo */}
								<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-white shadow-lg shadow-blue-500/20">
									<Package className="w-7 h-7" strokeWidth={2} />
								</div>

								<h3 className="card-title text-xl mb-2 group-hover:text-primary transition-colors">
									Controle de Estoque
								</h3>
								<p className="text-base-content/70 text-sm leading-relaxed">
									Nunca mais perca vendas por falta de produtos. Receba alertas
									automáticos de reposição e rastreie movimentações em tempo
									real.
								</p>
							</div>
						</div>

						{/* --- CARD 2: Interface Intuitiva --- */}
						<div className="group card bg-base-200/50 hover:bg-base-100 border border-white/5 hover:border-secondary/20 transition-all duration-300 hover:shadow-xl hover:shadow-secondary/5">
							<div className="card-body">
								{/* Icon Container - Rosa/Laranja */}
								<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-white shadow-lg shadow-pink-500/20">
									<LayoutDashboard className="w-7 h-7" strokeWidth={2} />
								</div>

								<h3 className="card-title text-xl mb-2 group-hover:text-secondary transition-colors">
									Interface Intuitiva
								</h3>
								<p className="text-base-content/70 text-sm leading-relaxed">
									Design limpo e sem curva de aprendizado. Sua equipe domina o
									sistema em minutos, sem precisar de manuais complexos.
								</p>
							</div>
						</div>

						{/* --- CARD 3: Gerenciamento de Clientes (CRM) --- */}
						<div className="group card bg-base-200/50 hover:bg-base-100 border border-white/5 hover:border-accent/20 transition-all duration-300 hover:shadow-xl hover:shadow-accent/5">
							<div className="card-body">
								{/* Icon Container - Verde/Ciano */}
								<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-white shadow-lg shadow-emerald-500/20">
									<Users className="w-7 h-7" strokeWidth={2} />
								</div>

								<h3 className="card-title text-xl mb-2 group-hover:text-accent transition-colors">
									Gestão de Clientes
								</h3>
								<p className="text-base-content/70 text-sm leading-relaxed">
									CRM integrado para você conhecer quem compra. Histórico de
									pedidos, preferências e dados para fidelizar seu público.
								</p>
							</div>
						</div>
						{/* Feature 1 */}
						<div className="group card bg-base-200/50 hover:bg-base-100 border border-transparent hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
							<div className="card-body">
								<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-focus flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-white shadow-lg shadow-primary/30">
									{/* Ícone Lucide aqui */}
									<BarChart3 className="w-7 h-7" strokeWidth={2} />
								</div>
								<h3 className="card-title text-xl mb-2">
									Relatórios em Tempo Real
								</h3>
								<p className="text-base-content/70">
									Acompanhe cada centavo que entra e sai com gráficos dinâmicos.
								</p>
							</div>
						</div>

						{/* Feature 2 */}
						<div className="group card bg-base-200/50 hover:bg-base-100 border border-transparent hover:border-secondary/20 transition-all duration-300 hover:shadow-xl hover:shadow-secondary/5">
							<div className="card-body">
								<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-secondary-focus flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-white shadow-lg shadow-secondary/30">
									{/* Ícone Lucide aqui */}
									<ShieldCheck className="w-7 h-7" strokeWidth={2} />
								</div>
								<h3 className="card-title text-xl mb-2">Segurança Bancária</h3>
								<p className="text-base-content/70">
									Criptografia de ponta a ponta e conformidade com padrões
									internacionais.
								</p>
							</div>
						</div>

						{/* Feature 3 */}
						<div className="group card bg-base-200/50 hover:bg-base-100 border border-transparent hover:border-accent/20 transition-all duration-300 hover:shadow-xl hover:shadow-accent/5">
							<div className="card-body">
								<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent-focus flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-white shadow-lg shadow-accent/30">
									{/* Ícone Lucide aqui */}
									<History className="w-7 h-7" strokeWidth={2} />
								</div>
								<h3 className="card-title text-xl mb-2">Histórico Ilimitado</h3>
								<p className="text-base-content/70">
									Acesse transações de anos atrás instantaneamente com filtros
									inteligentes.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="px-4 py-20 relative overflow-hidden">
				<div className="container mx-auto max-w-5xl relative z-10">
					<div className="rounded-3xl bg-gradient-to-r from-primary to-secondary p-10 md:p-20 text-center text-primary-content shadow-2xl relative overflow-hidden group">
						<div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-white opacity-10 group-hover:scale-150 transition-transform duration-700 ease-in-out"></div>
						<div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 rounded-full bg-black opacity-10 group-hover:scale-150 transition-transform duration-700 ease-in-out"></div>

						<h2 className="mb-6 text-3xl font-bold md:text-5xl drop-shadow-md">
							Pronto para organizar suas finanças?
						</h2>
						<p className="mb-10 text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
							Junte-se ao melhor aplicativo de gerenciamento de finanças,
							estoque e tudo que você pode pensar!
						</p>
						<Link
							href="/register"
							className="btn btn-lg bg-white text-primary border-none hover:bg-gray-100 hover:scale-105 transition-transform shadow-xl"
						>
							Criar Conta Gratuita
						</Link>
					</div>
				</div>
			</section>

			<footer className="footer footer-center  p-10 bg-base-100 text-base-content/50 border-t border-base-content/5">
				<div className="grid grid-flow-col gap-4">
					<a className="link link-hover">Sobre</a>
					<a className="link link-hover">Contato</a>
					<a className="link link-hover">Carreiras</a>
					<a className="link link-hover">Imprensa</a>
				</div>
				<div>
					<div className="grid grid-flow-col gap-4">
						<a>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								className="fill-current"
							>
								<path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 2.468-4.678 3.062-7.57 2.675 4.189 2.688 9.157 1.731 11.209-6.947 1.96-7.859 1.194-11.776-2.106-13.673.953-1.464 1.785-3.107 2.433-4.886z"></path>
							</svg>
						</a>
						<a>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								className="fill-current"
							>
								<path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
							</svg>
						</a>
					</div>
				</div>
				<div>
					<p>Copyright © 2026 - CashFlow Inc.</p>
				</div>
			</footer>
		</div>
	);
}
