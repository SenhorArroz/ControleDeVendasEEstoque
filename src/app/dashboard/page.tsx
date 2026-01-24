import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  PlusCircle,
  FileText,
  Users,
  ArrowRight,
} from "lucide-react";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import SideBar from "../_components/SideBar";
import DashboardCharts from "../_components/DashboardCharts";
import { api } from "~/trpc/server";

// Função para buscar dados reais do Banco
async function getDashboardData(userId: string) {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // --- NOVAS FUNÇÕES PEDIDAS ---
  // Busca o total histórico de entradas e saídas
  const somaLifetimeStock = await api.produto.somaLifetimeStock();
  const itensVendidosCont = await api.compra.itensVendidosCont();

  // Cálculo da Porcentagem (Sell-through Rate)
  // Lógica: (Vendidos / Total que já entrou) * 100
  let percent = 0;
  if (somaLifetimeStock > 0) {
    percent = (itensVendidosCont / somaLifetimeStock) * 100;
  }
  // -----------------------------

  // 1. Buscar Vendas Completas dos últimos 7 dias
  const purchases = await db.purchase.findMany({
    where: {
      userId: userId,
      date: { gte: sevenDaysAgo },
      status: "COMPLETED",
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

  // 2. Agrupar dados por dia para o gráfico
  const chartMap = new Map<string, { entrada: number; saida: number }>();

  // Inicializa os últimos 7 dias com zero
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const key = d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
    chartMap.set(key, { entrada: 0, saida: 0 });
  }

  let receitaTotal = 0;
  let custoTotal = 0;

  purchases.forEach((p) => {
    const key = p.date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
    const current = chartMap.get(key) || { entrada: 0, saida: 0 };

    const vendaTotal = Number(p.total);
    // Calcula o custo dessa venda (Qtd * Preço de Compra do Produto)
    const custoVenda = p.items.reduce((acc, item) => {
      return acc + item.quantity * Number(item.product.precoCompra);
    }, 0);

    receitaTotal += vendaTotal;
    custoTotal += custoVenda;

    chartMap.set(key, {
      entrada: current.entrada + vendaTotal,
      saida: current.saida + custoVenda,
    });
  });

  // Converter Map para Array
  const chartData = Array.from(chartMap.entries()).map(([name, val]) => ({
    name,
    ...val,
  }));

  // 3. Buscar contagem de novos clientes na semana
  const newClientsCount = await db.client.count({
    where: { userId: userId, createdAt: { gte: sevenDaysAgo } },
  });

  return {
    chartData,
    receitaTotal,
    custoTotal,
    lucro: receitaTotal - custoTotal,
    newClientsCount,
    totalItemsSold: itensVendidosCont, // Usando o valor da API
    percent, // Passando a porcentagem calculada
    recentTransactions: purchases.slice(-5).reverse(),
  };
}

export default async function DashboardClient() {
  const session = await auth();

  // Se não tiver sessão, não carrega dados
  if (!session?.user) return null;

  // Busca dados do servidor
  const data = await getDashboardData(session.user.id);

  const formatMoney = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);

  return (
    <div className="drawer lg:drawer-open bg-base-200 font-sans">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col min-h-screen">
        {/* Navbar Mobile */}
        <div className="w-full navbar bg-base-100 lg:hidden shadow-sm z-50">
          <div className="flex-none">
            <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-6 h-6 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </label>
          </div>
          <div className="flex-1 px-2 mx-2 font-bold text-xl text-primary">
            CashFlow
          </div>
          <div className="flex-none">
            <div className="avatar">
              <div className="w-8 rounded-full">
                <img
                  src={
                    session.user.image ||
                    "https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
                  }
                  alt="Avatar"
                />
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 p-4 md:p-8 space-y-8 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-base-content">
                Visão Geral
              </h1>
              <p className="text-base-content/60 text-sm">
                Bem-vindo de volta,{" "}
                <span className="text-primary font-bold">
                  {session.user.name}
                </span>
                . Resumo dos últimos 7 dias.
              </p>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold uppercase opacity-50">
                Data de Hoje
              </p>
              <p className="font-mono text-sm">
                {new Date().toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </div>
          </div>

          {/* KPIs - Dados Reais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="stats shadow-sm bg-base-100 border-l-4 border-success overflow-visible">
              <div className="stat">
                <div className="stat-figure text-success bg-success/10 p-3 rounded-full">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="stat-title text-base-content/70 font-medium">
                  Receita (7 dias)
                </div>
                <div className="stat-value text-success text-2xl">
                  {formatMoney(data.receitaTotal)}
                </div>
                <div className="stat-desc text-success font-bold">
                  Vendas realizadas
                </div>
              </div>
            </div>

            <div className="stats shadow-sm bg-base-100 border-l-4 border-error overflow-visible">
              <div className="stat">
                <div className="stat-figure text-error bg-error/10 p-3 rounded-full">
                  <TrendingDown className="w-6 h-6" />
                </div>
                <div className="stat-title text-base-content/70 font-medium">
                  Custo Estimado
                </div>
                <div className="stat-value text-error text-2xl">
                  {formatMoney(data.custoTotal)}
                </div>
                <div className="stat-desc text-error font-bold">
                  Baseado no preço de compra
                </div>
              </div>
            </div>

            <div className="stats shadow-sm bg-base-100 border-l-4 border-primary overflow-visible">
              <div className="stat">
                <div className="stat-figure text-primary bg-primary/10 p-3 rounded-full">
                  <Wallet className="w-6 h-6" />
                </div>
                <div className="stat-title text-base-content/70 font-medium">
                  Lucro Bruto
                </div>
                <div className="stat-value text-primary text-2xl">
                  {formatMoney(data.lucro)}
                </div>
                <div className="stat-desc">Receita - Custo</div>
              </div>
            </div>

            <div className="stats shadow-sm bg-base-100 border-l-4 border-secondary overflow-visible">
              <div className="stat">
                <div className="stat-figure text-secondary bg-secondary/10 p-3 rounded-full">
                  <Users className="w-6 h-6" />
                </div>
                <div className="stat-title text-base-content/70 font-medium">
                  Novos Clientes
                </div>
                <div className="stat-value text-secondary text-2xl">
                  {data.newClientsCount}
                </div>
                <div className="stat-desc">Últimos 7 dias</div>
              </div>
            </div>
          </div>

          {/* Gráfico e Tabela */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Gráfico */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="card-title text-lg">
                      Fluxo de Vendas vs Custo
                    </h2>
                    <span className="badge badge-neutral">Últimos 7 dias</span>
                  </div>
                  <DashboardCharts data={data.chartData} />
                </div>
              </div>

              {/* Tabela de Transações Recentes */}
              <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body p-0">
                  <div className="p-5 border-b border-base-200 flex justify-between items-center">
                    <h2 className="font-bold text-lg">Últimas Vendas</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra">
                      <thead>
                        <tr className="bg-base-200/50">
                          <th>ID</th>
                          <th>Data</th>
                          <th>Status</th>
                          <th className="text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.recentTransactions.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="text-center py-4 text-base-content/50"
                            >
                              Nenhuma venda recente
                            </td>
                          </tr>
                        ) : (
                          data.recentTransactions.map((t) => (
                            <tr key={t.id} className="hover:bg-base-200/30">
                              <td className="font-mono text-xs opacity-70">
                                ...{t.id.slice(-6)}
                              </td>
                              <td className="text-sm">
                                {t.date.toLocaleDateString()}{" "}
                                <span className="text-xs opacity-50">
                                  {t.date.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </td>
                              <td>
                                <div className="badge badge-sm badge-success badge-outline font-bold">
                                  {t.status}
                                </div>
                              </td>
                              <td className="text-right font-bold font-mono text-success">
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
            </div>

            {/* Coluna Direita: Atalhos */}
            <div className="space-y-6">
              <div className="card bg-primary text-primary-content shadow-lg shadow-primary/20">
                <div className="card-body">
                  <h2 className="card-title text-white mb-4">Ações Rápidas</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href="/registrarCompra"
                      className="btn btn-sm bg-white/20 border-none text-white hover:bg-white/30 h-auto py-3 flex flex-col gap-1"
                    >
                      <PlusCircle className="w-6 h-6" />
                      <span>Nova Venda</span>
                    </a>
                    <a
                      href="/produtos"
                      className="btn btn-sm bg-white/20 border-none text-white hover:bg-white/30 h-auto py-3 flex flex-col gap-1"
                    >
                      <FileText className="w-6 h-6" />
                      <span>Produtos</span>
                    </a>
                    <a
                      href="/clientes"
                      className="btn btn-sm bg-white/20 border-none text-white hover:bg-white/30 h-auto py-3 flex flex-col gap-1"
                    >
                      <Users className="w-6 h-6" />
                      <span>Clientes</span>
                    </a>
                    <a
                      href="/financeiro"
                      className="btn btn-sm bg-white/20 border-none text-white hover:bg-white/30 h-auto py-3 flex flex-col gap-1"
                    >
                      <Wallet className="w-6 h-6" />
                      <span>Financeiro</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* CARD DE PERFORMANCE (CORRIGIDO) */}
              <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body p-5">
                  <h3 className="font-bold text-lg mb-1">Performance Geral</h3>
                  <p className="text-xs text-base-content/60 mb-4">
                    Itens vendidos no total
                  </p>

                  <div className="flex items-center gap-4">
                    <div
                      className="radial-progress text-primary font-bold text-lg transition-all duration-1000"
                      // @ts-ignore
                      style={{ "--value": data.percent }} 
                      role="progressbar"
                    >
                      {data.percent.toFixed(0)}%
                    </div>
                    <div>
                      <p className="font-bold text-2xl">
                        {data.totalItemsSold}
                      </p>
                      <p className="text-xs opacity-60">
                        Produtos vendidos desde o início
                      </p>
                    </div>
                  </div>

                  <div className="divider my-2"></div>
                  <button className="btn btn-outline btn-sm btn-block gap-2">
                    Ver Relatórios <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="card bg-base-200 border-dashed border-2 border-base-300">
                <div className="card-body p-5 text-center">
                  <DollarSign className="w-10 h-10 mx-auto text-base-content/30 mb-2" />
                  <h3 className="font-bold text-sm">Controle de Caixa</h3>
                  <p className="text-xs text-base-content/60">
                    O valor de "Saída" é calculado automaticamente com base no
                    preço de custo dos produtos vendidos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <SideBar />
    </div>
  );
}