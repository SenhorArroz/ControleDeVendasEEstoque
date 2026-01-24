"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react"; // Supondo que você usa lucide-react

export default function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// Evita erro de hidratação (garante que só roda no cliente)
	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		// Renderiza um espaço vazio do mesmo tamanho para não "pular" a tela
		return <div className="w-8 h-8" />;
	}

	return (
		<button
			onClick={() => setTheme(theme === "light" ? "dark" : "light")}
			className="btn btn-ghost btn-circle"
		>
			{theme === "dark" ? (
				<Moon className="w-6 h-6 text-white " /> // Lua amarela no escuro
			) : (
				<Sun className="w-6 h-6 text-black" /> // Sol laranja no claro
			)}
		</button>
	);
}
