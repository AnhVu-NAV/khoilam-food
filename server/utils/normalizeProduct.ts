import { parseWeights, toInt } from './common.js';

export const normalizeProduct = (product: Record<string, any>) => ({
    ...product,
    weights: parseWeights(product.weights),
    stock: toInt(product.stock),
    price: toInt(product.price),
});