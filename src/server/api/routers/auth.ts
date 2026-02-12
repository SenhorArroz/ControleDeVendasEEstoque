import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";
import { z } from "zod";
import bcrypt from "bcryptjs";
import type image from "next/image";
import { Resend } from "resend";
import { randomBytes } from "crypto";
import { TRPCError } from "@trpc/server";
import { hash } from "bcryptjs";

const resend = new Resend(process.env.RESEND_API_KEY);

export const authRouter = createTRPCRouter({
	forgotPassword: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (!user) {
        return { success: true };
      }

      const token = randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 3600000);

      await ctx.db.passwordResetToken.create({
        data: {
          email: input.email,
          token,
          expires,
        },
      });

      const resetLink = `${process.env.NEXTAUTH_URL}/forgot-password/${token}`;

      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: input.email,
        subject: "Redefinir sua senha",
        html: `<p>Clique aqui para redefinir sua senha: <a href="${resetLink}">${resetLink}</a></p>`,
      });

      return { success: true };
    }),

  resetPassword: publicProcedure
    .input(z.object({
      token: z.string(),
      password: z.string().min(8),
    }))
    .mutation(async ({ ctx, input }) => {
      const storedToken = await ctx.db.passwordResetToken.findUnique({
        where: { token: input.token },
      });

      if (!storedToken || storedToken.expires < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Token inválido ou expirado.",
        });
      }

      const hashedPassword = await hash(input.password, 10);

      await ctx.db.user.update({
        where: { email: storedToken.email },
        data: { password: hashedPassword },
      });

      await ctx.db.passwordResetToken.delete({
        where: { id: storedToken.id },
      });

      return { success: true };
    }),

	getSession: publicProcedure.query(({ ctx }) => {
		return ctx.session;
	}),
	getSecretMessage: protectedProcedure.query(() => {
		return "you can now see this secret message!";
	}),
	register: publicProcedure
		.input(
			z.object({
				email: z.string().email(),
				password: z.string(),
				name: z.string(),
				phone: z.string().optional(),
				bio: z.string().optional(),
				image: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const user = await ctx.db.user.create({
				data: {
					name: input.name,
					email: input.email,
					password: await bcrypt.hash(input.password, 10),
					phone: input.phone,
					bio: input.bio,
					image: input.image,
				},
			});

			return user;
		}),
	deleteUser: protectedProcedure.mutation(async ({ ctx }) => {
		await ctx.db.user.delete({
			where: {
				id: ctx.session?.user?.id,
			},
		});
		return true;
	}),
	updateUser: protectedProcedure
		.input(
			z.object({
				name: z.string(),
				image: z.string(),
				phone: z.string(),
				bio: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const user = await ctx.db.user.update({
				where: {
					id: ctx.session.user.id,
				},
				data: {
					name: input.name,
					image: input.image,
					phone: input.phone,
					bio: input.bio,
				},
			});
			return user;
		}),
});
