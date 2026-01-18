import { BaseBehavior } from "./base-behavior.js";
import { manhattanDistance } from "../utils/direction.utils.js";

/**
 * Comportamiento de movimiento hacia un objetivo
 */
export class MovementBehavior extends BaseBehavior {
    constructor(entity) {
        super(entity);
    }

    /**
     * Mueve la entidad hacia un objetivo
     */
    moveToTarget(target, grid) {
        const diffX = target.x - this.entity.x;
        const diffY = target.y - this.entity.y;

        const dx = Math.sign(diffX);
        const dy = Math.sign(diffY);

        // Si ya está al lado, no moverse
        if (Math.abs(diffX) + Math.abs(diffY) === 1) {
            return false;
        }

        // Priorizar el eje con mayor distancia
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (dx !== 0 && !grid.isOccupied(this.entity.x + dx, this.entity.y, this.entity)) {
                this.entity.move(dx, 0);
                return true;
            }
        }

        if (dy !== 0 && !grid.isOccupied(this.entity.x, this.entity.y + dy, this.entity)) {
            this.entity.move(0, dy);
            return true;
        }

        // Fallback: intenta el otro eje
        if (dx !== 0 && !grid.isOccupied(this.entity.x + dx, this.entity.y, this.entity)) {
            this.entity.move(dx, 0);
            return true;
        }

        return false;
    }

    getType() {
        return 'movement';
    }
}
