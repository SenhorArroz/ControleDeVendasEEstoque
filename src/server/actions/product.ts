import { db } from "~/server/db";

export const getProductsCount = async () => {
    const productsCount = db.product.count();
    return productsCount;
};