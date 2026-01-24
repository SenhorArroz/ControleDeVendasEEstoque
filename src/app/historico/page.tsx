import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { redirect } from "next/navigation";
import HistoryView, { type HistoryEvent } from "./history-view";
import SideBar from "../_components/SideBar";

export default async function HistoryPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = session.user.id;

  // Buscar dados em paralelo (Adicionei Products e Barcodes)
  const [purchases, expenses, clients, suppliers, products, barcodes] = await Promise.all([
    // 1. Vendas
    db.purchase.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 50,
      include: { client: true, items: true }
    }),
    
    // 2. Despesas
    db.despesas.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 50
    }),

    // 3. Clientes
    db.client.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    }),

    // 4. Fornecedores
    db.fornecedor.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    }),

    // 5. Produtos Criados (Novo)
    db.product.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: { fornecedor: true }
    }),

    // 6. Códigos de Barras Criados (Novo)
    db.codigoDeBarras.findMany({
      where: { product: { userId } }, // Filtra através da relação com Produto
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: { product: true }
    })
  ]);

  // --- UNIFICAÇÃO DOS DADOS ---
  const events: HistoryEvent[] = [];

  // Mapear Vendas
  purchases.forEach(p => {
    events.push({
      id: p.id,
      type: "SALE",
      date: p.date,
      title: `Venda para ${p.client.name}`,
      subtitle: `${p.items.length} produtos | Status: ${p.status}`,
      amount: Number(p.total),
      status: p.status,
      paymentMethod: p.metodoPagamento,
      details: { itemsCount: p.items.length }
    });
  });

  // Mapear Despesas
  expenses.forEach(e => {
    events.push({
      id: e.id,
      type: "EXPENSE",
      date: e.date,
      title: e.name,
      subtitle: e.description || "Sem descrição",
      amount: Number(e.value),
    });
  });

  // Mapear Clientes
  clients.forEach(c => {
    events.push({
      id: c.id,
      type: "NEW_CLIENT",
      date: c.createdAt,
      title: "Novo Cliente Cadastrado",
      subtitle: `${c.name} - ${c.phone || 'Sem telefone'}`,
    });
  });

  // Mapear Fornecedores
  suppliers.forEach(f => {
    events.push({
      id: f.id,
      type: "NEW_SUPPLIER",
      date: f.createdAt,
      title: "Novo Fornecedor Cadastrado",
      subtitle: `${f.name} - ${f.cnpj || 'Sem CNPJ'}`,
    });
  });

  // Mapear Produtos (Novo)
  products.forEach(prod => {
    events.push({
      id: prod.id,
      type: "NEW_PRODUCT",
      date: prod.createdAt,
      title: "Produto Adicionado ao Estoque",
      subtitle: `${prod.name} (SKU: ${prod.sku || 'N/A'}) - Fornecedor: ${prod.fornecedor?.name || 'N/A'}`,
      // Opcional: Mostrar custo de estoque inicial como valor negativo, se desejar
      // amount: Number(prod.precoCompra) * prod.stock 
    });
  });

  // Mapear Códigos de Barras (Novo)
  barcodes.forEach(bc => {
    events.push({
      id: bc.id,
      type: "NEW_BARCODE",
      date: bc.createdAt,
      title: "Código de Barras Registrado",
      subtitle: `Código: ${bc.code} → Item: ${bc.product.name}`,
    });
  });

  // Ordenar tudo cronologicamente
  events.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="drawer lg:drawer-open font-sans bg-base-200 min-h-screen">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <HistoryView events={events} />
      </div>
      <SideBar />
    </div>
  );
}