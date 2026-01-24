import { 
    DollarSign, TrendingUp, TrendingDown, PieChart, 
    Calendar, ShoppingBag, ChevronLeft, ChevronRight, 
    FileText 
} from "lucide-react";
import Link from "next/link";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import SideBar from "../_components/SideBar";
import FinancialChart from "../_components/FinancialChart";
import { AddExpenseButton, ExportButton } from "../_components/FinancialActions";
import { DeleteExpenseButton } from "../_components/ExpenseActions";

const ITEMS_PER_PAGE = 8; // Reduzi um pouco para caber melhor lado a lado

// --- FUNÇÃO DE DADOS (SERVER SIDE) ---
async function getFinancialData(userId: string, salesPage: number, expensesPage: number) {
    const salesSkip = (salesPage - 1) * ITEMS_PER_PAGE;
    const expensesSkip = (expensesPage - 1) * ITEMS_PER_PAGE;

    // 1. DADOS GERAIS (Para Gráficos e KPIs - Busca Total)
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

    // --- SERIALIZAÇÃO (Decimal -> Number) ---
    const safeAllSales = allSalesRaw.map(p => ({
        ...p,
        total: Number(p.total),
        items: p.items.map(i => ({
            ...i,
            unitPrice: Number(i.unitPrice),
            product: { ...i.product, precoCompra: Number(i.product.precoCompra), precoVenda: Number(i.product.precoVenda) }
        }))
    }));

    const safeAllExpenses = allExpensesRaw.map(e => ({ ...e, value: Number(e.value) }));

    const safePaginatedSales = paginatedSalesRaw.map(p => ({
        ...p,
        total: Number(p.total),
        items: p.items.map(i => ({
            ...i,
            product: { ...i.product, precoCompra: Number(i.product.precoCompra) }
        }))
    }));

    const safePaginatedExpenses = paginatedExpensesRaw.map(e => ({ ...e, value: Number(e.value) }));

    // --- CÁLCULOS FINANCEIROS (KPIs) ---
    let totalFaturamento = 0;
    let totalCustoProdutos = 0;
    let totalDespesasOp = 0;
    const chartMap = new Map<string, { faturamento: number; custo: number; lucro: number }>();

    safeAllSales.forEach(p => {
        const val = p.total;
        let cost = 0;
        p.items.forEach(i => cost += i.quantity * i.product.precoCompra);
        totalFaturamento += val;
        totalCustoProdutos += cost;

        const key = p.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
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
        const key = e.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
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

export default async function FinancialPage({ searchParams }: { searchParams: { salesPage?: string, expensesPage?: string } }) {
    const session = await auth();
    if (!session?.user) return null;

    const currentSalesPage = Number(searchParams?.salesPage) || 1;
    const currentExpensesPage = Number(searchParams?.expensesPage) || 1;
    
    const data = await getFinancialData(session.user.id, currentSalesPage, currentExpensesPage);

    const formatMoney = (val: number) => 
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="drawer lg:drawer-open bg-base-200 font-sans min-h-screen">
            <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
            
            <div className="drawer-content flex flex-col">
                <main className="flex-1 p-4 md:p-8 space-y-8 overflow-y-auto">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-base-content">Painel Financeiro</h1>
                            <p className="text-base-content/60 text-sm">Visão consolidada de entradas e saídas.</p>
                        </div>
                        <div className="flex gap-2">
                            <AddExpenseButton />
                            <ExportButton 
                                purchases={data.rawPurchases} 
                                expenses={data.rawExpenses} 
                                stats={data.stats} 
                            />
                        </div>
                    </div>

                    {/* KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="stats shadow-sm bg-base-100 border-l-4 border-blue-500 overflow-visible">
                            <div className="stat">
                                <div className="stat-figure text-blue-500 bg-blue-50 p-2 rounded-full"><DollarSign className="w-6 h-6" /></div>
                                <div className="stat-title font-bold opacity-70">Faturamento</div>
                                <div className="stat-value text-blue-600 text-2xl">{formatMoney(data.stats.faturamento)}</div>
                            </div>
                        </div>
                        <div className="stats shadow-sm bg-base-100 border-l-4 border-red-500 overflow-visible">
                            <div className="stat">
                                <div className="stat-figure text-red-500 bg-red-50 p-2 rounded-full"><TrendingDown className="w-6 h-6" /></div>
                                <div className="stat-title font-bold opacity-70">Custos Totais</div>
                                <div className="stat-value text-red-600 text-2xl">{formatMoney(data.stats.custo)}</div>
                                <div className="stat-desc text-xs mt-1">Despesas: {formatMoney(data.stats.despesasOp)}</div>
                            </div>
                        </div>
                        <div className="stats shadow-sm bg-base-100 border-l-4 border-emerald-500 overflow-visible">
                            <div className="stat">
                                <div className="stat-figure text-emerald-500 bg-emerald-50 p-2 rounded-full"><TrendingUp className="w-6 h-6" /></div>
                                <div className="stat-title font-bold opacity-70">Lucro Líquido</div>
                                <div className="stat-value text-emerald-600 text-2xl">{formatMoney(data.stats.lucro)}</div>
                                <div className="stat-desc font-bold text-emerald-600">{data.stats.margem.toFixed(1)}% margem</div>
                            </div>
                        </div>
                        <div className="stats shadow-sm bg-base-100 border-l-4 border-purple-500 overflow-visible">
                            <div className="stat">
                                <div className="stat-figure text-purple-500 bg-purple-50 p-2 rounded-full"><PieChart className="w-6 h-6" /></div>
                                <div className="stat-title font-bold opacity-70">Vendas</div>
                                <div className="stat-value text-purple-600 text-2xl">{data.stats.totalVendas}</div>
                            </div>
                        </div>
                    </div>

                    {/* Gráfico */}
                    <div className="card bg-base-100 shadow-md border border-base-200">
                        <div className="card-body p-6">
                            <h2 className="card-title text-lg mb-4">Fluxo de Caixa (Faturamento vs Despesas + Custo)</h2>
                            <FinancialChart data={data.chartData} />
                        </div>
                    </div>

                    {/* --- GRID DE TABELAS LADO A LADO --- */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        
                        {/* TABELA DE VENDAS */}
                        <div className="card bg-base-100 shadow-md border border-base-200 flex flex-col h-full">
                            <div className="p-5 border-b border-base-200 flex justify-between items-center bg-base-100 rounded-t-2xl">
                                <h2 className="font-bold text-lg flex items-center gap-2 text-primary">
                                    <ShoppingBag className="w-5 h-5" /> Entradas (Vendas)
                                </h2>
                                <span className="badge badge-sm">{data.sales.total} Total</span>
                            </div>
                            
                            <div className="overflow-x-auto flex-1">
                                <table className="table table-sm table-zebra w-full">
                                    <thead>
                                        <tr className="bg-base-200/50 text-base-content/70">
                                            <th>Data</th>
                                            <th>Cliente</th>
                                            <th className="text-right">Total</th>
                                            <th className="text-right">Lucro</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.sales.data.length === 0 ? (
                                            <tr><td colSpan={4} className="text-center py-8 opacity-50">Nenhuma venda.</td></tr>
                                        ) : (
                                            data.sales.data.map((purchase: any) => {
                                                const total = purchase.total;
                                                const cost = purchase.items.reduce((acc: number, i: any) => acc + (i.quantity * i.product.precoCompra), 0);
                                                const profit = total - cost;
                                                return (
                                                    <tr key={purchase.id} className="hover:bg-base-100">
                                                        <td className="font-mono text-xs">{purchase.date.toLocaleDateString()}</td>
                                                        <td className="font-bold text-xs truncate max-w-[100px]">{purchase.client.name}</td>
                                                        <td className="text-right font-bold text-primary text-xs">{formatMoney(total)}</td>
                                                        <td className={`text-right font-medium text-xs ${profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{formatMoney(profit)}</td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginação Vendas */}
                            <div className="p-3 border-t border-base-200 flex justify-between items-center bg-base-100">
                                <div className="text-[10px] opacity-50">Pág {currentSalesPage}</div>
                                <div className="join shadow-sm scale-90 origin-right">
                                    <Link href={`?salesPage=${currentSalesPage - 1 > 0 ? currentSalesPage - 1 : 1}&expensesPage=${currentExpensesPage}`} className={`join-item btn btn-xs ${currentSalesPage <= 1 ? 'btn-disabled' : ''}`}>
                                        <ChevronLeft className="w-3 h-3" />
                                    </Link>
                                    <Link href={`?salesPage=${currentSalesPage + 1 <= data.sales.totalPages ? currentSalesPage + 1 : currentSalesPage}&expensesPage=${currentExpensesPage}`} className={`join-item btn btn-xs ${currentSalesPage >= data.sales.totalPages ? 'btn-disabled' : ''}`}>
                                        <ChevronRight className="w-3 h-3" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* TABELA DE DESPESAS */}
                        <div className="card bg-base-100 shadow-md border border-base-200 flex flex-col h-full">
                            <div className="p-5 border-b border-base-200 flex justify-between items-center bg-base-100 rounded-t-2xl">
                                <h2 className="font-bold text-lg flex items-center gap-2 text-error">
                                    <FileText className="w-5 h-5" /> Saídas (Despesas)
                                </h2>
                                <span className="badge badge-sm">{data.expenses.total} Total</span>
                            </div>

                            <div className="overflow-x-auto flex-1">
                                <table className="table table-sm table-zebra w-full">
                                    <thead>
                                        <tr className="bg-base-200/50 text-base-content/70">
                                            <th>Data</th>
                                            <th>Descrição</th>
                                            <th className="text-right">Valor</th>
                                            <th className="w-8"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.expenses.data.length === 0 ? (
                                            <tr><td colSpan={4} className="text-center py-8 opacity-50">Nenhuma despesa.</td></tr>
                                        ) : (
                                            data.expenses.data.map((expense: any) => (
                                                <tr key={expense.id} className="hover:bg-base-100">
                                                    <td className="font-mono text-xs">{expense.date.toLocaleDateString()}</td>
                                                    <td className="text-xs">
                                                        <div className="font-bold">{expense.name}</div>
                                                        <div className="opacity-70 truncate max-w-[150px]">{expense.description}</div>
                                                    </td>
                                                    <td className="text-right font-bold text-error text-xs">- {formatMoney(expense.value)}</td>
                                                    <td className="text-right px-1">
                                                        <DeleteExpenseButton id={expense.id} />
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginação Despesas */}
                            <div className="p-3 border-t border-base-200 flex justify-between items-center bg-base-100">
                                <div className="text-[10px] opacity-50">Pág {currentExpensesPage}</div>
                                <div className="join shadow-sm scale-90 origin-right">
                                    <Link href={`?salesPage=${currentSalesPage}&expensesPage=${currentExpensesPage - 1 > 0 ? currentExpensesPage - 1 : 1}`} className={`join-item btn btn-xs ${currentExpensesPage <= 1 ? 'btn-disabled' : ''}`}>
                                        <ChevronLeft className="w-3 h-3" />
                                    </Link>
                                    <Link href={`?salesPage=${currentSalesPage}&expensesPage=${currentExpensesPage + 1 <= data.expenses.totalPages ? currentExpensesPage + 1 : currentExpensesPage}`} className={`join-item btn btn-xs ${currentExpensesPage >= data.expenses.totalPages ? 'btn-disabled' : ''}`}>
                                        <ChevronRight className="w-3 h-3" />
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