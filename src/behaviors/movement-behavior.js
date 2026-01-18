import { BaseBehavior } from "./base-behavior.js";
import { manhattanDistance } from "../utils/direction.utils.js";
import { findNextStep } from "../utils/pathfinding.js";

/**
 * Comportamiento de movimiento hacia un objetivo con pathfinding
 */
export class MovementBehavior extends BaseBehavior {
    constructor(entity) {
        super(entity);
        this.lastPathfindingTarget = null;
        this.lastPathfindingResult = null;
        this.pathfindingCacheTicks = 0;
    }

    /**
     * Mueve la entidad hacia un objetivo usando pathfinding si es necesario
     */
    moveToTarget(target, grid) {
        const diffX = target.x - this.entity.x;
        const diffY = target.y - this.entity.y;
        const distance = Math.abs(diffX) + Math.abs(diffY);

        // Si ya está al lado, no moverse
        if (distance === 1) {
            return false;
        }

        // Intentar movimiento directo primero (más eficiente)
        const directMove = this.tryDirectMove(target, grid);
        if (directMove) {
            // Limpiar cache si el movimiento directo funciona
            this.lastPathfindingTarget = null;
            this.lastPathfindingResult = null;
            return true;
        }

        // Usar cache si el objetivo no ha cambiado y el cache es reciente
        const targetKey = `${target.x},${target.y}`;
        const currentPos = `${this.entity.x},${this.entity.y}`;
        const cacheKey = `${currentPos}->${targetKey}`;
        
        let nextStep = null;
        
        // Si el objetivo cambió o el cache expiró, recalcular
        if (this.lastPathfindingTarget !== targetKey || 
            this.pathfindingCacheTicks > 5 ||
            this.lastPathfindingResult === null) {
            
            // Usar pathfinding con distancia más grande si está lejos
            const maxDistance = Math.min(30, distance * 2);
            nextStep = findNextStep(
                this.entity.x,
                this.entity.y,
                target.x,
                target.y,
                grid,
                this.entity,
                maxDistance
            );
            
            // Actualizar cache
            this.lastPathfindingTarget = targetKey;
            this.lastPathfindingResult = nextStep;
            this.pathfindingCacheTicks = 0;
        } else {
            // Usar cache
            nextStep = this.lastPathfindingResult;
            this.pathfindingCacheTicks++;
        }

        if (nextStep) {
            // Verificar que el siguiente paso sea válido antes de moverse
            if (!grid.isWall(nextStep.x, nextStep.y) && 
                !grid.isOccupied(nextStep.x, nextStep.y, this.entity)) {
                const dx = nextStep.x - this.entity.x;
                const dy = nextStep.y - this.entity.y;
                this.entity.move(dx, dy);
                return true;
            } else {
                // Si el paso cacheado ya no es válido, limpiar cache
                this.lastPathfindingResult = null;
            }
        }

        return false;
    }

    /**
     * Intenta un movimiento directo hacia el objetivo (más rápido)
     */
    tryDirectMove(target, grid) {
        const diffX = target.x - this.entity.x;
        const diffY = target.y - this.entity.y;

        const dx = Math.sign(diffX);
        const dy = Math.sign(diffY);

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
