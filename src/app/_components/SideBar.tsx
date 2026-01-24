"use client";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import {
	LayoutDashboard,
	Package,
	Users,
	Settings,
	LogOut,
	DollarSign, // Para Financeiro
	History, // Para Histórico
	User, // Para Perfil
	Truck, // Para Fornecedores
	Tags, // Para Categorias
	PlusCircle, // Para Gerar Venda
	Box,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SideBar() {
	const router = useRouter();
	const handleSignOut = () => {
		signOut();
		router.push("/login");
	};

	return (
		<div className="drawer-side z-40">
			<label htmlFor="my-drawer-2" className="drawer-overlay"></label>

			<ul className="menu p-4 w-80 min-h-full bg-base-100 text-base-content flex flex-col justify-between border-r border-base-200">
				{/* Topo e Navegação Principal */}
				<div>
					{/* Header / Logo */}
					<div className="mb-6 px-2 mt-2 flex justify-between items-center">
						<span className="text-2xl font-black tracking-tighter flex items-center gap-2">
							<span className="bg-primary w-8 h-8 rounded-lg flex items-center justify-center text-white text-lg">
								C
							</span>
							CashFlow
						</span>
						<ThemeToggle />
					</div>

					{/* BOTÃO GRANDE GERAR VENDA */}
					<div className="mb-6 px-0">
						<Link
							href="/registrarCompra"
							className="btn btn-primary w-full text-white shadow-md flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
						>
							<PlusCircle className="w-5 h-5" />
							GERAR VENDA
						</Link>
					</div>

					{/* Navegação */}
					<li className="mb-1">
						<Link href="/dashboard" className="font-medium">
							<LayoutDashboard className="w-5 h-5" /> Dashboard
						</Link>
					</li>

					{/* DROPDOWN PRODUTOS */}
					<li className="mb-1">
						<details>
							<summary className="font-medium group">
								<Package className="w-5 h-5" /> Produtos
							</summary>
							<ul>
								<li>
									<Link href="/produtos">
										<Box className="w-4 h-4" /> Gerenciar Produtos
									</Link>
								</li>
								<li>
									<Link href="/categorias">
										<Tags className="w-4 h-4" /> Gerenciar Categorias
									</Link>
								</li>
								<li>
									<Link href="/fornecedores">
										<Truck className="w-4 h-4" /> Gerenciar Fornecedores
									</Link>
								</li>
							</ul>
						</details>
					</li>

					{/* CLIENTES */}
					<li className="mb-1">
						<Link href="/clientes" className="font-medium">
							<Users className="w-5 h-5" /> Clientes
						</Link>
					</li>

					{/* FINANCEIRO (Novo) */}
					<li className="mb-1">
						<Link href="/financeiro" className="font-medium">
							<DollarSign className="w-5 h-5" /> Financeiro
						</Link>
					</li>

					{/* DROPDOWN CONFIGURAÇÕES */}
					<li className="mb-1">
						<details>
							<summary className="font-medium">
								<Settings className="w-5 h-5" /> Configurações
							</summary>
							<ul>
								<li>
									<Link href="/configuracoes">
										<User className="w-4 h-4" /> Perfil
									</Link>
								</li>
								<li>
									<Link href="/historico">
										<History className="w-4 h-4" /> Histórico
									</Link>
								</li>
							</ul>
						</details>
					</li>
				</div>

				{/* Rodapé */}
				<div className="border-t border-base-200 pt-4 mt-4">
					<li>
						<button
							onClick={handleSignOut}
							className="text-error hover:bg-error/10 font-medium"
						>
							<LogOut className="w-5 h-5" /> Sair
						</button>
					</li>
				</div>
			</ul>
		</div>
	);
}
