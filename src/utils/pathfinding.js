/**
 * Encuentra el siguiente paso hacia un objetivo usando BFS
 * @param {number} startX - Posición X inicial
 * @param {number} startY - Posición Y inicial
 * @param {number} targetX - Posición X objetivo
 * @param {number} targetY - Posición Y objetivo
 * @param {Object} grid - Grid del mundo
 * @param {Object} entity - Entidad que busca el camino (para ignorarla en isOccupied)
 * @param {number} maxDistance - Distancia máxima a buscar (por defecto 20)
 * @returns {Object|null} - {x, y} del siguiente paso, o null si no se encuentra camino
 */
export function findNextStep(startX, startY, targetX, targetY, grid, entity, maxDistance = 20) {
    // Si ya está al lado, no necesita pathfinding
    const distance = Math.abs(targetX - startX) + Math.abs(targetY - startY);
    if (distance <= 1) {
        return null;
    }

    // Si el movimiento directo es posible, usarlo (más eficiente)
    const directPath = tryDirectPath(startX, startY, targetX, targetY, grid, entity);
    if (directPath) {
        return directPath;
    }

    // Usar BFS para encontrar el camino
    return bfsPathfinding(startX, startY, targetX, targetY, grid, entity, maxDistance);
}

/**
 * Intenta un movimiento directo hacia el objetivo
 */
function tryDirectPath(startX, startY, targetX, targetY, grid, entity) {
    const dx = Math.sign(targetX - startX);
    const dy = Math.sign(targetY - startY);

    // Priorizar el eje con mayor distancia
    if (Math.abs(targetX - startX) > Math.abs(targetY - startY)) {
        if (dx !== 0 && isWalkable(startX + dx, startY, grid, entity)) {
            return { x: startX + dx, y: startY };
        }
    }

    if (dy !== 0 && isWalkable(startX, startY + dy, grid, entity)) {
        return { x: startX, y: startY + dy };
    }

    // Fallback: intenta el otro eje
    if (dx !== 0 && isWalkable(startX + dx, startY, grid, entity)) {
        return { x: startX + dx, y: startY };
    }

    return null;
}

/**
 * Verifica si una celda es transitable (no muro y dentro de límites)
 * Para pathfinding, ignoramos entidades temporales (proyectiles, items)
 */
function isWalkable(x, y, grid, entity) {
    // Verificar límites primero
    if (x < 0 || x >= grid.cols || y < 0 || y >= grid.rows) {
        return false;
    }

    // Verificar si es muro
    if (grid.isWall(x, y)) {
        return false;
    }

    // Para pathfinding, solo consideramos muros como bloqueos
    // Las entidades pueden moverse temporalmente, así que las ignoramos
    // Esto permite que el pathfinding encuentre caminos aunque haya otras entidades
    return true;
}

/**
 * BFS para encontrar el siguiente paso del camino más corto
 */
function bfsPathfinding(startX, startY, targetX, targetY, grid, entity, maxDistance) {
    const queue = [{ x: startX, y: startY, firstStep: null }];
    const visited = new Set();
    visited.add(`${startX},${startY}`);

    const directions = [
        [0, -1], // Norte
        [1, 0],  // Este
        [0, 1],  // Sur
        [-1, 0]  // Oeste
    ];

    while (queue.length > 0) {
        const current = queue.shift();

        // Si llegamos al objetivo, devolver el primer paso del camino
        if (current.x === targetX && current.y === targetY) {
            return current.firstStep;
        }

        // Limitar la búsqueda por distancia
        const currentDistance = Math.abs(current.x - startX) + Math.abs(current.y - startY);
        if (currentDistance >= maxDistance) {
            continue;
        }

        // Explorar vecinos en orden que prioriza la dirección hacia el objetivo
        // Esto hace que el pathfinding sea más eficiente
        const dirsWithPriority = directions.map(([dx, dy]) => {
            const toTargetX = targetX - (current.x + dx);
            const toTargetY = targetY - (current.y + dy);
            const priority = Math.abs(toTargetX) + Math.abs(toTargetY);
            return { dx, dy, priority };
        }).sort((a, b) => a.priority - b.priority);

        for (const { dx, dy } of dirsWithPriority) {
            const nx = current.x + dx;
            const ny = current.y + dy;
            const key = `${nx},${ny}`;

            // Verificar si ya fue visitado
            if (visited.has(key)) continue;

            // Verificar si es transitable
            if (!isWalkable(nx, ny, grid, entity)) continue;

            visited.add(key);

            // El primer paso es el primer movimiento desde el inicio
            const firstStep = current.firstStep || { x: nx, y: ny };

            queue.push({
                x: nx,
                y: ny,
                firstStep: firstStep
            });
        }
    }

    // No se encontró camino
    return null;
}
