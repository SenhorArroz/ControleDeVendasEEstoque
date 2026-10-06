import { db } from "~/server/db";

export const getClientsCount = async (userId: string) => {
    return db.client.count({ where: { userId } });
};
