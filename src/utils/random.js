export const random = (base = 100) => {
    return Math.floor(Math.random() * base);
}

export const chance = (probability, base = 100) => {
    return random(base) < probability;
}
