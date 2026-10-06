import { db } from "~/server/db";

export const getSalesCount = async (userId: string) => {
    return db.purchase.count({
        where: { userId, status: { in: ["PENDING", "COMPLETED"] } },
    });
};
