"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Importação correta do router
import {
	Mail,
	Package,
	Users,
	TrendingUp,
	Camera,
	Calendar,
	ArrowLeft,
	Phone,
	User,
	Type,
	AlertTriangle,
	ShieldAlert,
	Save,
} from "lucide-react";

import { api } from "~/trpc/react";
import { uploadRegistrationImage } from "~/app/actions/upload"; // Server Actions PODEM ser importadas aqui

// Tipagem dos dados que vêm do Pai (page.tsx)
type SettingsFormProps = {
	user: {
		name?: string | null;
		email?: string | null;
		image?: string | null;
		phone?: string | null;
		bio?: string | null;
		createdAt?: Date | string; // Ajuste conforme seu prisma
	};
	stats: {
		clients: number;
		products: number;
		sales: number;
	};
};

export function SettingsForm({ user, stats }: SettingsFormProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	// Inicializa o estado com os dados vindos do banco
	const [formData, setFormData] = useState({
		name: user.name || "",
		phone: user.phone || "",
		bio: user.bio || "",
		imagePreview: user.image || null,
		imageFile: null as File | null,
	});

	const deleteMutation = api.auth.deleteUser.useMutation({
		onError: (error) => {
			alert(error.message);
			setIsLoading(false);
		},
		onSuccess: () => {
			alert("Conta excluída com sucesso!");
			router.push("/"); // Atualiza a página para mostrar os dados novos
			setIsLoading(false);
		},
	});

	// OBS: Para "Configurações", o ideal seria uma mutation de UPDATE, não REGISTER.
	// Mantive sua lógica, mas saiba que 'register' geralmente cria novo user.
	const updateMutation = api.auth.updateUser.useMutation({
		onError: (error) => {
			alert(error.message);
			setIsLoading(false);
		},
		onSuccess: () => {
			alert("Perfil atualizado com sucesso!");
			router.refresh(); // Atualiza a página para mostrar os dados novos
			setIsLoading(false);
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			let uploadedImageUrl = formData.imagePreview; // Mantém a antiga se não mudar

			// PASSO A: Se tiver NOVO arquivo, faz upload
			if (formData.imageFile) {
				const data = new FormData();
				data.append("image", formData.imageFile);

				const uploadRes = await uploadRegistrationImage(data);
				if (uploadRes && uploadRes.success) {
					uploadedImageUrl = uploadRes.url;
				}
			}

			// PASSO B: Chama o backend (Ajuste para chamar update se tiver)
			await updateMutation.mutateAsync({
				name: formData.name,
				phone: formData.phone || undefined, // undefined se estiver vazio
				bio: formData.bio || undefined,
				image: uploadedImageUrl || undefined,
			});
		} catch (error) {
			console.error("Erro ao salvar:", error);
			alert("Ocorreu um erro ao salvar.");
		} finally {
			setIsLoading(false);
		}
	};

	// Handler para input de arquivo
	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setFormData({
				...formData,
				imageFile: file,
				imagePreview: URL.createObjectURL(file),
			});
		}
	};

	return (
		<div className="container mx-auto p-4 md:p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
			{/* Botão de Voltar */}
			<div>
				<Link
					href="/dashboard"
					className="btn btn-ghost gap-2 pl-0 hover:bg-transparent hover:underline text-base-content/70"
				>
					<ArrowLeft size={18} /> Voltar para Dashboard
				</Link>
			</div>

			{/* Cabeçalho */}
			<div className="flex flex-col gap-1 mb-4">
				<h1 className="text-3xl font-bold">Configurações de Perfil</h1>
				<p className="text-base-content/60">
					Gerencie suas informações pessoais e preferências da conta.
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
				{/* COLUNA ESQUERDA: Perfil */}
				<div className="card bg-base-100 shadow-xl border border-base-200 lg:col-span-1 sticky top-8 z-10">
					<div className="card-body items-center text-center">
						{/* Avatar Upload */}
						<div className="relative group cursor-pointer">
							<div className="avatar">
								<div className="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img
										src={formData.imagePreview || "/placeholder-user.jpg"}
										alt="Avatar"
										className="object-cover w-full h-full"
									/>
								</div>
							</div>
							{/* Input Invisível sobre o avatar */}
							<input
								type="file"
								accept="image/*"
								onChange={handleImageChange}
								className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
							/>
							<div className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg pointer-events-none group-hover:scale-110 transition-transform">
								<Camera size={18} />
							</div>
						</div>

						<h2 className="card-title mt-4 text-2xl">{user.name}</h2>
						<p className="text-sm text-base-content/60 mt-1 flex items-center gap-1">
							<Calendar size={14} /> Membro Ativo
						</p>

						<div className="divider my-4"></div>

						{/* Infos Laterais */}
						<div className="w-full space-y-3 text-left">
							<div className="flex items-center gap-3 p-3 bg-base-200/50 rounded-lg">
								<div className="p-2 bg-primary/10 rounded-full text-primary shrink-0">
									<Mail size={18} />
								</div>
								<div className="overflow-hidden min-w-0">
									<p className="text-xs text-base-content/50 uppercase font-bold">
										Email
									</p>
									<p
										className="font-medium text-sm truncate"
										title={user.email || ""}
									>
										{user.email}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-3 p-3 bg-base-200/50 rounded-lg">
								<div className="p-2 bg-secondary/10 rounded-full text-secondary shrink-0">
									<Phone size={18} />
								</div>
								<div className="overflow-hidden min-w-0">
									<p className="text-xs text-base-content/50 uppercase font-bold">
										Telefone
									</p>
									<p className="font-medium text-sm truncate">
										{formData.phone || "Não informado"}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* COLUNA DIREITA: Stats e Form */}
				<div className="lg:col-span-2 space-y-8">
					{/* Stats */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div className="stats shadow border border-base-200 bg-base-100">
							<div className="stat px-4">
								<div className="stat-figure text-primary hidden xl:block">
									<Users size={28} opacity={0.8} />
								</div>
								<div className="stat-title text-xs uppercase font-bold tracking-wider">
									Clientes
								</div>
								<div className="stat-value text-primary text-2xl">
									{stats.clients}
								</div>
							</div>
						</div>
						<div className="stats shadow border border-base-200 bg-base-100">
							<div className="stat px-4">
								<div className="stat-figure text-secondary hidden xl:block">
									<Package size={28} opacity={0.8} />
								</div>
								<div className="stat-title text-xs uppercase font-bold tracking-wider">
									Produtos
								</div>
								<div className="stat-value text-secondary text-2xl">
									{stats.products}
								</div>
							</div>
						</div>
						<div className="stats shadow border border-base-200 bg-base-100">
							<div className="stat px-4">
								<div className="stat-figure text-accent hidden xl:block">
									<TrendingUp size={28} opacity={0.8} />
								</div>
								<div className="stat-title text-xs uppercase font-bold tracking-wider">
									Vendas
								</div>
								<div className="stat-value text-accent text-2xl">
									{stats.sales}
								</div>
							</div>
						</div>
					</div>

					{/* Form */}
					<form
						onSubmit={handleSubmit}
						className="card bg-base-100 shadow-xl border border-base-200"
					>
						<div className="card-body pb-4">
							<h3 className="text-xl font-bold mb-6 flex items-center gap-2 pb-2 border-b border-base-200">
								<User size={20} className="text-primary" /> Informações Gerais
							</h3>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="form-control md:col-span-1">
									<label className="label">
										<span className="label-text font-medium">
											Nome Completo
										</span>
									</label>
									<label className="input input-bordered flex items-center gap-2 focus-within:input-primary">
										<User size={18} className="text-base-content/50" />
										<input
											type="text"
											className="grow"
											placeholder="Seu nome"
											value={formData.name}
											onChange={(e) =>
												setFormData({ ...formData, name: e.target.value })
											}
										/>
									</label>
								</div>
								<div className="form-control md:col-span-1">
									<label className="label">
										<span className="label-text font-medium">Telefone</span>
									</label>
									<label className="input input-bordered flex items-center gap-2 focus-within:input-primary">
										<Phone size={18} className="text-base-content/50" />
										<input
											type="tel"
											className="grow"
											placeholder="(00) 00000-0000"
											value={formData.phone}
											onChange={(e) =>
												setFormData({ ...formData, phone: e.target.value })
											}
										/>
									</label>
								</div>
								<div className="form-control md:col-span-2">
									<label className="label">
										<span className="label-text font-medium">
											Bio / Sobre mim
										</span>
										<span className="label-text-alt text-base-content/50">
											0/200
										</span>
									</label>
									<div className="relative">
										<textarea
											className="textarea textarea-bordered h-32 w-full focus:textarea-primary resize-none p-4"
											placeholder="Escreva sobre você..."
											value={formData.bio}
											onChange={(e) =>
												setFormData({ ...formData, bio: e.target.value })
											}
										></textarea>
										<Type
											size={16}
											className="absolute top-4 right-4 text-base-content/30"
										/>
									</div>
								</div>
							</div>

							<div className="card-actions justify-end mt-8 pt-4 border-t border-base-200">
								<button
									type="button"
									className="btn btn-ghost hover:bg-base-200"
									onClick={() => router.back()}
								>
									Descartar
								</button>
								<button
									type="submit"
									disabled={isLoading}
									className="btn btn-primary gap-2 shadow-lg shadow-primary/20"
								>
									{isLoading ? (
										"Salvando..."
									) : (
										<>
											<Save size={18} /> Salvar Alterações
										</>
									)}
								</button>
							</div>
						</div>
					</form>

					{/* Zona de Perigo */}
					<div className="card shadow-xl border border-error/20 bg-base-100 mt-8">
						<div className="card-body">
							<h3 className="text-xl font-bold flex items-center gap-2 text-error pb-2">
								<AlertTriangle size={22} /> Zona de Perigo
							</h3>
							<div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-2 p-4 bg-error/5 rounded-lg border border-error/10">
								<div>
									<h4 className="font-bold flex items-center gap-2 text-base-content">
										Deletar Conta
									</h4>
									<p className="text-sm text-base-content/60 mt-1 max-w-md">
										Esta ação é irreversível.
									</p>
								</div>
								<button
									type="button" // Importante ser type="button" para não submeter o form principal
									className="btn btn-error btn-outline w-full md:w-auto shrink-0"
									onClick={() =>
										(
											document.getElementById(
												"delete_modal",
											) as HTMLDialogElement
										).showModal()
									}
								>
									<ShieldAlert size={18} /> Excluir minha conta
								</button>
								<dialog
									id="delete_modal"
									className="modal modal-bottom sm:modal-middle backdrop-blur-sm"
								>
									<div className="modal-box p-0 overflow-hidden bg-base-100/90 backdrop-blur-xl border border-error/20 shadow-2xl shadow-error/10">
										{/* --- DECORAÇÃO SUPERIOR (Barra de perigo) --- */}
										<div className="h-2 w-full bg-error" />

										<div className="p-8 text-center">
											{/* 1. ÍCONE DE DESTAQUE ANIMADO */}
											<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-error/10 border-4 border-base-100 shadow-xl">
												<AlertTriangle
													className="h-10 w-10 text-error"
													strokeWidth={2}
												/>
											</div>

											{/* 2. TÍTULO E SUBTÍTULO */}
											<h3 className="text-2xl font-bold text-base-content mb-2">
												Tem certeza absoluta?
											</h3>

											<p className="text-base-content/60 text-sm mb-6 max-w-xs mx-auto">
												Esta ação excluirá permanentemente sua conta e não
												poderá ser desfeita.
											</p>

											{/* 3. CARD DE ALERTA (Zona de Impacto) */}
											<div className="bg-error/5 border border-error/10 rounded-xl p-4 mb-8 text-left flex gap-3">
												<ShieldAlert className="w-5 h-5 text-error shrink-0 mt-0.5" />
												<div className="text-sm">
													<span className="font-bold text-error block mb-1">
														O que será perdido:
													</span>
													<ul className="list-disc list-inside text-base-content/70 space-y-1 text-xs">
														<li>Todos os seus clientes cadastrados.</li>
														<li>Todo o histórico de vendas e relatórios.</li>
														<li>Acesso imediato ao painel.</li>
													</ul>
												</div>
											</div>

											{/* 4. AÇÕES */}
											<div className="modal-action flex flex-col sm:flex-row gap-3 justify-center mt-0">
												{/* Botão Confirmar (Destaque) */}
												<button
													className="btn btn-error w-full sm:w-auto text-white shadow-lg shadow-error/20 hover:shadow-error/40 transition-all gap-2"
													onClick={() => deleteMutation.mutate()}
													disabled={deleteMutation.isPending}
												>
													{deleteMutation.isPending ? (
														<>
															<span className="loading loading-spinner loading-sm"></span>
															Excluindo...
														</>
													) : (
														<>Sim, excluir minha conta</>
													)}
												</button>

												{/* Botão Cancelar (Discreto) */}
												<form method="dialog" className="w-full sm:w-auto">
													<button className="btn btn-ghost w-full border border-base-content/10 hover:bg-base-200">
														Cancelar, quero ficar
													</button>
												</form>
											</div>
										</div>
									</div>

									{/* Clica fora para fechar */}
									<form
										method="dialog"
										className="modal-backdrop bg-base-300/30"
									>
										<button>close</button>
									</form>
								</dialog>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
