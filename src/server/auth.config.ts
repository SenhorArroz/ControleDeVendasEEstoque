import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [], 
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      // 1. Defina as rotas que exigem ADMIN
      const adminOnlyRoutes = [
        "/dashboard",
        "/funcionarios",
        "/clientes",
        "/produtos",
        "/financeiros",
        "/configuracoes"
      ];

      const isAdminRoute = adminOnlyRoutes.some(route => 
        pathname.startsWith(route)
      );

      const isProtectedRoute = isAdminRoute || pathname.startsWith("/registrarCompra");

      if (isProtectedRoute && !isLoggedIn) {
        return false; 
      }

      if (isAdminRoute && auth?.user?.role !== "ADMIN") {
        return Response.redirect(new URL("/registrarCompra", nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;