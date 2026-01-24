import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";
import { z } from "zod";
import bcrypt from "bcryptjs";
import type image from "next/image";

export const authRouter = createTRPCRouter({
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
				phone: z.string(),
				bio: z.string(),
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
