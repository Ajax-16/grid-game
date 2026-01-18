import { DIRECTION } from "../data/direction.js";
import { ENTITY_TYPE } from "../data/entity.type.js";

export class Entity {
    constructor(x, y, stats) {
        this.x = x;
        this.y = y;
        this.prevX = x;
        this.prevY = y;
        this.direction = DIRECTION.SOUTH
        this.stats = stats;
        this.char = '';
        this.type = '';
        this.tickCounter = 0;
        this.dead = false;
    }

    move(dx, dy) {
        this.prevX = this.x;
        this.prevY = this.y;
        this.x += dx;
        this.y += dy;
        if (this.x > this.prevX) this.direction = DIRECTION.EAST;
        if (this.x < this.prevX) this.direction = DIRECTION.WEST;
        if (this.y > this.prevY) this.direction = DIRECTION.SOUTH;
        if (this.y < this.prevY) this.direction = DIRECTION.NORTH;
    }

    changeDirection(dx, dy) {
        if (dx > this.x) this.direction = DIRECTION.EAST;
        if (dx < this.x) this.direction = DIRECTION.WEST;
        if (dy > this.y) this.direction = DIRECTION.SOUTH;
        if (dy < this.y) this.direction = DIRECTION.NORTH;
    }

    moveToEntity(target, grid) {
        const diffX = target.x - this.x;
        const diffY = target.y - this.y;

        const dx = Math.sign(diffX);
        const dy = Math.sign(diffY);

        // Si ya está al lado (no moverse encima)
        if (Math.abs(diffX) + Math.abs(diffY) === 1) {
            if (this.type === ENTITY_TYPE.ENEMY) {
                this.attackEntity(target);
            }
            return;
        }

        // Priorizar el eje con mayor distancia
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (dx !== 0 && !grid.isOccupied(this.x + dx, this.y, this)) {
                this.move(dx, 0);
                return;
            }
        }

        if (dy !== 0 && !grid.isOccupied(this.x, this.y + dy, this)) {
            this.move(0, dy);
            return;
        }

        // Fallback: intenta el otro eje
        if (dx !== 0 && !grid.isOccupied(this.x + dx, this.y, this)) {
            this.move(dx, 0);
        }

    }

    attackEntity(target) {
        const range = this.stats?.range ?? 1;
        const distance =
            Math.abs(target.x - this.x) + Math.abs(target.y - this.y);

        if (distance > range) return;

        const damage = this.stats?.attack ?? 1;
        target.stats.hp = Math.max(0, target.stats.hp - damage);

        if (target.stats.hp === 0) target.dead = true;
    }

    addStats({stats}) {
        if (stats.range) {
            this.stats.range += stats.range;
        }
        if (stats.hp) {
            this.stats.hp += stats.hp;
        }
        if (stats.attack) {
            this.stats.attack += stats.attack;
        }
        if (stats.speed) {
            this.stats.speed += stats.speed;
        }
    }

}
