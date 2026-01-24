import { db } from "~/server/db";

export const getSalesCount = async () => {
    const salesCount = db.purchase.count();
    return salesCount;
};