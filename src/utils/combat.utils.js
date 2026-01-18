/**
 * Calcula el cooldown de ataque basado en attackSpeed
 */
export function calculateAttackCooldown(attackSpeed) {
    const baseCooldown = 30;
    const minCooldown = 5;
    return Math.max(minCooldown, Math.floor(baseCooldown / (attackSpeed || 1)));
}

/**
 * Aplica daño a una entidad objetivo
 */
export function applyDamage(target, damage) {
    if (!target.stats) return;
    
    target.stats.hp = Math.max(0, target.stats.hp - damage);
    
    if (target.stats.hp === 0) {
        target.dead = true;
    }
}

/**
 * Verifica si una entidad puede atacar (cooldown listo)
 */
export function canAttack(entity) {
    return entity.attackCooldown <= 0;
}

/**
 * Verifica si el ataque está en rango
 */
export function isInRange(attacker, target, range) {
    const distance = Math.abs(target.x - attacker.x) + 
                     Math.abs(target.y - attacker.y);
    return distance <= range;
}
