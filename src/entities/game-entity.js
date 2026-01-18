import { Entity } from "./entity.js";

/**
 * Entidad base del juego con sistema de comportamientos
 * Todas las entidades del juego (Player, Enemy, etc.) heredan de esta
 */
export class GameEntity extends Entity {
    constructor(x, y, stats, char, type) {
        super(x, y, stats);
        this.char = char;
        this.type = type;
        this.behaviors = [];
    }

    /**
     * Agrega un comportamiento a la entidad
     */
    addBehavior(behavior) {
        this.behaviors.push(behavior);
    }

    /**
     * Obtiene un comportamiento por tipo
     */
    getBehavior(type) {
        return this.behaviors.find(b => b.getType() === type);
    }

    /**
     * Actualiza todos los comportamientos
     */
    updateBehaviors(world, player, tick) {
        for (const behavior of this.behaviors) {
            if (behavior.update) {
                behavior.update(world, player, tick);
            }
        }
    }
}
