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
    <div className="drawer lg:drawer-open bg-[#F8FAFC] font-sans">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col min-h-screen">
        <div className="w-full navbar bg-white lg:hidden border-b border-slate-200 px-6">
          <label htmlFor="my-drawer-2" className="btn btn-ghost drawer-button lg:hidden">
            <Activity className="w-6 h-6 text-primary" />
          </label>
          <div className="flex-1 font-black text-xl tracking-tighter">CASHFLOW</div>
        </div>

        <main className="flex-1 p-6 md:p-12 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <h1 className="text-4xl font-black tracking-tight text-slate-900">Visão Geral</h1>
              <p className="text-slate-500 font-medium italic">
                Bem-vindo de volta, <span className="text-primary font-bold">{session.user.name?.split(" ")[0]}</span>. Resumo dos últimos 7 dias.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-slate-100">
              <CalendarDays className="w-5 h-5 text-primary" />
              <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                {new Date().toLocaleDateString('pt-BR', { month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Cards de KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[
              { label: "Receita (7 dias)", val: data.receitaTotal, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", desc: "Vendas realizadas" },
              { label: "Custo Estimado", val: data.custoTotal, icon: TrendingDown, color: "text-rose-600", bg: "bg-rose-50", desc: "Preço de compra" },
              { label: "Lucro Bruto", val: data.lucro, icon: Wallet, color: "text-blue-600", bg: "bg-blue-50", desc: "Receita - Custo" },
              { label: "Novos Clientes", val: data.newClientsCount, icon: Users, color: "text-violet-600", bg: "bg-violet-50", isMoney: false, desc: "Últimos 7 dias" },
            ].map((kpi, i) => (
              <div key={i} className="bg-white rounded-[2rem] p-7 shadow-sm border border-slate-50 hover:shadow-xl transition-all group">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{kpi.label}</p>
                    <h3 className={`text-2xl font-black ${kpi.color}`}>
                      {kpi.isMoney === false ? kpi.val : formatMoney(kpi.val as number)}
                    </h3>
                  </div>
                  <div className={`${kpi.bg} ${kpi.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                    <kpi.icon size={24} />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-50">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{kpi.desc}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Gráficos e Tabelas */}
            <div className="lg:col-span-2 space-y-10">
              
              {/* Gráfico */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="font-black text-slate-800 text-lg uppercase tracking-widest">Fluxo de Vendas vs Custo</h2>
                  <div className="flex gap-4">
                    <span className="flex items-center gap-2 text-[10px] font-bold text-emerald-500"><div className="w-2 h-2 bg-emerald-500 rounded-full"/> ENTRADAS</span>
                    <span className="flex items-center gap-2 text-[10px] font-bold text-rose-500"><div className="w-2 h-2 bg-rose-500 rounded-full"/> CUSTOS</span>
                  </div>
                </div>
                <DashboardCharts data={data.chartData} />
              </div>

              {/* Tabela de Vendas Recentes */}
              <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-50">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                  <h2 className="font-black text-slate-800 uppercase tracking-widest text-sm">Últimas Vendas</h2>
                  <ArrowRight size={20} className="text-slate-300" />
                </div>
                <div className="overflow-x-auto px-4 pb-4">
                  <table className="table table-zebra w-full border-separate border-spacing-y-2">
                    <thead>
                      <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-none">
                        <th>Transação</th>
                        <th>Data/Hora</th>
                        <th>Status</th>
                        <th className="text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-10 text-slate-400 font-bold italic">
                            Nenhuma venda recente
                          </td>
                        </tr>
                      ) : (
                        data.recentTransactions.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                            <td className="font-mono text-[10px] font-bold text-slate-400 bg-slate-50/50 rounded-l-xl">#{t.id.slice(-6).toUpperCase()}</td>
                            <td className="text-xs font-bold text-slate-600">{t.date.toLocaleDateString()} <span className="opacity-40 ml-1">{t.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></td>
                            <td>
                              <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                                t.status === "COMPLETED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                t.status === "PENDING" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                "bg-rose-50 text-rose-600 border-rose-100"
                              }`}>
                                {t.status === "COMPLETED" ? "Pago" : t.status === "PENDING" ? "Pendente" : "Cancelado"}
                              </span>
                            </td>
                            <td className="text-right font-black text-emerald-600 bg-emerald-50/30 rounded-r-xl">
                              + {formatMoney(Number(t.total))}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Coluna Lateral */}
            <div className="space-y-10">
              
              <div className="bg-white rounded-[2.5rem] p-10 text-center shadow-sm border border-slate-50">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Performance Geral</h3>
                <div className="radial-progress text-primary font-black shadow-inner bg-slate-50/50" style={{ "--value": data.percent, "--size": "14rem", "--thickness": "14px" } as any}>
                  <div className="flex flex-col">
                    <span className="text-4xl">{data.percent.toFixed(0)}%</span>
                    <span className="text-[10px] opacity-40 uppercase tracking-widest mt-1">Giro LTV</span>
                  </div>
                </div>
                <div className="mt-8">
                  <p className="text-3xl font-black text-slate-800">{data.totalItemsSold}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Produtos vendidos (Total)</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Nova Venda", icon: PlusCircle, color: "bg-primary", href: "/registrarCompra" },
                  { label: "Estoque", icon: FileText, color: "bg-white border border-slate-100 text-slate-800", href: "/produtos" },
                  { label: "Clientes", icon: Users, color: "bg-white border border-slate-100 text-slate-800", href: "/clientes" },
                  { label: "Finanças", icon: DollarSign, color: "bg-white border border-slate-100 text-slate-800", href: "/financeiro" },
                ].map((btn, i) => (
                  <a key={i} href={btn.href} className={`${btn.color} p-6 rounded-3xl flex flex-col items-center gap-3 hover:-translate-y-1 transition-all shadow-sm hover:shadow-md ${btn.color.includes('bg-primary') ? 'text-white shadow-primary/30' : ''}`}>
                    <btn.icon size={28} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{btn.label}</span>
                  </a>
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