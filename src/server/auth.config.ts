// src/server/auth.config.ts
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    providers: [],
    callbacks: {
        async jwt({ token, user }) {
                console.log(">>> AGORA O LOG TEM QUE APARECER:", user?.email);
            if (user) {
                token.sub = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.sub as string;
                session.user.role = token.role as "FUNCIONARIO" | "ADMIN";
            }
            return session;
        },
        // CERTIFIQUE-SE de que NÃO existe 'async' aqui antes de ({ auth... })
        authorized({ auth, request: { nextUrl } }) {
            const user = auth?.user;
            const isLoggedIn = !!user;
            const role = user?.role; // O cargo deve vir do JWT automaticamente
            const { pathname } = nextUrl;
            console.log("--- DEBUG MIDDLEWARE ---");
            console.log("Email:", auth?.user?.email);
            console.log("Role na Sessão:", role);

            const adminOnlyRoutes = [
                "/dashboard",
                "/funcionarios",
                "/clientes",
                "/produtos",
                "/financeiros",
                "/configuracoes"
            ];

            const isAdminRoute = adminOnlyRoutes.some(route => pathname.startsWith(route));
            const isProtectedRoute = isAdminRoute || pathname.startsWith("/registrarCompra");

            // Lógica de proteção
            if (isProtectedRoute && !isLoggedIn) {
                return false; // Redireciona para /login
            }

            if (isAdminRoute && role !== "ADMIN") {
                return Response.redirect(new URL("/registrarCompra", nextUrl));
            }

            return true;
        },
    },
} satisfies NextAuthConfig;