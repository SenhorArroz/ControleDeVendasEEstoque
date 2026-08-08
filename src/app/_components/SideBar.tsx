"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
	LayoutDashboard,
	Package,
	Users,
	Settings,
	LogOut,
	DollarSign,
	User,
	Truck,
	Tags,
	PlusCircle,
	Box,
	Activity,
	History,
	ChevronRight
} from "lucide-react";

export default function SideBar() {
	const router = useRouter();
	const pathname = usePathname();

	const handleSignOut = () => {
		signOut();
		router.push("/login");
	};

	const isActive = (path: string) => {
		return pathname === path || pathname?.startsWith(path + "/");
	};

	const linkStyle = (path: string) => {
		const active = isActive(path);
		return `group flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
			active
				? "bg-orange-600 text-white font-semibold shadow-md shadow-orange-600/25"
				: "text-slate-600 hover:bg-orange-50 hover:text-orange-600"
		}`;
	};

	const subLinkStyle = (path: string) => {
		const active = isActive(path);
		return `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
			active
				? "bg-orange-100 text-orange-600 font-bold"
				: "text-slate-500 hover:text-orange-600 hover:bg-orange-50/50"
		}`;
	};

	return (
		<div className="drawer-side z-50">
			<label htmlFor="my-drawer-2" className="drawer-overlay"></label>

			{/* Ajuste: Troca de min-h-full por h-[100dvh] (ou h-full), limite de largura para mobile (w-[85vw] max-w-72) */}
			<aside className="w-[65vw] max-w-72 sm:max-w-60 sm:w-60 h-[100dvh] bg-white border-r border-slate-100 flex flex-col shadow-2xl overflow-y-auto custom-scrollbar transition-colors duration-200">
				<div className="p-4 sm:p-5 flex-1 flex flex-col">
					{/* --- BRANDING / LOGO HEADER --- */}
					<div className="flex items-center justify-between mb-6 px-1">
						<Link href="/dashboard" className="flex items-center gap-3.5 group">
							<div className="w-11 h-11 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-600/30 shrink-0 group-hover:scale-105 transition-transform duration-200">
								<Activity size={24} strokeWidth={2.5} />
							</div>
							<div className="flex flex-col">
								<div className="flex items-center gap-1.5">
									<span className="text-xl font-extrabold tracking-tight text-slate-900">
										CashFlow
									</span>
									<span className="inline-block w-2 h-2 rounded-full bg-orange-600 animate-pulse"></span>
								</div>
								<span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-widest">
									v1.5
								</span>
							</div>
						</Link>
					</div>

					{/* --- BOTÃO GERAR VENDA (CTA PRINCIPAL) --- */}
					<div className="mb-5">
						<Link
							href="/registrarCompra"
							className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-2xl h-11 text-sm font-bold shadow-md shadow-orange-600/25 hover:shadow-orange-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 border border-orange-500/30"
						>
							<PlusCircle size={18} strokeWidth={2.5} />
							<span>GERAR VENDA</span>
						</Link>
					</div>

					{/* --- NAVEGAÇÃO --- */}
					<nav className="flex-1 space-y-4">
						{/* SEÇÃO 1: VISÃO GERAL */}
						<div>
							<p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
								Visão Geral
							</p>
							<div className="space-y-0.5">
								<Link href="/dashboard" className={linkStyle("/dashboard")}>
									<LayoutDashboard size={19} className={isActive("/dashboard") ? "text-white" : "text-slate-400 group-hover:text-orange-600 transition-colors"} />
									<span>Dashboard</span>
								</Link>
							</div>
						</div>

						{/* SEÇÃO 2: OPERACIONAL */}
						<div>
							<p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
								Operacional
							</p>
							<div className="space-y-0.5">
								<Link href="/clientes" className={linkStyle("/clientes")}>
									<Users size={19} className={isActive("/clientes") ? "text-white" : "text-slate-400 group-hover:text-orange-600 transition-colors"} />
									<span>Clientes</span>
								</Link>

								{/* Submenu Inventário */}
								<details className="group/details" open={isActive("/produtos") || isActive("/categorias") || isActive("/fornecedores")}>
									<summary className="group flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm text-slate-600 hover:bg-orange-50 hover:text-orange-600 cursor-pointer transition-colors list-none">
										<div className="flex items-center gap-3">
											<Package size={19} className="text-slate-400 group-hover:text-orange-600 transition-colors" />
											<span>Inventário</span>
										</div>
										<ChevronRight size={16} className="text-slate-400 group-hover:text-orange-600 transition-transform duration-200 group-open/details:rotate-90" />
									</summary>
									
									<div className="mt-1 ml-4 pl-3 space-y-0.5 border-l-2 border-slate-100">
										<Link href="/produtos" className={subLinkStyle("/produtos")}>
											<Box size={15} />
											<span>Produtos</span>
										</Link>
										<Link href="/categorias" className={subLinkStyle("/categorias")}>
											<Tags size={15} />
											<span>Categorias</span>
										</Link>
										<Link href="/fornecedores" className={subLinkStyle("/fornecedores")}>
											<Truck size={15} />
											<span>Fornecedores</span>
										</Link>
									</div>
								</details>
							</div>
						</div>

						{/* SEÇÃO 3: FINANCEIRO E HISTÓRICO */}
						<div>
							<p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
								Financeiro & Vendas
							</p>
							<div className="space-y-0.5">
								<Link href="/financeiro" className={linkStyle("/financeiro")}>
									<DollarSign size={19} className={isActive("/financeiro") ? "text-white" : "text-slate-400 group-hover:text-orange-600 transition-colors"} />
									<span>Financeiro</span>
								</Link>

								<Link href="/historico" className={linkStyle("/historico")}>
									<History size={19} className={isActive("/historico") ? "text-white" : "text-slate-400 group-hover:text-orange-600 transition-colors"} />
									<span>Histórico</span>
								</Link>
							</div>
						</div>

						{/* SEÇÃO 4: ADMINISTRAÇÃO */}
						<div>
							<p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
								Administração
							</p>
							<div className="space-y-0.5">
								<Link href="/funcionarios" className={linkStyle("/funcionarios")}>
									<User size={19} className={isActive("/funcionarios") ? "text-white" : "text-slate-400 group-hover:text-orange-600 transition-colors"} />
									<span>Funcionários</span>
								</Link>

								<Link href="/configuracoes" className={linkStyle("/configuracoes")}>
									<Settings size={19} className={isActive("/configuracoes") ? "text-white" : "text-slate-400 group-hover:text-orange-600 transition-colors"} />
									<span>Configurações</span>
								</Link>
							</div>
						</div>
					</nav>
				</div>

				{/* --- FOOTER DA SIDEBAR --- */}
				<div className="p-3 m-4 mt-2 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
					<button
						onClick={handleSignOut}
						className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-100 text-sm font-bold transition-all duration-200"
						title="Encerrar sessão"
					>
						<LogOut size={18} />
						<span>Sair</span>
					</button>
				</div>
			</aside>
		</div>
	);
}
