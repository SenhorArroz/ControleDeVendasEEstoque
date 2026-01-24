import { db } from "~/server/db";

export const getClientsCount = async () => {
    const clientsCount = await db.client.count();
    return clientsCount;
};