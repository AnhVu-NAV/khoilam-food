export const toInt = (value: unknown, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

export const parseWeights = (weights: unknown): string[] => {
    if (Array.isArray(weights)) {
        return weights.map((item) => String(item).trim()).filter(Boolean);
    }

    if (typeof weights === 'string') {
        return weights
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
};

export const parseWeightPrices = (raw: unknown): Record<string, number> => {
    if (!raw) return {};

    if (typeof raw === 'object' && raw !== null) {
        return Object.entries(raw as Record<string, unknown>).reduce(
            (acc: Record<string, number>, [key, value]) => {
                const price = toInt(value);
                if (Number.isFinite(price)) acc[key] = price;
                return acc;
            },
            {}
        );
    }

    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw);
            return parseWeightPrices(parsed);
        } catch {
            return {};
        }
    }

    return {};
};

export const getProductUnitPrice = (
    product: Record<string, unknown>,
    weight: string,
    fallback = 0
) => {
    const weightPrices = parseWeightPrices(product.weight_prices ?? product.weightPrices);
    const priceByWeight = weight ? weightPrices[weight] : undefined;

    if (Number.isFinite(priceByWeight)) {
        return Number(priceByWeight);
    }

    return toInt(product.price, fallback);
};
