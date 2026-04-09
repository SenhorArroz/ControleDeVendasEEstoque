import NextAuth from "next-auth";
import { authConfig } from "./server/auth.config";

// O .auth do NextAuth v5 já lida com a lógica de proteção definida no authConfig
export default NextAuth(authConfig).auth;

export const config = {
  // Mantive seu matcher original, excluindo login e arquivos estáticos
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
};