import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  PlusCircle,
  FileText,
  Users,
  ArrowRight,
  Activity,
  CalendarDays,
} from "lucide-react";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { redirect } from "next/navigation";
import SideBar from "../_components/SideBar";
import DashboardCharts from "../_components/DashboardCharts";
import { api } from "~/trpc/server";
import Link from "next/link";

// 1. MATEMÁTICA E LÓGICA BLINDADAS
async function getDashboardData() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado");

  const ownerId = session.user.id;

  // Ajuste do calendário garantindo horas zeradas no fuso correto
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // Padronização do Fuso Horário para o Gráfico bater certinho com o Brasil
  const tzOptions: Intl.DateTimeFormatOptions = { 
    day: "2-digit", 
    month: "2-digit", 
    timeZone: "America/Sao_Paulo" 
  };

  const somaLifetimeStock = await api.produto.somaLifetimeStock();
  const itensVendidosCont = await api.compra.itensVendidosCont();

  let percent = 0;
  if (somaLifetimeStock > 0) {
    percent = (itensVendidosCont / somaLifetimeStock) * 100;
  }

  // A BUSCA NO BANCO
  const purchases = await db.purchase.findMany({
    where: {
      userId: ownerId, 
      date: { gte: sevenDaysAgo },
      // CORREÇÃO: Trazendo tanto as finalizadas quanto as pendentes (fiado)
      status: { in: ["COMPLETED", "PENDING"] },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { date: "asc" },
  });

  const chartMap = new Map<string, { entrada: number; saida: number }>();

  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const key = d.toLocaleDateString("pt-BR", tzOptions);
    chartMap.set(key, { entrada: 0, saida: 0 });
  }

  let receitaTotal = 0;
  let custoTotal = 0;

  purchases.forEach((p) => {
    const key = p.date.toLocaleDateString("pt-BR", tzOptions);
    const current = chartMap.get(key) || { entrada: 0, saida: 0 };

    // CORREÇÃO DO CÁLCULO DECIMAL: O .toString() impede o NaN no JavaScript
    const vendaTotal = p.total ? Number(p.total.toString()) : 0;
    
    // CORREÇÃO DO CUSTO: Garantindo a leitura do Decimal do precoCompra
    const custoVenda = p.items.reduce((acc, item) => {
      const precoCusto = item.product.precoCompra ? Number(item.product.precoCompra.toString()) : 0;
      return acc + (item.quantity * precoCusto);
    }, 0);

    receitaTotal += vendaTotal;
    custoTotal += custoVenda;

    chartMap.set(key, {
      entrada: current.entrada + vendaTotal,
      saida: current.saida + custoVenda,
    });
  });

  const chartData = Array.from(chartMap.entries()).map(([name, val]) => ({
    name,
    ...val,
  }));

  const newClientsCount = await db.client.count({
    where: { userId: ownerId, createdAt: { gte: sevenDaysAgo } },
  });

  return {
    chartData,
    receitaTotal,
    custoTotal,
    lucro: receitaTotal - custoTotal,
    newClientsCount,
    totalItemsSold: itensVendidosCont,
    percent,
    recentTransactions: purchases.slice(-5).reverse(), // Pega as 5 mais recentes
  };
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "FUNCIONARIO") {
    redirect("/registrarCompra");
  }

  const data = await getDashboardData();

  const formatMoney = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <div className="drawer lg:drawer-open bg-slate-50 font-sans selection:bg-orange-600/20">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col min-h-screen min-w-0">
        
        {/* Navbar Mobile Premium */}
        <div className="w-full navbar bg-white/80 backdrop-blur-md sticky top-0 z-40 lg:hidden border-b border-slate-200/50 px-4">
          <label htmlFor="my-drawer-2" className="btn btn-ghost btn-circle drawer-button lg:hidden">
            <Activity className="w-6 h-6 text-orange-600" strokeWidth={2.5} />
          </label>
          <div className="flex-1 font-black text-xl tracking-tighter text-slate-900 ml-2">CASHFLOW</div>
        </div>

        <main className="flex-1 px-4 py-4 sm:p-4 2xl:p-6 lg:p-5 2xl:p-8 space-y-4 sm:space-y-6 lg:space-y-4 2xl:space-y-6 max-w-full overflow-x-hidden min-w-0 w-full">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <h1 className="text-lg sm:text-xl 2xl:text-2xl 2xl:text-3xl font-black tracking-tight text-slate-900">Visão Geral</h1>
              <p className="text-slate-500 font-medium text-xs sm:text-sm">
                Bem-vindo de volta, <span className="text-orange-600 font-bold">{session.user.name?.split(" ")[0]}</span>. Aqui está o resumo da sua semana.
              </p>
            </div>
            
            <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
                <CalendarDays className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Período atual</span>
                <span className="text-xs sm:text-sm font-black text-slate-700">Últimos 7 dias</span>
              </div>
            </div>
          </div>

          {/* Cards de KPIs Ultra Premium - Compactos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4 min-w-0">
            {[
              { label: "Receita", val: data.receitaTotal, icon: TrendingUp, accent: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-100" },
              { label: "Custos", val: data.custoTotal, icon: TrendingDown, accent: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-100" },
              { label: "Lucro Líquido", val: data.lucro, icon: Wallet, accent: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-100" },
              { label: "Novos Clientes", val: data.newClientsCount, icon: Users, accent: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-100", isMoney: false },
            ].map((kpi, i) => (
              <div key={i} className="bg-white rounded-[1rem] p-4 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-3 relative overflow-hidden group">
                
                {/* Background Decoration */}
                <div className={`absolute -right-4 -top-4 w-12 h-12 rounded-full ${kpi.bg} blur-xl opacity-50 group-hover:opacity-80 transition-opacity`}></div>

                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${kpi.bg} ${kpi.accent} relative z-10`}>
                  <kpi.icon size={18} strokeWidth={2.5} />
                </div>

                <div className="flex flex-col relative z-10 min-w-0">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{kpi.label}</p>
                  <h3 className="text-lg lg:text-xl font-black text-slate-800 tracking-tight truncate">
                    {kpi.isMoney === false ? kpi.val : formatMoney(kpi.val as number)}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          {/* Main Grid: Charts, Tables & Side Widget */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 min-w-0">
            
            {/* Left Area (Col Span 2) */}
            <div className="lg:col-span-2 space-y-4 lg:space-y-4 2xl:space-y-6 min-w-0">
              
              {/* Chart Card */}
              <div className="bg-white rounded-[1.5rem] p-5 lg:p-6 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100 min-w-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 lg:mb-6">
                  <div className="space-y-1 w-full sm:w-auto">
                    <h2 className="font-black text-slate-800 text-sm sm:text-base uppercase tracking-widest break-words">Desempenho Financeiro</h2>
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Comparativo de 7 dias</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 w-full sm:w-auto">
                    <span className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-600 uppercase tracking-widest"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_6px_rgba(16,185,129,0.5)]"/> Entradas</span>
                    <span className="flex items-center gap-1.5 text-[9px] font-bold text-rose-600 uppercase tracking-widest"><div className="w-1.5 h-1.5 bg-rose-500 rounded-full shadow-[0_0_6px_rgba(244,63,94,0.5)]"/> Saídas</span>
                  </div>
                </div>
                
                {/* Fixed height wrapper for the chart - scaled down */}
                <div className="w-full h-[220px] lg:h-[260px] min-w-0">
                  <DashboardCharts data={data.chartData} />
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-white rounded-[1.5rem] overflow-hidden shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100 min-w-0 max-w-full">
                <div className="px-5 lg:px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-wrap gap-4">
                  <h2 className="font-black text-slate-800 uppercase tracking-widest text-xs sm:text-sm break-words">Transações Recentes</h2>
                  <Link href="/historico" className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-orange-600 hover:shadow-sm transition-all border border-slate-100 shrink-0">
                    <ArrowRight size={14} />
                  </Link>
                </div>
                
                <div className="w-full overflow-x-auto custom-scrollbar">
                  <table className="w-full min-w-[500px] text-left">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                        <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Data / Hora</th>
                        <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                        <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {data.recentTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-8 text-slate-400 font-bold italic text-xs">
                            Nenhuma transação recente
                          </td>
                        </tr>
                      ) : (
                        data.recentTransactions.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-5 py-3">
                              <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded group-hover:bg-white group-hover:shadow-sm transition-all">#{t.id.slice(-6).toUpperCase()}</span>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-700 whitespace-nowrap">{t.date.toLocaleDateString()}</span>
                                <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{t.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border whitespace-nowrap ${
                                t.status === "COMPLETED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                t.status === "PENDING" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                "bg-rose-50 text-rose-600 border-rose-100"
                              }`}>
                                {t.status === "COMPLETED" ? "Aprovado" : t.status === "PENDING" ? "Pendente" : "Cancelado"}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right">
                              <span className="text-xs font-black text-emerald-600 whitespace-nowrap">
                                + {formatMoney(Number(t.total))}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Area (Col Span 1) */}
            <div className="space-y-4 lg:space-y-4 2xl:space-y-6 min-w-0">
              
              {/* Radial Progress Premium Card */}
              <div className="bg-white rounded-[1.5rem] p-5 lg:p-6 text-center shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col items-center relative overflow-hidden group w-full max-w-full">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-400 to-orange-600"></div>
                
                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-5">Escore de Retenção</h3>
                
                {/* The radial progress */}
                <div className="relative">
                  {/* Subtle glow behind */}
                  <div className="absolute inset-0 bg-orange-600 blur-2xl opacity-10 rounded-full scale-125 group-hover:opacity-20 transition-opacity"></div>
                  
                  <div className="radial-progress text-orange-600 font-black relative z-10 bg-slate-50 shadow-inner" style={{ "--value": data.percent, "--size": "8rem", "--thickness": "10px" } as any}>
                    <div className="flex flex-col items-center justify-center h-full w-full">
                      <span className="text-2xl text-slate-800 tracking-tighter">{data.percent.toFixed(0)}<span className="text-lg text-orange-600 ml-0.5">%</span></span>
                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Giro LTV</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-slate-50 w-full rounded-xl border border-slate-100/50">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Itens Vendidos</p>
                  <p className="text-2xl font-black text-slate-800 tracking-tight">{data.totalItemsSold}</p>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                {[
                  { label: "Nova Venda", icon: PlusCircle, color: "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md shadow-orange-600/30 hover:shadow-orange-600/50", border: "border-orange-500", href: "/registrarCompra" },
                  { label: "Estoque", icon: FileText, color: "bg-white text-slate-700 hover:bg-slate-50", border: "border-slate-200", href: "/produtos" },
                  { label: "Clientes", icon: Users, color: "bg-white text-slate-700 hover:bg-slate-50", border: "border-slate-200", href: "/clientes" },
                  { label: "Finanças", icon: DollarSign, color: "bg-white text-slate-700 hover:bg-slate-50", border: "border-slate-200", href: "/financeiro" },
                ].map((btn, i) => (
                  <Link key={i} href={btn.href} className={`${btn.color} border ${btn.border} p-3 sm:p-4 rounded-[1rem] flex flex-col items-center justify-center gap-2 hover:-translate-y-1 transition-all duration-300`}>
                    <btn.icon size={20} strokeWidth={2.5} />
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-center">{btn.label}</span>
                  </Link>
                ))}
              </div>

            </div>
          </div>
        </main>
      </div>
      
      <SideBar />
    </div>
  );
}
