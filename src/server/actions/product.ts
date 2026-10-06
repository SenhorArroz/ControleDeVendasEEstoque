import { db } from "~/server/db";

export const getProductsCount = async (userId: string) => {
    return db.product.count({ where: { userId } });
};
