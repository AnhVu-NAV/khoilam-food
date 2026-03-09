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