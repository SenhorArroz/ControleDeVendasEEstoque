import { 
    DollarSign, TrendingUp, TrendingDown, PieChart, 
    Calendar, ShoppingBag, ChevronLeft, ChevronRight, 
    FileText, Menu, Activity
} from "lucide-react";
import Link from "next/link";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import SideBar from "../_components/SideBar";
import FinancialChart from "../_components/FinancialChart";
import { AddExpenseButton, ExportButton } from "../_components/FinancialActions";
import { DeleteExpenseButton } from "../_components/ExpenseActions";

const ITEMS_PER_PAGE = 8;

// --- FUNÇÃO DE DADOS (SERVER SIDE) COM MATEMÁTICA BLINDADA ---
async function getFinancialData(userId: string, salesPage: number, expensesPage: number) {
    const salesSkip = (salesPage - 1) * ITEMS_PER_PAGE;
    const expensesSkip = (expensesPage - 1) * ITEMS_PER_PAGE;

    // 1. DADOS GERAIS (Busca Total)
    const [allSalesRaw, allExpensesRaw] = await Promise.all([
        db.purchase.findMany({
            where: { userId: userId, status: "COMPLETED" },
            include: { 
                items: { include: { product: true } }, 
                client: true 
            },
            orderBy: { date: 'asc' }
        }),
        db.despesas.findMany({
            where: { userId: userId },
            orderBy: { date: 'asc' }
        })
    ]);

    // 2. BUSCA PAGINADA (Vendas)
    const [paginatedSalesRaw, totalSalesCount] = await Promise.all([
        db.purchase.findMany({
            where: { userId, status: "COMPLETED" },
            include: { client: true, items: { include: { product: true } } },
            orderBy: { date: 'desc' },
            skip: salesSkip,
            take: ITEMS_PER_PAGE
        }),
        db.purchase.count({ where: { userId, status: "COMPLETED" } })
    ]);

    // 3. BUSCA PAGINADA (Despesas)
    const [paginatedExpensesRaw, totalExpensesCount] = await Promise.all([
        db.despesas.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            skip: expensesSkip,
            take: ITEMS_PER_PAGE
        }),
        db.despesas.count({ where: { userId } })
    ]);

    // --- SERIALIZAÇÃO BLINDADA (Prevenindo NaN) ---
    const safeAllSales = allSalesRaw.map(p => ({
        ...p,
        total: p.total ? Number(p.total.toString()) : 0,
        items: p.items.map(i => ({
            ...i,
            unitPrice: i.unitPrice ? Number(i.unitPrice.toString()) : 0,
            product: { 
                ...i.product, 
                precoCompra: i.product.precoCompra ? Number(i.product.precoCompra.toString()) : 0, 
                precoVenda: i.product.precoVenda ? Number(i.product.precoVenda.toString()) : 0 
            }
        }))
    }));

    const safeAllExpenses = allExpensesRaw.map(e => ({ ...e, value: e.value ? Number(e.value.toString()) : 0 }));

    const safePaginatedSales = paginatedSalesRaw.map(p => ({
        ...p,
        total: p.total ? Number(p.total.toString()) : 0,
        items: p.items.map(i => ({
            ...i,
            product: { 
                ...i.product, 
                precoCompra: i.product.precoCompra ? Number(i.product.precoCompra.toString()) : 0 
            }
        }))
    }));

    const safePaginatedExpenses = paginatedExpensesRaw.map(e => ({ ...e, value: e.value ? Number(e.value.toString()) : 0 }));

    // --- CÁLCULOS FINANCEIROS (KPIs) ---
    let totalFaturamento = 0;
    let totalCustoProdutos = 0;
    let totalDespesasOp = 0;
    const chartMap = new Map<string, { faturamento: number; custo: number; lucro: number }>();

    // Padronização do fuso horário para os gráficos
    const tzOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' };

    safeAllSales.forEach(p => {
        const val = p.total;
        let cost = 0;
        p.items.forEach(i => cost += i.quantity * i.product.precoCompra);
        totalFaturamento += val;
        totalCustoProdutos += cost;

        const key = p.date.toLocaleDateString('pt-BR', tzOptions);
        const curr = chartMap.get(key) || { faturamento: 0, custo: 0, lucro: 0 };
        chartMap.set(key, { 
            faturamento: curr.faturamento + val, 
            custo: curr.custo + cost, 
            lucro: curr.lucro + (val - cost) 
        });
    });

    safeAllExpenses.forEach(e => {
        const val = e.value;
        totalDespesasOp += val;
        const key = e.date.toLocaleDateString('pt-BR', tzOptions);
        const curr = chartMap.get(key) || { faturamento: 0, custo: 0, lucro: 0 };
        chartMap.set(key, { ...curr, custo: curr.custo + val, lucro: curr.lucro - val });
    });

    const chartData = Array.from(chartMap.entries()).map(([name, val]) => ({ name, ...val }));
    const custoTotal = totalCustoProdutos + totalDespesasOp;
    const lucroLiquido = totalFaturamento - custoTotal;
    const margem = totalFaturamento > 0 ? (lucroLiquido / totalFaturamento) * 100 : 0;

    return {
        stats: {
            faturamento: totalFaturamento,
            custo: custoTotal,
            lucro: lucroLiquido,
            margem: margem,
            totalVendas: safeAllSales.length,
            despesasOp: totalDespesasOp
        },
        sales: {
            data: safePaginatedSales,
            totalPages: Math.ceil(totalSalesCount / ITEMS_PER_PAGE),
            total: totalSalesCount
        },
        expenses: {
            data: safePaginatedExpenses,
            totalPages: Math.ceil(totalExpensesCount / ITEMS_PER_PAGE),
            total: totalExpensesCount
        },
        chartData,
        rawPurchases: safeAllSales,
        rawExpenses: safeAllExpenses
    };
}

// ------------------------------------------------------------------
// O COMPONENTE PRINCIPAL (page.tsx)
// ------------------------------------------------------------------
export default async function FinancialPage({ searchParams }: { searchParams: { salesPage?: string, expensesPage?: string } }) {
    const session = await auth();
    if (!session?.user) return null;

    const currentSalesPage = Number(searchParams?.salesPage) || 1;
    const currentExpensesPage = Number(searchParams?.expensesPage) || 1;
    
    const data = await getFinancialData(session.user.id, currentSalesPage, currentExpensesPage);

    const formatMoney = (val: number) => 
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="drawer lg:drawer-open bg-[#F8FAFC] font-sans min-h-screen">
            <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
            
            <div className="drawer-content flex flex-col">
                {/* Mobile Navbar */}
                <div className="w-full navbar bg-white lg:hidden border-b border-slate-100 px-6">
                    <label htmlFor="my-drawer-2" className="btn btn-ghost drawer-button lg:hidden">
                        <Menu className="w-6 h-6 text-primary" />
                    </label>
                    <div className="flex-1 font-black text-xl tracking-tighter">CASHFLOW</div>
                </div>

                <main className="flex-1 p-6 md:p-12 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
                    
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="space-y-1">
                            <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                                <DollarSign className="text-primary" size={36}/> Financeiro
                            </h1>
                            <p className="text-slate-500 font-medium italic">Visão consolidada de entradas, saídas e rentabilidade.</p>
                        </div>

                        <div className="flex flex-wrap gap-3 w-full md:w-auto">
                            <AddExpenseButton />
                            <ExportButton 
                                purchases={data.rawPurchases} 
                                expenses={data.rawExpenses} 
                                stats={data.stats} 
                            />
                        </div>
                    </div>

                    {/* KPIs Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {/* Faturamento */}
                        <div className="bg-white rounded-[2rem] p-7 shadow-sm border border-slate-50 hover:shadow-xl transition-all group">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Faturamento</p>
                                    <h3 className="text-2xl font-black text-blue-600">{formatMoney(data.stats.faturamento)}</h3>
                                </div>
                                <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                                    <DollarSign size={24} />
                                </div>
                            </div>
                        </div>

                        {/* Custos Totais */}
                        <div className="bg-white rounded-[2rem] p-7 shadow-sm border border-slate-50 hover:shadow-xl transition-all group">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Custos Totais</p>
                                    <h3 className="text-2xl font-black text-rose-600">{formatMoney(data.stats.custo)}</h3>
                                </div>
                                <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                                    <TrendingDown size={24} />
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-50">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Despesas Op: {formatMoney(data.stats.despesasOp)}</span>
                            </div>
                        </div>

                        {/* Lucro Líquido */}
                        <div className="bg-white rounded-[2rem] p-7 shadow-sm border border-slate-50 hover:shadow-xl transition-all group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
                            <div className="flex justify-between items-start pl-2">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Lucro Líquido</p>
                                    <h3 className="text-2xl font-black text-emerald-600">{formatMoney(data.stats.lucro)}</h3>
                                </div>
                                <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                                    <TrendingUp size={24} />
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-50 pl-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{data.stats.margem.toFixed(1)}% de Margem</span>
                            </div>
                        </div>

                        {/* Vendas (Quantidade) */}
                        <div className="bg-white rounded-[2rem] p-7 shadow-sm border border-slate-50 hover:shadow-xl transition-all group">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Vendas Realizadas</p>
                                    <h3 className="text-2xl font-black text-purple-600">{data.stats.totalVendas}</h3>
                                </div>
                                <div className="bg-purple-50 text-purple-600 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                                    <PieChart size={24} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gráfico Section */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="font-black text-slate-800 text-lg uppercase tracking-widest">Análise de Fluxo de Caixa</h2>
                            <div className="flex gap-4">
                                <span className="flex items-center gap-2 text-[10px] font-bold text-emerald-500"><div className="w-2 h-2 bg-emerald-500 rounded-full"/> FATURAMENTO</span>
                                <span className="flex items-center gap-2 text-[10px] font-bold text-rose-500"><div className="w-2 h-2 bg-rose-500 rounded-full"/> CUSTOS + DESPESAS</span>
                            </div>
                        </div>
                        <FinancialChart data={data.chartData} />
                    </div>

                    {/* --- GRID DE TABELAS LADO A LADO --- */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        
                        {/* TABELA DE VENDAS */}
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-50 flex flex-col h-full overflow-hidden">
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                                <h2 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"><ShoppingBag size={16} /></div>
                                    Entradas (Vendas)
                                </h2>
                                <span className="px-3 py-1 bg-slate-200 text-slate-600 rounded-lg text-[10px] font-black">{data.sales.total} Reg</span>
                            </div>
                            
                            <div className="overflow-x-auto flex-1 px-4 pb-2">
                                <table className="table w-full border-separate border-spacing-y-2">
                                    <thead>
                                        <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-none">
                                            <th className="pl-4">Data</th>
                                            <th>Cliente</th>
                                            <th className="text-right">Total</th>
                                            <th className="text-right pr-4">Lucro</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.sales.data.length === 0 ? (
                                            <tr><td colSpan={4} className="text-center py-10 text-slate-400 font-bold italic">Nenhuma entrada recente.</td></tr>
                                        ) : (
                                            data.sales.data.map((purchase: any) => {
                                                const total = purchase.total;
                                                const cost = purchase.items.reduce((acc: number, i: any) => acc + (i.quantity * i.product.precoCompra), 0);
                                                const profit = total - cost;
                                                return (
                                                    <tr key={purchase.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="font-mono text-[10px] font-bold text-slate-400 bg-slate-50/50 rounded-l-xl pl-4 py-4">{purchase.date.toLocaleDateString()}</td>
                                                        <td className="font-bold text-xs text-slate-700 truncate max-w-[120px]">{purchase.client.name}</td>
                                                        <td className="text-right font-black text-slate-900 text-xs">{formatMoney(total)}</td>
                                                        <td className={`text-right font-black text-xs pr-4 rounded-r-xl ${profit >= 0 ? 'text-emerald-600 bg-emerald-50/30' : 'text-rose-500 bg-rose-50/30'}`}>{formatMoney(profit)}</td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginação Vendas */}
                            <div className="p-6 border-t border-slate-50 flex justify-between items-center bg-white">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pág {currentSalesPage} de {data.sales.totalPages || 1}</div>
                                <div className="flex gap-2">
                                    <Link href={`?salesPage=${currentSalesPage - 1 > 0 ? currentSalesPage - 1 : 1}&expensesPage=${currentExpensesPage}`} className={`p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors ${currentSalesPage <= 1 ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <ChevronLeft size={16} />
                                    </Link>
                                    <Link href={`?salesPage=${currentSalesPage + 1 <= data.sales.totalPages ? currentSalesPage + 1 : currentSalesPage}&expensesPage=${currentExpensesPage}`} className={`p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors ${currentSalesPage >= data.sales.totalPages ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <ChevronRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* TABELA DE DESPESAS */}
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-50 flex flex-col h-full overflow-hidden">
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                                <h2 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-3">
                                    <div className="p-2 bg-rose-100 text-rose-600 rounded-xl"><FileText size={16} /></div>
                                    Saídas (Despesas)
                                </h2>
                                <span className="px-3 py-1 bg-slate-200 text-slate-600 rounded-lg text-[10px] font-black">{data.expenses.total} Reg</span>
                            </div>

                            <div className="overflow-x-auto flex-1 px-4 pb-2">
                                <table className="table w-full border-separate border-spacing-y-2">
                                    <thead>
                                        <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-none">
                                            <th className="pl-4">Data</th>
                                            <th>Descrição</th>
                                            <th className="text-right">Valor</th>
                                            <th className="w-8 pr-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.expenses.data.length === 0 ? (
                                            <tr><td colSpan={4} className="text-center py-10 text-slate-400 font-bold italic">Nenhuma saída recente.</td></tr>
                                        ) : (
                                            data.expenses.data.map((expense: any) => (
                                                <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="font-mono text-[10px] font-bold text-slate-400 bg-slate-50/50 rounded-l-xl pl-4 py-4">{expense.date.toLocaleDateString()}</td>
                                                    <td>
                                                        <div className="font-bold text-xs text-slate-700">{expense.name}</div>
                                                        <div className="text-[10px] font-medium text-slate-400 truncate max-w-[150px]">{expense.description || "Sem descrição"}</div>
                                                    </td>
                                                    <td className="text-right font-black text-rose-600 bg-rose-50/30 text-xs">- {formatMoney(expense.value)}</td>
                                                    <td className="text-right px-2 rounded-r-xl bg-rose-50/30">
                                                        <DeleteExpenseButton id={expense.id} />
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginação Despesas */}
                            <div className="p-6 border-t border-slate-50 flex justify-between items-center bg-white">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pág {currentExpensesPage} de {data.expenses.totalPages || 1}</div>
                                <div className="flex gap-2">
                                    <Link href={`?salesPage=${currentSalesPage}&expensesPage=${currentExpensesPage - 1 > 0 ? currentExpensesPage - 1 : 1}`} className={`p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors ${currentExpensesPage <= 1 ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <ChevronLeft size={16} />
                                    </Link>
                                    <Link href={`?salesPage=${currentSalesPage}&expensesPage=${currentExpensesPage + 1 <= data.expenses.totalPages ? currentExpensesPage + 1 : currentExpensesPage}`} className={`p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors ${currentExpensesPage >= data.expenses.totalPages ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <ChevronRight size={16} />
                                    </Link>
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