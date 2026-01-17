import { DIRECTION } from "../data/direction.js";
import { ENTITY_TYPE } from "../data/entity.type.js";

export class Projectile {
    constructor(entity, direction, owner) {
        this.entity = entity;
        this.entity.char = '*';
        this.entity.type = ENTITY_TYPE.PROJECTILE;
        this.direction = direction;
        this.owner = owner;

        this.entity.tickCounter = 0;

        // Distancia recorrida
        this.distanceTraveled = 0;

        // Alcance máximo según stat range del owner
        this.maxDistance = owner.stats?.range ?? 3;
    }

    update(world) {
        this.entity.tickCounter++;

        const delay = world.getTickDelay(this.entity);
        if (this.entity.tickCounter < delay) return;

        this.entity.tickCounter = 0;

        const dirMap = {
            [DIRECTION.NORTH]: [0, -1],
            [DIRECTION.SOUTH]: [0, 1],
            [DIRECTION.EAST]: [1, 0],
            [DIRECTION.WEST]: [-1, 0]
        };

        const [dx, dy] = dirMap[this.direction];
        const nx = this.entity.x + dx;
        const ny = this.entity.y + dy;

        // Colisión con pared
        if (world.grid.isWall(nx, ny)) {
            world.removeEntity(this.entity);
            return;
        }

        // Colisión con enemigos
        const target = world.entities.find(
            e => e.x === this.entity.x && e.y === this.entity.y
        );

        if (target && target.type == ENTITY_TYPE.OBJ) {
            world.removeEntity(this.entity);
            return;
        }

        
        if (target && target.type == ENTITY_TYPE.ENEMY) {
            // Aplicar daño del owner
            const damage = this.owner.stats?.attack ?? 1;
            target.stats.hp -= damage;

            // Marcar muerto si hp <= 0
            if (target.stats.hp <= 0) {
                target.dead = true;
                world.removeEntity(target);
            }

            // Destruir proyectil
            world.removeEntity(this.entity);
            return;
        }

        // Mover proyectil
        this.entity.move(dx, dy);

        // Contador de distancia
        this.distanceTraveled++;

        // Destruir si alcanza su máximo alcance
        if (this.distanceTraveled >= this.maxDistance) {
            world.removeEntity(this.entity);
        }
    }
}