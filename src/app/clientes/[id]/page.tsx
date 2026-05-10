import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { notFound, redirect } from "next/navigation";
import ClientView from "./client-view";
import SideBar from "../../_components/SideBar";

export default async function ClientDetailsPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect("/login");

  const client = await db.client.findUnique({
    where: { id: params.id, userId: session.user.id },
    include: {
      purchases: {
        orderBy: { date: "desc" },
        include: {
          items: { include: { product: true } }
        }
      }
    }
  });

  if (!client) notFound();

  const serializedClient = JSON.parse(JSON.stringify(client));

  return (
    <div className="drawer lg:drawer-open font-sans bg-base-200 min-h-screen">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      
      {/* Passa o cliente serializado */}
      <ClientView client={serializedClient} /> 
      
      <SideBar />
    </div>
  );
}