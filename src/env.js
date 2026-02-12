import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here.
   */
  server: {
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    AUTH_GOOGLE_ID: z.string(),
    AUTH_GOOGLE_SECRET: z.string(),
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    
    // --- CORREÇÃO AQUI ---
    // Tornamos estes opcionais para não quebrar o app se faltarem
    UPLOADTHING_SECRET: z.string().optional(),
    UPLOADTHING_KEY: z.string().optional(),
    
    // Este continua OBRIGATÓRIO (é o que a v7 usa)
    UPLOADTHING_TOKEN: z.string(),
    RESEND_API_KEY: z.string(),
    NEXTAUTH_URL: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes.
   */
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    
    // Mantenha o mapeamento aqui
    UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
    UPLOADTHING_KEY: process.env.UPLOADTHING_KEY,
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});