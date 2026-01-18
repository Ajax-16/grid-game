import { EnemyEntity } from "../entities/enemy-entity.js";
import { FastEnemyEntity } from "../entities/fast-enemy-entity.js";
import { RangedEnemyEntity } from "../entities/ranged-enemy-entity.js";
import { BossEnemyEntity } from "../entities/boss-enemy-entity.js";
import { EnemyRegistry } from "./enemy-registry.js";

/**
 * Configuración del registro de enemigos
 * Aquí se definen todos los tipos de enemigos y sus probabilidades
 */
export function setupEnemyRegistry() {
    const registry = new EnemyRegistry();

    registry.register(EnemyEntity, 70);

    registry.register(RangedEnemyEntity, 20);

    registry.register(FastEnemyEntity, 20);

    return registry;
}

/**
 * Ejemplo de cómo agregar un nuevo tipo de enemigo:
 * 
 * 1. Crear una nueva clase que extienda EnemyEntity:
 * 
 *    export class FastEnemyEntity extends EnemyEntity {
 *        constructor(x, y, stats) {
 *            super(x, y, stats, 'F');
 *            // Personalizar comportamientos si es necesario
 *        }
 *        
 *        static calculateStats(difficulty) {
 *            const base = super.calculateStats(difficulty);
 *            return { ...base, speed: base.speed * 2 };
 *        }
 *    }
 * 
 * 2. Registrarlo aquí:
 * 
 *    registry.register(FastEnemyEntity, 20); // 20% de probabilidad relativa
 */
