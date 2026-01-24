import { PrismaAdapter } from "@auth/prisma-adapter";
import { type Adapter } from "next-auth/adapters"; // <--- Importação necessária para corrigir o erro de tipo
import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types.
 */
declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
            name: string;
            email: string;
            image: string;
            phone: string;
            bio: string;
            createdAt: string;
        } & DefaultSession["user"];
    }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
    // O "as Adapter" abaixo é OBRIGATÓRIO na beta.25 para não dar erro de type mismatch
    adapter: PrismaAdapter(db) as Adapter,
    session: {
        strategy: "jwt",
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (!parsedCredentials.success) return null;

                const { email, password } = parsedCredentials.data;

                const user = await db.user.findUnique({
                    where: { email },
                });

                if (!user || !user.password) {
                    throw new Error("Usuário não encontrado ou senha inválida.");
                }

                const isValid = await bcrypt.compare(password, user.password);

                if (!isValid) throw new Error("Senha incorreta.");

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    phone: user.phone,
                    bio: user.bio,
                };
            },
        }),
    ],
    callbacks: {
        session: ({ session, token }) => {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.sub as string,
                },
            };
        },
        jwt: ({ token, user }) => {
            if (user) {
                token.sub = user.id;
            }
            return token;
        },
    },
    pages: {
        signIn: "/login",
    },
});