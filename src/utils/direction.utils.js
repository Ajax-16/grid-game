import { DIRECTION } from "../data/direction.js";

/**
 * Mapa de offsets para cada dirección
 */
export const DIRECTION_OFFSETS = {
    [DIRECTION.NORTH]: [0, -1],
    [DIRECTION.SOUTH]: [0, 1],
    [DIRECTION.EAST]: [1, 0],
    [DIRECTION.WEST]: [-1, 0]
};

/**
 * Obtiene el offset [dx, dy] para una dirección
 */
export function getDirectionOffset(direction) {
    return DIRECTION_OFFSETS[direction] || [0, 0];
}

/**
 * Calcula la dirección hacia un objetivo basado en diferencias x, y
 */
export function calculateDirectionToTarget(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) {
        return dx > 0 ? DIRECTION.EAST : DIRECTION.WEST;
    } else {
        return dy > 0 ? DIRECTION.SOUTH : DIRECTION.NORTH;
    }
}

/**
 * Calcula la distancia Manhattan entre dos puntos
 */
export function manhattanDistance(x1, y1, x2, y2) {
    return Math.abs(x2 - x1) + Math.abs(y2 - y1);
}
