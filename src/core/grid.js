/**
 * Interfaz abstracta para Grid
 * Todas las implementaciones de Grid deben seguir esta interfaz
 */
export class Grid {
    constructor({ cols, rows, graphics, initialGrid = null }) {
        this.cols = cols;
        this.rows = rows;
        this.graphics = graphics;
        this.initialGrid = initialGrid;
    }

    /**
     * Limpia el grid
     */
    clear() {
        throw new Error('clear() must be implemented');
    }

    /**
     * Verifica si una posición es un muro
     */
    isWall(x, y) {
        throw new Error('isWall() must be implemented');
    }

    /**
     * Verifica si una posición está ocupada
     */
    isOccupied(x, y, ignore = null, blockProjectiles = false) {
        throw new Error('isOccupied() must be implemented');
    }

    /**
     * Establece las entidades en el grid
     */
    setEntities(entities) {
        this.entities = entities;
    }

    /**
     * Coloca una entidad en el grid
     */
    place(entity) {
        throw new Error('place() must be implemented');
    }

    /**
     * Obtiene el grid completo
     */
    get() {
        throw new Error('get() must be implemented');
    }

    /**
     * Obtiene una celda específica
     */
    getCell(x, y) {
        throw new Error('getCell() must be implemented');
    }
}
