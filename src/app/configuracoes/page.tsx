import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { getUser } from "~/server/actions/user";
import { getClientsCount } from "~/server/actions/client";
import { getProductsCount } from "~/server/actions/product";
import { getSalesCount } from "~/server/actions/sale";
import { SettingsForm } from "./_components/ConfigPainel"; // Importa o componente que criamos acima

export default async function SettingsPage() {
    // 1. Busca sessão e protege rota
    const session = await auth();
    if (!session || !session.user?.id) {
        redirect("/login");
    }

    // 2. Busca dados em paralelo (mais rápido)
    const [user, clients, products, sales] = await Promise.all([
        getUser(session.user.id),
        getClientsCount(),  // Assumindo que essas funções não precisam de argumento ou pegam contexto
        getProductsCount(),
        getSalesCount(),
    ]);

    // 3. Monta objeto de estatísticas
    const stats = {
        clients: typeof clients === 'number' ? clients : 0,
        products: typeof products === 'number' ? products : 0,
        sales: typeof sales === 'number' ? sales : 0,
    };

    // 4. Passa tudo para o componente cliente renderizar
    // Se getUser retornar null (raro se tem sessão), passamos um objeto vazio ou tratamos
    if (!user) return <div>Usuário não encontrado</div>;

    return <SettingsForm user={user} stats={stats} />;
}