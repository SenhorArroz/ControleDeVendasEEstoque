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
					<div className="w-full navbar bg-white/80 backdrop-blur-md sticky top-0 z-40 lg:hidden border-b border-slate-200/50 px-4">
						<label htmlFor="my-drawer-2" className="btn btn-ghost btn-circle drawer-button lg:hidden">
							<Activity className="w-6 h-6 text-orange-600" strokeWidth={2.5} />
						</label>
						<div className="flex-1 font-black text-xl tracking-tighter text-slate-900 ml-2">CASHFLOW</div>
					</div>

					{/* Main Content Area */}
					<CategoryManager />
				</div>
				
				<SideBar />
			</div>
		</HydrateClient>
	);
}
