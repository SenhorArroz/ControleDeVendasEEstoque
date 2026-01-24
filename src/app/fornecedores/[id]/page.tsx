import { api } from "~/trpc/server";
import { notFound } from "next/navigation";
import FornecedorDetailClient from "./client";

export default async function FornecedorPage({ params }: { params: { id: string } }) {
  const supplier = await api.fornecedor.getById({ id: params.id });

  if (!supplier) {
    return notFound();
  }

  return <FornecedorDetailClient supplier={supplier} />;
}