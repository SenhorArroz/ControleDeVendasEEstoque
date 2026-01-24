import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { notFound, redirect } from "next/navigation";
import SideBar from "../../_components/SideBar";
import ProductDetailClient from "./_components/ProductDetailClient";

// 1. Definição da tipagem correta para Next.js 15
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailsPage({ params }: PageProps) {
  // 2. Await nos parâmetros antes de ler o ID
  const { id } = await params;

  const session = await auth();
  if (!session) redirect("/login");

  // Busca completa do produto no banco
  const product = await db.product.findUnique({
    where: { 
      id: id, // Usamos a variável extraída do await
      userId: session.user.id // Garantia de segurança
    },
    include: {
      fornecedor: true,
      categories: true,
      codeBarras: true,
      _count: {
        select: { purchaseItems: true } // Quantidade de vendas realizadas
      }
    }
  });

  if (!product) notFound();

  return (
    <div className="drawer lg:drawer-open font-sans bg-base-200">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col min-h-screen">
        <ProductDetailClient product={JSON.parse(JSON.stringify(product))} />
      </div>
      <SideBar />
    </div>
  );
}