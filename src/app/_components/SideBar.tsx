"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";
import { 
  LayoutDashboard, Package, Users, Settings, LogOut, 
  DollarSign, User, Truck, Tags, PlusCircle, Box, Activity 
} from "lucide-react";

export default function SideBar() {
  const router = useRouter();
  
  const handleSignOut = () => { 
    signOut(); 
    router.push("/login"); 
  };

  return (
    <div className="drawer-side z-50">
      <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
      
      <div className="p-6 md:p-8 w-80 min-h-full bg-white border-r border-slate-100 flex flex-col shadow-2xl overflow-y-auto custom-scrollbar">
        <div className="flex-1 flex flex-col">
          
          {/* --- LOGO / BRANDING --- */}
          <div className="flex items-center gap-4 mb-10 px-2">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/30 shrink-0">
              <Activity size={26} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter leading-none text-slate-900">CashFlow</span>
              <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Business v3.0</span>
            </div>
          </div>

          {/* --- BOTÃO GERAR VENDA --- */}
          <div className="mb-8">
            <Link 
              href="/registrarCompra" 
              className="btn btn-primary w-full rounded-2xl h-14 text-white font-black border-none shadow-lg shadow-primary/20 hover:scale-[1.02] hover:shadow-primary/40 transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle size={20} /> 
              GERAR VENDA
            </Link>
          </div>

          {/* --- MENUS DE NAVEGAÇÃO --- */}
          <nav className="flex-1 space-y-6">
            
            {/* SEÇÃO 1: Principal */}
            <div>
              <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Visão Geral</p>
              <ul className="menu p-0 gap-1 text-slate-600">
                <li>
                  <Link href="/dashboard" className="font-bold py-3.5 rounded-xl hover:bg-slate-50 hover:text-primary transition-colors">
                    <LayoutDashboard size={20} className="opacity-70"/> Dashboard
                  </Link>
                </li>
                
              </ul>
            </div>

            {/* SEÇÃO 2: Operacional */}
            <div>
              <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Operacional</p>
              <ul className="menu p-0 gap-1 text-slate-600">
                <li>
                  <Link href="/clientes" className="font-bold py-3.5 rounded-xl hover:bg-slate-50 hover:text-primary transition-colors">
                    <Users size={20} className="opacity-70"/> Clientes
                  </Link>
                </li>
                <li>
                  <details className="group">
                    <summary className="font-bold py-3.5 rounded-xl hover:bg-slate-50 hover:text-primary transition-colors">
                      <Package size={20} className="opacity-70"/> Inventário
                    </summary>
                    <ul className="mt-2 space-y-1 before:bg-slate-100 before:w-[2px] ml-4 pl-4">
                      <li>
                        <Link href="/produtos" className="text-sm font-bold text-slate-500 hover:text-primary py-2.5 rounded-lg">
                          <Box size={16} /> Produtos
                        </Link>
                      </li>
                      <li>
                        <Link href="/categorias" className="text-sm font-bold text-slate-500 hover:text-primary py-2.5 rounded-lg">
                          <Tags size={16} /> Categorias
                        </Link>
                      </li>
                      <li>
                        <Link href="/fornecedores" className="text-sm font-bold text-slate-500 hover:text-primary py-2.5 rounded-lg">
                          <Truck size={16} /> Fornecedores
                        </Link>
                      </li>
                    </ul>
                  </details>
                </li>
              </ul>
            </div>

            {/* SEÇÃO 3: Administração */}
            <div>
              <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Administração</p>
              <ul className="menu p-0 gap-1 text-slate-600">
                <li>
                  <Link href="/funcionarios" className="font-bold py-3.5 rounded-xl hover:bg-slate-50 hover:text-primary transition-colors">
                    <User size={20} className="opacity-70"/> Funcionários
                  </Link>
                </li>
                
                <li>
                  <Link href="/configuracoes" className="font-bold py-3.5 rounded-xl hover:bg-slate-50 hover:text-primary transition-colors">
                    <Settings size={20} className="opacity-70"/> Configurações
                  </Link>
                </li>
              </ul>
            </div>

          </nav>
        </div>

        {/* --- FOOTER DA SIDEBAR --- */}
        <div className="pt-6 mt-8 border-t border-slate-100 flex flex-col gap-4">
          <div className="flex items-center justify-between px-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <button 
              onClick={handleSignOut} 
              className="btn btn-ghost text-rose-500 hover:bg-rose-100 hover:text-rose-600 font-black text-xs uppercase tracking-widest px-4 rounded-xl transition-colors"
            >
              <LogOut size={16} className="mr-1" /> Sair
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}