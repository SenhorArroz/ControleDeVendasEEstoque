// src/server/auth.ts

import { PrismaAdapter } from "@auth/prisma-adapter";
import { type Adapter } from "next-auth/adapters"; 
import NextAuth, { type DefaultSession } from "next-auth";
import { type JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "~/server/db";
import { authConfig } from "./auth.config"; // Não esqueça de importar o seu config!

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
            role: "FUNCIONARIO" | "ADMIN";
            phone?: string;
            bio?: string;
        } & DefaultSession["user"];
    }

    interface User {
        role: "FUNCIONARIO" | "ADMIN";
        phone?: string;
        bio?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role?: "FUNCIONARIO" | "ADMIN";
    }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(db) as Adapter,
    session: { strategy: "jwt" },
    ...authConfig, // Espalha as configurações base do middleware
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            // O authorize precisa ser async e funciona bem como arrow function aqui
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (!parsedCredentials.success) return null;

                const { email, password } = parsedCredentials.data;

                const user = await db.user.findUnique({
                    where: { email },
                });

                if (!user || !user.password){
                    throw new Error("Usuário não encontrado.");
                    return null;
                } 

                const isValid = await bcrypt.compare(password, user.password);

                if (!isValid) return null;
                const userWithRole = user as any;
  
                console.log("VALOR REAL NO BANCO:", userWithRole.role);

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role || "ADMIN",
                };
            },
        }),
    ],
    callbacks: {
        // MUDANÇA AQUI: Usando sintaxe de método assíncrono direta
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
    },
    pages: {
        signIn: "/login",
    },
});