import { api, HydrateClient } from "~/trpc/server";
import CategoryManager from "./_components/CategoryManager";

export default async function Page() {
	await api.categoria.getAll.prefetch();

	return (
		<HydrateClient>
			<CategoryManager />
		</HydrateClient>
	);
}
