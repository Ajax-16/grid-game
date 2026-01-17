import { ENTITY_TYPE } from "../data/entity.type.js";

export class ConsoleGrid {
    constructor({ cols, rows, graphics }) {
        this.cols = cols;
        this.rows = rows;
        this.graphics = graphics;
        this.clear();
    }

    clear() {
        const { wall } = this.graphics;

        this.grid = Array.from({ length: this.rows }, (_, y) =>
            Array.from({ length: this.cols }, (_, x) => {
                const isBorder =
                    y === 0 ||
                    y === this.rows - 1 ||
                    x === 0 ||
                    x === this.cols - 1;
                return isBorder ? wall : " ";
            })
        );
    }

    isWall(x, y) {
        return this.grid[y]?.[x] === this.graphics.wall;
    }

    isOccupied(x, y, ignore = null, blockProjectiles = false) {
        if (this.isWall(x, y)) return true;
        return this.entities?.some(e =>
            e !== ignore &&
            e.x === x &&
            e.y === y &&
            (blockProjectiles || e.type !== ENTITY_TYPE.PROJECTILE)
        ) || false;
    }

    setEntities(entities) {
        this.entities = entities;
    }

    place(entity) {
        // Intentamos colocar la entidad
        if (this.isOccupied(entity.x, entity.y, entity)) {
            // Si colisiona, revertimos a la posición anterior
            entity.x = entity.prevX ?? entity.x;
            entity.y = entity.prevY ?? entity.y;
        }

        // Colocamos en el grid
        if (!this.grid[entity.y]?.[entity.x]) return;
        this.grid[entity.y][entity.x] = entity.char;

        // Guardamos posición actual como previa
        entity.prevX = entity.x;
        entity.prevY = entity.y;

    }

    get() {
        return this.grid;
    }

    getCell(x, y) {
        // Chequeo fuera de límites
        if (y < 0 || y >= this.rows || x < 0 || x >= this.cols) return null;

        // Revisar si hay entidad
        const entity = this.entities?.find(e => e.x === x && e.y === y);
        if (entity) return entity;

        // Si no hay entidad, devuelve la celda visual
        return this.grid[y][x];
    }
}
