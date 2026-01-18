import { CombatBehavior } from "./combat-behavior.js";
import { Entity } from "../entities/entity.js";
import { Projectile } from "../entities/projectile.js";
import { getDirectionOffset, calculateDirectionToTarget, manhattanDistance } from "../utils/direction.utils.js";
import { calculateAttackCooldown, canAttack } from "../utils/combat.utils.js";

/**
 * Comportamiento de combate a distancia
 */
export class RangedCombatBehavior extends CombatBehavior {
    constructor(entity, range = 5) {
        super(entity);
        this.range = range;
    }

    /**
     * Lanza un proyectil hacia un objetivo
     */
    shootProjectile(world, target) {
        if (!canAttack(this.entity)) return false;

        const distance = manhattanDistance(
            this.entity.x, this.entity.y,
            target.x, target.y
        );

        if (distance <= 1 || distance > this.range) return false;

        // Calcular dirección hacia el objetivo
        const dx = target.x - this.entity.x;
        const dy = target.y - this.entity.y;
        const direction = calculateDirectionToTarget(dx, dy);

        // Crear proyectil
        const [offsetX, offsetY] = getDirectionOffset(direction);
        const x = this.entity.x + offsetX;
        const y = this.entity.y + offsetY;

        const projEntity = new Entity(x, y, { speed: 1 });
        const projectile = new Projectile(projEntity, direction, this.entity);

        world.entities.push(projectile.entity);
        world.projectiles.push(projectile);

        // Aplicar cooldown
        const attackSpeed = this.entity.stats?.attackSpeed ?? 1;
        this.entity.attackCooldown = calculateAttackCooldown(attackSpeed);

        return true;
    }

    update(world, player) {
        const distance = manhattanDistance(
            this.entity.x, this.entity.y,
            player.entity.x, player.entity.y
        );

        // Si está cerca, ataca cuerpo a cuerpo
        if (distance === 1) {
            this.attack(player.entity);
            return;
        }

        // Si está a distancia, intenta lanzar proyectil
        if (distance > 1 && distance <= this.range) {
            const shot = this.shootProjectile(world, player.entity);
            // Si no puede disparar (cooldown), el movimiento se maneja por separado
            return;
        }

        // Si está fuera de rango, el movimiento se maneja por el MovementBehavior
    }

    getType() {
        return 'ranged-combat';
    }
}
