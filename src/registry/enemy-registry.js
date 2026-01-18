/**
 * Registro de tipos de enemigos con sus probabilidades de aparición
 */
export class EnemyRegistry {
    constructor() {
        this.enemyTypes = [];
        this.totalWeight = 0;
    }

    /**
     * Registra un tipo de enemigo
     * @param {Function} EnemyClass - Clase del enemigo (debe extender EnemyEntity)
     * @param {number} weight - Peso/probabilidad relativa (mayor = más común)
     * @param {Function} statsCalculator - Función opcional para calcular stats (difficulty) => stats
     */
    register(EnemyClass, weight, statsCalculator = null) {
        this.enemyTypes.push({
            EnemyClass,
            weight,
            statsCalculator: statsCalculator || EnemyClass.calculateStats
        });
        this.totalWeight += weight;
    }

    /**
     * Selecciona un tipo de enemigo aleatorio basado en los pesos
     */
    selectRandom() {
        if (this.enemyTypes.length === 0) return null;

        let random = Math.random() * this.totalWeight;
        
        for (const enemyType of this.enemyTypes) {
            random -= enemyType.weight;
            if (random <= 0) {
                return enemyType;
            }
        }

        // Fallback al último
        return this.enemyTypes[this.enemyTypes.length - 1];
    }

    /**
     * Crea una instancia de enemigo aleatorio
     */
    createRandom(x, y, difficulty) {
        const enemyType = this.selectRandom();
        if (!enemyType) return null;

        const stats = enemyType.statsCalculator(difficulty);
        return new enemyType.EnemyClass(x, y, stats);
    }

    /**
     * Obtiene todos los tipos registrados
     */
    getAllTypes() {
        return this.enemyTypes.map(et => et.EnemyClass);
    }
}
