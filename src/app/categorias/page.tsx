
import MobileNav from "../_components/MobileNav";
import { api, HydrateClient } from "~/trpc/server";
import CategoryManager from "./_components/CategoryManager";
import SideBar from "~/app/_components/SideBar";
import { Activity } from "lucide-react";

export default async function Page() {
	await api.categoria.getAll.prefetch();

	return (
		<HydrateClient>
			<div className="drawer lg:drawer-open bg-slate-50 font-sans selection:bg-orange-600/20">
				<input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
				
				<div className="drawer-content flex flex-col min-h-screen min-w-0">
					{/* Navbar Mobile Premium */}
					<MobileNav />

					{/* Main Content Area */}
					<CategoryManager />
				</div>
				
				<SideBar />
			</div>
		</HydrateClient>
	);
}
