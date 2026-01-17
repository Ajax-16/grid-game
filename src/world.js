// world.js
import { ConsoleGrid } from "./models/console.grid.js";
import { Entity } from "./entities/entity.js";
import { Enemy } from "./entities/enemy.js";
import { Item } from "./entities/item.js";
import { ENTITY_TYPE } from "./data/entity.type.js";
import { chance } from "./utils/random.js";

const ITEM_SPAWN_RATE = 0.05;
const ENEMY_SPAWN_RATE = 0.15;

export class World {
    constructor(size = { cols: 20, rows: 10}) {
        this.baseCols = size.cols || 20;
        this.baseRows = size.rows || 10;

        this.tick = 0;
        this.gameOver = false;

        this.entities = [
            new Entity(2, 2, { range: 1, attack: 1, hp: 10, speed: 1 })
        ];

        this.projectiles = [];

        this.grid = new ConsoleGrid({
            cols: this.baseCols,
            rows: this.baseRows,
            graphics: { wall: '#' }
        });

        this.grid.setEntities([...this.entities, ...this.projectiles]);
    }

    // ---- Tick update ----
    update(player) {
        this.tick++;

        for (const entity of this.entities) {
            entity.tickCounter ??= 0;
            entity.speed ??= entity.stats?.speed ?? 1;

            entity.tickCounter++;

            if (entity.tickCounter < this.getTickDelay(entity)) continue;
            entity.tickCounter = 0;

            // Enemigos atacan o se mueven
            if (entity.type === ENTITY_TYPE.ENEMY) {
                const diff =
                    Math.abs(entity.x - player.entity.x) +
                    Math.abs(entity.y - player.entity.y);

                if (diff === 1) {
                    entity.attackEntity(player.entity);
                } else {
                    entity.moveToEntity(player.entity, this.grid);
                }
            }

            // Game over si hp jugador <= 0
            if (player.entity.stats.hp <= 0) this.gameOver = true;
        }

        this.entities = this.entities.filter(e => {
            if (!e.dead) return true;
        });

        for (const projectile of this.projectiles) {
            projectile.update(this);
        }

        // Limpieza
        this.projectiles = this.projectiles.filter(p =>
            this.entities.includes(p.entity)
        );
    }

    // ---- Tick delay según speed ----
    getTickDelay(entity) {
        return Math.max(1, Math.floor(10 / (entity.stats?.speed ?? 1)));
    }

    // ---- Dificultad basada en tick ----
    getDifficultyFactor() {
        return Math.sqrt(this.tick / 100);
    }

    // ---- Tamaño dinámico del mundo ----
    getWorldSize() {
        const difficulty = this.getDifficultyFactor();
        const cols = this.baseCols + Math.floor(difficulty);
        const rows = this.baseRows + Math.floor(difficulty);
        return { cols, rows };
    }

    // ---- Construir grilla ----
    buildGrid() {
        this.grid.setEntities([...this.entities, ...this.projectiles]);
        this.grid.clear();

        for (const e of [...this.entities, ...this.projectiles]) {
            e.x = Math.min(e.x, this.grid.cols - 1);
            e.y = Math.min(e.y, this.grid.rows - 1);
            this.grid.place(e);
        }

        return this.grid.get();
    }

    // ---- Generar enemigos ----
    generateEnemies() {
        const difficulty = this.getDifficultyFactor();
        const spawnChance = ENEMY_SPAWN_RATE + difficulty / 10;

        if (chance(spawnChance)) {
            let x, y;
            do {
                x = Math.floor(Math.random() * this.grid.cols);
                y = Math.floor(Math.random() * this.grid.rows);
            } while (this.grid.isOccupied(x, y));

            const hp = Math.floor(difficulty);
            const speed = 0.5 + Math.floor(difficulty / 5);
            const attack = 1 + Math.floor(difficulty / 2);

            const enemy = new Enemy(new Entity(x, y, { hp, speed, attack }));

            // Boss aleatorio
            if (difficulty > 5 && chance(70)) {
                enemy.entity.char = 'B';
                enemy.entity.stats.hp *= 3;
                enemy.entity.stats.attack *= 3;
                enemy.entity.stats.speed *= 1.25;
            }

            this.entities.push(enemy.entity);
        }
    }

    // ---- Generar items ----
    generateItems() {
        const difficulty = this.getDifficultyFactor();
        const spawnChance = ITEM_SPAWN_RATE + difficulty / 10;

        if (chance(spawnChance)) {
            let x, y;
            do {
                x = Math.floor(Math.random() * this.grid.cols);
                y = Math.floor(Math.random() * this.grid.rows);
            } while (this.grid.isOccupied(x, y));

            const stats = ['hp', 'attack', 'range', 'speed'];
            const stat = stats[Math.floor(Math.random() * stats.length)];

            const value = 1 + Math.floor(difficulty / 2);

            const item = new Item(
                new Entity(x, y, { [stat]: value })
            );
            item.entity.effect = { stat, value };

            this.entities.push(item.entity);
        }
    }

    removeEntity(entity) {
        const idx = this.entities.indexOf(entity);
        if (idx !== -1) this.entities.splice(idx, 1);
    }

    // ---- Auxiliar: stat random ----
    getRandomStat() {
        const stats = ['hp', 'attack', 'range', 'speed'];
        return stats[Math.floor(Math.random() * stats.length)];
    }
}
