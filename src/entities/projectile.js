import { DIRECTION } from "../data/direction.js";
import { ENTITY_TYPE } from "../data/entity.type.js";
import { getDirectionOffset } from "../utils/direction.utils.js";
import { applyDamage } from "../utils/combat.utils.js";

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

        const [dx, dy] = getDirectionOffset(this.direction);
        const nx = this.entity.x + dx;
        const ny = this.entity.y + dy;

        // Verificar colisión en la posición actual primero
        const allEntities = [...world.entities];
        let target = allEntities.find(
            e => e.x === this.entity.x && e.y === this.entity.y && e !== this.entity && e.type !== ENTITY_TYPE.PROJECTILE
        );

        // Si no hay colisión en la posición actual, verificar en la nueva posición
        if (!target) {
            target = allEntities.find(
                e => e.x === nx && e.y === ny && e !== this.entity && e.type !== ENTITY_TYPE.PROJECTILE
            );
        }

        // Colisión con pared (solo en nueva posición)
        if (world.grid.isWall(nx, ny)) {
            world.removeEntity(this.entity);
            return;
        }

        if (target && target.type == ENTITY_TYPE.OBJ) {
            world.removeEntity(this.entity);
            return;
        }

        // Si el proyectil es del jugador, afecta a enemigos
        if (this.owner.type === ENTITY_TYPE.PLAYER && target && 
            (target.type == ENTITY_TYPE.ENEMY || target.type == ENTITY_TYPE.RANGED_ENEMY)) {
            const damage = this.owner.stats?.attack ?? 1;
            applyDamage(target, damage);

            if (target.dead) {
                world.removeEntity(target);
            }

            world.removeEntity(this.entity);
            return;
        }

        // Si el proyectil es de un enemigo, solo afecta al jugador
        if ((this.owner.type === ENTITY_TYPE.ENEMY || this.owner.type === ENTITY_TYPE.RANGED_ENEMY) && 
            target && target.type == ENTITY_TYPE.PLAYER) {
            const damage = this.owner.stats?.attack ?? 1;
            applyDamage(target, damage);

            world.removeEntity(this.entity);
            return;
        }

        // Mover proyectil solo si no hay colisión
        this.entity.move(dx, dy);

        // Contador de distancia
        this.distanceTraveled++;

        // Destruir si alcanza su máximo alcance
        if (this.distanceTraveled >= this.maxDistance) {
            world.removeEntity(this.entity);
        }
    }
}