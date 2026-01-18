import { GameEntity } from "./game-entity.js";
import { ENTITY_TYPE } from "../data/entity.type.js";
import { CombatBehavior } from "../behaviors/combat-behavior.js";
import { MovementBehavior } from "../behaviors/movement-behavior.js";

/**
 * Clase base para todos los enemigos
 */
export class EnemyEntity extends GameEntity {
    constructor(x, y, stats, char = 'E') {
        super(x, y, stats, char, ENTITY_TYPE.ENEMY);
        
        // Todos los enemigos tienen combate y movimiento por defecto
        this.addBehavior(new CombatBehavior(this));
        this.addBehavior(new MovementBehavior(this));
    }

    /**
     * Método para personalizar stats basado en dificultad
     * Puede ser sobrescrito por subclases
     */
    static calculateStats(difficulty) {
        return {
            hp: Math.floor(difficulty),
            speed: 0.25 + Math.floor(difficulty / 10),
            attack: 1 + Math.floor(difficulty / 2),
            attackSpeed: 0.5 + Math.floor(difficulty / 10)
        };
    }
}
