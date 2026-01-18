import { EnemyEntity } from "./enemy-entity.js";

/**
 * Ejemplo de nuevo tipo de enemigo: Enemigo rápido
 * Muestra cómo crear nuevos tipos de enemigos fácilmente
 */
export class FastEnemyEntity extends EnemyEntity {
    constructor(x, y, stats) {
        super(x, y, stats, 'F'); // 'F' para Fast
    }

    /**
     * Personaliza los stats para hacerlo más rápido
     */
    static calculateStats(difficulty) {
        const baseStats = super.calculateStats(difficulty);
        return {
            ...baseStats,
            speed: baseStats.speed * 1.5, // Un poco más rápido
            hp: Math.floor(baseStats.hp * 0.75) // Menos HP para balance
        };
    }
}
