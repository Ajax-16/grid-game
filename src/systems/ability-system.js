/**
 * Sistema de habilidades especiales activables
 */
import { ENTITY_TYPE } from "../data/entity.type.js";
import { DIRECTION } from "../data/direction.js";

export class AbilitySystem {
    constructor(player) {
        this.player = player;
        this.abilities = {
            dash: {
                name: 'Dash',
                description: 'Teletransporte rápido',
                cooldown: 0,
                maxCooldown: 60,
                active: false,
                unlocked: false,
                cost: 200
            },
            aoe: {
                name: 'Ataque Área',
                description: 'Daño a todos los enemigos cercanos',
                cooldown: 0,
                maxCooldown: 90,
                active: false,
                unlocked: false,
                cost: 300
            },
            heal: {
                name: 'Curación',
                description: 'Restaura 5 HP',
                cooldown: 0,
                maxCooldown: 120,
                active: false,
                unlocked: false,
                cost: 150
            }
        };
    }

    /**
     * Desbloquea una habilidad
     */
    unlockAbility(abilityName) {
        if (this.abilities[abilityName]) {
            this.abilities[abilityName].unlocked = true;
            return true;
        }
        return false;
    }

    /**
     * Activa una habilidad
     */
    activateAbility(abilityName, world) {
        const ability = this.abilities[abilityName];
        if (!ability || !ability.unlocked || ability.cooldown > 0) return false;

        switch(abilityName) {
            case 'dash':
                return this.useDash(world);
            case 'aoe':
                return this.useAOE(world);
            case 'heal':
                return this.useHeal();
            default:
                return false;
        }
    }

    /**
     * Dash - movimiento rápido
     */
    useDash(world) {
        const player = this.player;
        const dir = player.direction;
        const offsets = {
            [DIRECTION.NORTH]: [0, -3],
            [DIRECTION.SOUTH]: [0, 3],
            [DIRECTION.EAST]: [3, 0],
            [DIRECTION.WEST]: [-3, 0]
        };

        const [dx, dy] = offsets[dir] || [0, 0];
        const nx = player.x + dx;
        const ny = player.y + dy;

        // Verificar que la posición sea válida
        if (!world.grid.isWall(nx, ny) && !world.grid.isOccupied(nx, ny, player)) {
            player.x = nx;
            player.y = ny;
            this.abilities.dash.cooldown = this.abilities.dash.maxCooldown;
            return true;
        }
        return false;
    }

    /**
     * Ataque de área - daña a todos los enemigos cercanos
     */
    useAOE(world) {
        const player = this.player;
        const damage = (player.stats?.attack ?? 1) * 2;
        let hitCount = 0;

        // Encontrar todos los enemigos en un radio de 2
        const nearbyEnemies = world.entities.filter(e =>
            (e.type === ENTITY_TYPE.ENEMY || e.type === ENTITY_TYPE.RANGED_ENEMY || e.type === ENTITY_TYPE.BOSS) &&
            Math.abs(e.x - player.x) + Math.abs(e.y - player.y) <= 2
        );

        nearbyEnemies.forEach(enemy => {
            if (enemy.stats) {
                enemy.stats.hp -= damage;
                if (enemy.stats.hp <= 0) {
                    enemy.dead = true;
                }
                hitCount++;
            }
        });

        if (hitCount > 0) {
            this.abilities.aoe.cooldown = this.abilities.aoe.maxCooldown;
            return true;
        }
        return false;
    }

    /**
     * Curación
     */
    useHeal() {
        const player = this.player;
        const healAmount = 5;
        player.stats.hp = (player.stats.hp || 0) + healAmount;
        this.abilities.heal.cooldown = this.abilities.heal.maxCooldown;
        return true;
    }

    /**
     * Actualiza los cooldowns
     */
    update() {
        for (const ability of Object.values(this.abilities)) {
            if (ability.cooldown > 0) {
                ability.cooldown--;
            }
        }
    }

    /**
     * Obtiene el estado de las habilidades
     */
    getAbilitiesStatus() {
        return Object.entries(this.abilities).map(([key, ability]) => ({
            key,
            name: ability.name,
            cooldown: ability.cooldown,
            maxCooldown: ability.maxCooldown,
            ready: ability.cooldown === 0,
            unlocked: ability.unlocked,
            cost: ability.cost
        }));
    }

    /**
     * Obtiene habilidades disponibles para comprar
     */
    getAvailableAbilities() {
        return Object.entries(this.abilities)
            .filter(([_, ability]) => !ability.unlocked)
            .map(([key, ability]) => ({
                key,
                name: ability.name,
                description: ability.description,
                cost: ability.cost
            }));
    }
}
