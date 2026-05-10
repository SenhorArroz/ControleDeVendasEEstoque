import Link from "next/link";
import {
    BarChart3,
    Package,
    LayoutDashboard,
    ShieldCheck,
    History,
    Users,
    ArrowRight,
    Activity,
    CheckCircle2,
    TrendingUp,
    TrendingDown,
    Wallet
} from "lucide-react";

export default async function Home() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-primary selection:text-white overflow-x-hidden">
            
            {/* --- NAVBAR FLUTUANTE (GLASSMORPHISM) --- */}
            <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl bg-white/70 backdrop-blur-xl border border-white shadow-xl shadow-slate-200/20 rounded-[2rem] px-6 py-3 transition-all flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-md shadow-primary/20">
                        <Activity size={20} strokeWidth={3} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black tracking-tighter leading-none text-slate-900">CashFlow</span>
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest mt-0.5">Business v3.0</span>
                    </div>
                </Link>

                <div className="flex items-center gap-4">
                    <Link href="/login" className="hidden sm:block text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors px-4">
                        Entrar
                    </Link>
                    <Link href="/register" className="btn btn-primary rounded-xl h-12 px-6 font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/30 border-none hover:scale-105 transition-transform">
                        Criar Conta Grátis
                    </Link>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <section className="relative pt-48 pb-20 lg:pt-56 lg:pb-32 px-4 flex flex-col items-center text-center">
                {/* Efeitos de Luz de Fundo */}
                <div className="absolute top-20 left-1/2 -z-10 w-[600px] h-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[100px] opacity-60 animate-pulse" />
                <div className="absolute bottom-0 right-1/4 -z-10 w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[80px] opacity-40" />

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-100 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sistema 100% Operacional</span>
                </div>

                <h1 className="max-w-5xl mb-8 text-5xl md:text-7xl lg:text-[5.5rem] font-black leading-[1.1] tracking-tighter text-slate-900 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                    Gerencie seu caixa <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                        sem perder o controle.
                    </span>
                </h1>

                <p className="max-w-2xl mb-12 text-lg md:text-xl text-slate-500 font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    Abandone as planilhas complexas. Tenha previsibilidade financeira, relatórios em tempo real e controle de estoque em uma única plataforma intuitiva.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                    <Link href="/register" className="btn btn-primary rounded-2xl h-16 px-10 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/30 border-none hover:scale-105 transition-transform flex items-center gap-2">
                        Começar Agora <ArrowRight size={18} />
                    </Link>
                    <Link href="#features" className="btn bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-2xl h-16 px-10 text-sm font-black uppercase tracking-widest transition-all">
                        Ver Recursos
                    </Link>
                </div>

                {/* --- MOCKUP DO SISTEMA --- */}
                <div className="mt-24 relative w-full max-w-5xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
                    <div className="absolute -inset-1 rounded-[3rem] bg-gradient-to-b from-primary/20 to-transparent blur-xl opacity-50" />
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 p-4 md:p-8 relative z-10">
                        
                        {/* Fake Browser Header */}
                        <div className="flex items-center gap-2 mb-8 px-4">
                            <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                        </div>

                        {/* Fake Dashboard Content */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-left">
                            <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl w-fit mb-4"><TrendingUp size={20}/></div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Entradas Hoje</p>
                                <p className="text-2xl font-black text-slate-800 mt-1">R$ 4.250,00</p>
                                <span className="inline-block mt-3 px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-md">+12.5%</span>
                            </div>
                            <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                                <div className="p-3 bg-rose-100 text-rose-600 rounded-xl w-fit mb-4"><TrendingDown size={20}/></div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Saídas Hoje</p>
                                <p className="text-2xl font-black text-slate-800 mt-1">R$ 1.150,00</p>
                                <span className="inline-block mt-3 px-2 py-1 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-md">-2.4%</span>
                            </div>
                            <div className="p-6 rounded-[2rem] bg-slate-900 border border-slate-800 shadow-xl shadow-slate-900/20 text-white">
                                <div className="p-3 bg-white/10 text-primary rounded-xl w-fit mb-4"><Wallet size={20}/></div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Saldo Total</p>
                                <p className="text-2xl font-black text-white mt-1">R$ 124.500,00</p>
                                <span className="inline-block mt-3 px-2 py-1 bg-white/10 text-slate-200 text-[10px] font-black uppercase tracking-widest rounded-md">Em dia</span>
                            </div>
                        </div>

                        {/* Fake Chart */}
                        <div className="h-40 w-full rounded-2xl bg-slate-50 border border-slate-100 flex items-end justify-between px-6 pb-6 pt-10 gap-2">
                            {[40, 70, 45, 90, 60, 80, 50, 95, 65, 85].map((h, i) => (
                                <div key={i} style={{ height: `${h}%` }} className="w-full bg-primary/20 rounded-t-lg hover:bg-primary transition-colors cursor-pointer relative group">
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-black px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">R$ {(h * 120).toFixed(0)}</div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </section>

            {/* --- FEATURES SECTION --- */}
            <section id="features" className="py-24 bg-white border-y border-slate-100 relative">
                <div className="container mx-auto px-6 max-w-6xl">
                    
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-4">Tudo o que você precisa</h2>
                        <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Ferramentas desenhadas para o crescimento da sua empresa.</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        
                        {/* Feature 1 */}
                        <div className="bg-[#F8FAFC] rounded-[2.5rem] p-10 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
                            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <Package size={28} />
                            </div>
                            <h4 className="text-xl font-black text-slate-900 mb-3 tracking-tight">Controle de Estoque</h4>
                            <p className="text-slate-500 font-medium leading-relaxed">Nunca mais perca vendas por falta de produtos. Receba alertas automáticos e rastreie movimentações em tempo real.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-[#F8FAFC] rounded-[2.5rem] p-10 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                <LayoutDashboard size={28} />
                            </div>
                            <h4 className="text-xl font-black text-slate-900 mb-3 tracking-tight">Interface Intuitiva</h4>
                            <p className="text-slate-500 font-medium leading-relaxed">Design limpo e sem curva de aprendizado. Sua equipe domina o sistema em minutos, sem manuais complexos.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-[#F8FAFC] rounded-[2.5rem] p-10 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
                            <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                <Users size={28} />
                            </div>
                            <h4 className="text-xl font-black text-slate-900 mb-3 tracking-tight">Gestão de Clientes</h4>
                            <p className="text-slate-500 font-medium leading-relaxed">CRM integrado para você conhecer quem compra. Histórico de pedidos, preferências e dados para fidelizar.</p>
                        </div>

                        {/* Feature 4 */}
                        <div className="bg-[#F8FAFC] rounded-[2.5rem] p-10 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
                            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all">
                                <BarChart3 size={28} />
                            </div>
                            <h4 className="text-xl font-black text-slate-900 mb-3 tracking-tight">Relatórios em Tempo Real</h4>
                            <p className="text-slate-500 font-medium leading-relaxed">Acompanhe cada centavo que entra e sai com gráficos dinâmicos e métricas de desempenho LTV detalhadas.</p>
                        </div>

                        {/* Feature 5 */}
                        <div className="bg-[#F8FAFC] rounded-[2.5rem] p-10 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
                            <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all">
                                <ShieldCheck size={28} />
                            </div>
                            <h4 className="text-xl font-black text-slate-900 mb-3 tracking-tight">Privacidade Absoluta</h4>
                            <p className="text-slate-500 font-medium leading-relaxed">Seus dados e de seus clientes estão protegidos com arquitetura de segurança de ponta e isolamento total.</p>
                        </div>

                        {/* Feature 6 */}
                        <div className="bg-[#F8FAFC] rounded-[2.5rem] p-10 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
                            <div className="w-16 h-16 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-cyan-600 group-hover:text-white transition-all">
                                <History size={28} />
                            </div>
                            <h4 className="text-xl font-black text-slate-900 mb-3 tracking-tight">Histórico Ilimitado</h4>
                            <p className="text-slate-500 font-medium leading-relaxed">Acesse transações de anos atrás instantaneamente com filtros inteligentes de busca e auditoria de caixa.</p>
                        </div>

                    </div>
                </div>
            </section>

            {/* --- BOTTOM CTA --- */}
            <section className="py-24 relative overflow-hidden px-4">
                <div className="container mx-auto max-w-5xl relative z-10">
                    <div className="rounded-[3rem] bg-slate-900 p-12 md:p-20 text-center text-white shadow-2xl relative overflow-hidden group">
                        
                        {/* Efeitos visuais do CTA */}
                        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 rounded-full bg-primary opacity-20 blur-3xl group-hover:scale-150 transition-transform duration-1000 ease-in-out"></div>
                        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-60 h-60 rounded-full bg-blue-500 opacity-20 blur-3xl group-hover:scale-150 transition-transform duration-1000 ease-in-out"></div>

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md mb-8 border border-white/10">
                                <CheckCircle2 size={32} className="text-emerald-400" />
                            </div>
                            <h2 className="mb-6 text-4xl md:text-5xl font-black tracking-tight">
                                Pronto para organizar o seu negócio?
                            </h2>
                            <p className="mb-12 text-lg text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
                                Junte-se ao sistema de gestão mais moderno do mercado. Pare de perder tempo com planilhas e foque em escalar suas vendas.
                            </p>
                            <Link href="/register" className="btn bg-white text-slate-900 border-none rounded-2xl h-16 px-12 text-sm font-black uppercase tracking-widest shadow-xl hover:scale-105 hover:bg-slate-50 transition-all">
                                Criar Conta Gratuita
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SIMPLE FOOTER --- */}
            <footer className="py-8 text-center text-slate-500 text-xs font-bold uppercase tracking-widest border-t border-slate-200">
                <p>&copy; {new Date().getFullYear()} Made by: Luiz Guimarães (@luizrob_bah)</p>
            </footer>

        </div>
    );
}