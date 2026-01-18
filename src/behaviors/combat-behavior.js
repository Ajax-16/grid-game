import { BaseBehavior } from "./base-behavior.js";
import { calculateAttackCooldown, applyDamage, canAttack, isInRange } from "../utils/combat.utils.js";
import { manhattanDistance } from "../utils/direction.utils.js";

/**
 * Comportamiento de combate cuerpo a cuerpo
 */
export class CombatBehavior extends BaseBehavior {
    constructor(entity) {
        super(entity);
    }

    attack(target) {
        if (!canAttack(this.entity)) return false;

        const range = this.entity.stats?.range ?? 1;
        if (!isInRange(this.entity, target, range)) return false;

        const damage = this.entity.stats?.attack ?? 1;
        applyDamage(target, damage);

        // Aplicar cooldown
        const attackSpeed = this.entity.stats?.attackSpeed ?? 1;
        this.entity.attackCooldown = calculateAttackCooldown(attackSpeed);

        return true;
    }

    update(world, player, tick) {
        // Si el enemigo está cerca del jugador, atacar
        const distance = manhattanDistance(
            this.entity.x, this.entity.y,
            player.entity.x, player.entity.y
        );

        if (distance === 1) {
            this.attack(player.entity);
        }
    }

    getType() {
        return 'combat';
    }
}
