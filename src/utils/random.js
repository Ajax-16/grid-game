// Generador de números aleatorios con semilla (Linear Congruential Generator)
class SeededRandom {
    constructor(seed = Date.now()) {
        this.seed = seed;
    }

    // LCG: (a * seed + c) % m
    next() {
        this.seed = (this.seed * 1664525 + 1013904223) % Math.pow(2, 32);
        return this.seed / Math.pow(2, 32);
    }

    random(min = 0, max = 1) {
        return min + this.next() * (max - min);
    }

    int(min, max) {
        return Math.floor(this.random(min, max + 1));
    }

    chance(probability) {
        return this.next() < probability;
    }
}

// Instancia global con semilla aleatoria por defecto
let globalRNG = new SeededRandom();

export const setSeed = (seed) => {
    globalRNG = new SeededRandom(seed);
};

export const getSeed = () => {
    return globalRNG.seed;
};

export const random = (base = 100) => {
    return Math.floor(globalRNG.next() * base);
}

export const chance = (probability, base = 100) => {
    return random(base) < probability;
}

export const randomInt = (min, max) => {
    return globalRNG.int(min, max);
}

export const randomFloat = (min, max) => {
    return globalRNG.random(min, max);
}

export { SeededRandom };
