import { db } from "~/server/db";

export const getUser = async (id: string) => {
    const user = await db.user.findUnique({
        where: { id },
    });
    return user;
};