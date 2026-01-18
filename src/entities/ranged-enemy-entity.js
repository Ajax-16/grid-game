import { EnemyEntity } from "./enemy-entity.js";
import { ENTITY_TYPE } from "../data/entity.type.js";
import { RangedCombatBehavior } from "../behaviors/ranged-combat-behavior.js";
import { MovementBehavior } from "../behaviors/movement-behavior.js";

/**
 * Enemigo a distancia
 */
export class RangedEnemyEntity extends EnemyEntity {
    constructor(x, y, stats, range = 5) {
        // Remover comportamientos base y agregar los específicos
        super(x, y, stats, 'R');
        this.type = ENTITY_TYPE.RANGED_ENEMY;
        this.behaviors = []; // Limpiar comportamientos base
        
        // Agregar comportamiento de combate a distancia
        this.addBehavior(new RangedCombatBehavior(this, range));
        // Agregar movimiento
        this.addBehavior(new MovementBehavior(this));
    }

    static calculateStats(difficulty) {
        const baseStats = super.calculateStats(difficulty);
        return {
            ...baseStats,
            attack: baseStats.attack * 1.5,
            attackSpeed: baseStats.attackSpeed / 2,
            range: 5
        };
    }
}
