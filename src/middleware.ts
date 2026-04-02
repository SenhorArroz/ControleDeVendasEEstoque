import { auth } from "~/server/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;

  // Rotas que exigem login (qualquer role)
  const isProtectedRoute = nextUrl.pathname.startsWith("/");

  // Rotas que exigem estritamente ADMIN
  const adminOnlyRoutes = [
    "/dashboard",
    "/funcionarios",
    "/clientes",
    "/produtos",
    "/financeiros",
    "/configuracoes"
    // adicione as outras aqui...
  ];

  const isAdminRoute = adminOnlyRoutes.some(route => 
    nextUrl.pathname.startsWith(route)
  );

  // 1. Bloqueio de não logado
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // 2. Bloqueio de quem não é Admin em rotas restritas
  if (isAdminRoute && session?.user?.role !== "ADMIN") {
    console.log("Acesso negado. Role atual:", session?.user?.role);
    return NextResponse.redirect(new URL("/registrarCompra", nextUrl)); // Mande para a Dashboard, não para "/" (evita loop)
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
};