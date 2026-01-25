import "~/styles/globals.css";
import { ThemeProvider } from "next-themes";

import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
	title: "CashFlow ",
	description: "Programa de gerenciamento de finanças, caixa e mercado, centralizado, moderno e otimizado.",
	icons: [{ rel: "icon", url: "/icon.ico" }],
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html className={`${geist.variable}`} lang="pt-br" suppressHydrationWarning>
			<body>
				<ThemeProvider attribute="data-theme"
				defaultTheme="light"
				enableSystem
				>
					<TRPCReactProvider>{children}</TRPCReactProvider>
				</ThemeProvider>
			</body>
		</html>
		
	);
}
