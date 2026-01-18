import { EnemyEntity } from "./enemy-entity.js";
import { ENTITY_TYPE } from "../data/entity.type.js";
import { RangedCombatBehavior } from "../behaviors/ranged-combat-behavior.js";
import { MovementBehavior } from "../behaviors/movement-behavior.js";

/**
 * Boss - Enemigo especial más poderoso
 */
export class BossEnemyEntity extends EnemyEntity {
    constructor(x, y, stats) {
        super(x, y, stats, 'B');
        this.type = ENTITY_TYPE.BOSS;
        
        // Los bosses tienen combate a distancia Y cuerpo a cuerpo
        this.behaviors = [];
        this.addBehavior(new RangedCombatBehavior(this, 9)); // Mayor alcance
        this.addBehavior(new MovementBehavior(this));
    }

    static calculateStats(difficulty) {
        const baseStats = super.calculateStats(difficulty);
        return {
            hp: Math.floor(baseStats.hp * 10), // 5x más HP
            speed: baseStats.speed * 0.8, // Un poco más lento
            attack: Math.floor(baseStats.attack * 3), // 2x más daño
            attackSpeed: baseStats.attackSpeed * 1.5, // Más rápido
            range: 9 // Mayor alcance
        };
    }
}
