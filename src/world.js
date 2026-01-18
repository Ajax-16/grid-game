// world.js
import { ConsoleGrid } from "./models/console.grid.js";
import { PlayerEntity } from "./entities/player-entity.js";
import { EntityFactory } from "./factories/entity-factory.js";
import { BossEnemyEntity } from "./entities/boss-enemy-entity.js";
import { setupEnemyRegistry } from "./registry/enemy-registry-config.js";
import { ENTITY_TYPE } from "./data/entity.type.js";
import { chance, setSeed, randomInt } from "./utils/random.js";
import { MazeGenerator } from "./utils/maze-generator.js";
import { Camera } from "./utils/camera.js";

const ITEM_SPAWN_RATE = 0.015;
const ENEMY_SPAWN_RATE = 0.0025;

export class World {
    constructor(size = { cols: 80, rows: 40 }, seed = null, GridClass = ConsoleGrid) {
        // Tamaño del mundo (más grande para el laberinto)
        this.worldCols = size.cols || 80;
        this.worldRows = size.rows || 40;

        // Tamaño de la vista (lo que se muestra en pantalla)
        this.viewCols = 20;
        this.viewRows = 10;

        // Inicializar semilla aleatoria
        if (seed === null) {
            seed = Math.floor(Math.random() * 1000000);
        }
        setSeed(seed);
        this.seed = seed;

        this.tick = 0;
        this.gameOver = false;
        this.paused = false;

        // Callbacks para eventos
        this.onEnemyKilled = null;
        this.onPlayerKilled = null;

        const graphics = { wall: '#' };
        this.graphics = graphics;

        // Generar el laberinto
        this.mazeGen = new MazeGenerator(seed, this.worldCols, this.worldRows, this.graphics);
        const mazeGrid = this.mazeGen.generate();

        // Crear el grid con el laberinto generado (puede ser ConsoleGrid o PhaserGrid)
        this.grid = new GridClass({
            cols: this.worldCols,
            rows: this.worldRows,
            graphics: this.graphics,
            initialGrid: mazeGrid
        });

        // Encontrar una posición válida para el jugador
        const playerPos = this.mazeGen.findValidPosition();
        const player = new PlayerEntity(
            playerPos.x,
            playerPos.y,
            { range: 1, attack: 1, hp: 10, speed: 1, attackSpeed: 1 },
            null // input se asignará después
        );
        this.entities = [player];

        this.projectiles = [];
        this.enemyRegistry = setupEnemyRegistry();
        this.grid.setEntities([...this.entities, ...this.projectiles]);

        // Sistema de oleadas
        this.waveSystem = null; // Se inicializará en Engine

        // Crear cámara
        this.camera = new Camera(this.viewCols, this.viewRows);
    }

    // ---- Tick update ----
    update(player) {
        // No avanzar ticks si está pausado
        if (this.paused) return;

        this.tick++;

        for (const entity of this.entities) {
            entity.tickCounter ??= 0;
            entity.speed ??= entity.stats?.speed ?? 1;

            // Actualizar cooldown de ataque
            entity.updateAttackCooldown();

            entity.tickCounter++;

            if (entity.tickCounter < this.getTickDelay(entity)) continue;
            entity.tickCounter = 0;

            // Enemigos con comportamientos
            if (entity.type === ENTITY_TYPE.ENEMY || entity.type === ENTITY_TYPE.RANGED_ENEMY || entity.type === ENTITY_TYPE.BOSS) {
                if (entity.updateBehaviors) {
                    // Usar sistema de comportamientos
                    entity.updateBehaviors(this, player, this.tick);

                    // Si tiene comportamiento de movimiento, usarlo para perseguir
                    const movementBehavior = entity.getBehavior('movement');
                    if (movementBehavior) {
                        const distance = Math.abs(entity.x - player.entity.x) +
                            Math.abs(entity.y - player.entity.y);
                        if (distance > 1) {
                            movementBehavior.moveToTarget(player.entity, this.grid);
                        }
                    }
                }
            }

            // Game over si hp jugador <= 0
            if (player.entity.stats.hp <= 0) this.gameOver = true;
        }

        // Filtrar entidades muertas y notificar si eran enemigos
        this.entities = this.entities.filter(e => {
            if (e.dead) {
                // Si era un enemigo, notificar
                if ((e.type === ENTITY_TYPE.ENEMY || e.type === ENTITY_TYPE.RANGED_ENEMY) &&
                    this.onEnemyKilled) {
                    // Asumir que el jugador lo mató (se puede mejorar después)
                    this.onEnemyKilled(e, player.entity);
                }
                return false;
            }
            return true;
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

    // ---- Tamaño del mundo ----
    getWorldSize() {
        return { cols: this.worldCols, rows: this.worldRows };
    }

    // ---- Obtener cámara ----
    getCamera() {
        return this.camera;
    }

    // ---- Construir grilla ----
    buildGrid(player) {
        // Actualizar cámara para seguir al jugador
        if (player && player.entity) {
            this.camera.follow(
                player.entity.x,
                player.entity.y,
                this.worldCols,
                this.worldRows
            );
        }

        this.grid.setEntities([...this.entities, ...this.projectiles]);
        this.grid.clear();

        for (const e of [...this.entities, ...this.projectiles]) {
            // Limitar posición dentro del mundo
            e.x = Math.max(1, Math.min(e.x, this.grid.cols - 2));
            e.y = Math.max(1, Math.min(e.y, this.grid.rows - 2));

            // Solo colocar si está en una celda válida (no muro)
            if (!this.grid.isWall(e.x, e.y)) {
                this.grid.place(e);
            }
        }

        // Obtener el grid completo y la vista de la cámara
        const fullGrid = this.grid.get();
        const bounds = this.camera.getVisibleBounds();

        // Extraer solo la parte visible
        const visibleGrid = [];
        for (let y = bounds.startY; y < bounds.endY; y++) {
            const row = [];
            for (let x = bounds.startX; x < bounds.endX; x++) {
                if (y >= 0 && y < fullGrid.length && x >= 0 && x < fullGrid[y].length) {
                    row.push(fullGrid[y][x]);
                } else {
                    row.push(this.graphics.wall);
                }
            }
            visibleGrid.push(row);
        }

        return visibleGrid;
    }

    // ---- Generar enemigos ----
    generateEnemies(player) {
        if (!this.waveSystem) return;

        const difficulty = this.waveSystem.getDifficultyMultiplier();
        const baseSpawnRate = this.waveSystem.isBossWave()
            ? ENEMY_SPAWN_RATE * 2
            : ENEMY_SPAWN_RATE;

        const spawnChance = baseSpawnRate + difficulty / 10;

        if (!chance(spawnChance)) return;

        const pos = this.getSpawnPositionNearPlayer(player);
        if (!pos) return;

        let enemy;

        if (this.waveSystem.isBossWave() && chance(30)) {
            const stats = BossEnemyEntity.calculateStats(difficulty);
            enemy = new BossEnemyEntity(pos.x, pos.y, stats);
        } else {
            enemy = this.enemyRegistry.createRandom(pos.x, pos.y, difficulty);
        }

        if (enemy) this.entities.push(enemy);
    }

    // ---- Generar items ----
    generateItems(player) {
        const difficulty = this.waveSystem.getDifficultyMultiplier();
        const spawnChance = ITEM_SPAWN_RATE + difficulty / 10;

        if (!chance(spawnChance)) return;

        const pos = this.getSpawnPositionNearPlayer(player);
        if (!pos) return;

        const stats = ['hp', 'attack', 'range', 'speed', 'attackSpeed'];
        const stat = stats[randomInt(0, stats.length - 1)];
        const value = 1 + Math.floor(difficulty / 2);

        const item = EntityFactory.createItem(pos.x, pos.y, { [stat]: value });
        item.effect = { stat, value };

        this.entities.push(item);
    }

    getSpawnPositionNearPlayer(player, {
        preferOutsideCameraChance = 70,
        cameraMargin = 2,
        maxAttempts = 50
    } = {}) {
        const cameraBounds = this.camera.getVisibleBounds();
        const px = player.entity.x;
        const py = player.entity.y;

        let x, y;
        let attempts = 0;

        while (attempts < maxAttempts) {
            attempts++;

            if (chance(preferOutsideCameraChance)) {
                const side = randomInt(0, 3);

                switch (side) {
                    case 0: // arriba
                        x = randomInt(
                            cameraBounds.startX - cameraMargin,
                            cameraBounds.endX + cameraMargin
                        );
                        y = randomInt(
                            cameraBounds.startY - 2 - cameraMargin,
                            cameraBounds.startY - cameraMargin
                        );
                        break;

                    case 1: // abajo
                        x = randomInt(
                            cameraBounds.startX - cameraMargin,
                            cameraBounds.endX + cameraMargin
                        );
                        y = randomInt(
                            cameraBounds.endY + cameraMargin,
                            cameraBounds.endY + 2 + cameraMargin
                        );
                        break;

                    case 2: // izquierda
                        x = randomInt(
                            cameraBounds.startX - 2 - cameraMargin,
                            cameraBounds.startX - cameraMargin
                        );
                        y = randomInt(
                            cameraBounds.startY - cameraMargin,
                            cameraBounds.endY + cameraMargin
                        );
                        break;

                    case 3: // derecha
                        x = randomInt(
                            cameraBounds.endX + cameraMargin,
                            cameraBounds.endX + 2 + cameraMargin
                        );
                        y = randomInt(
                            cameraBounds.startY - cameraMargin,
                            cameraBounds.endY + cameraMargin
                        );
                        break;
                }

                // Acotar hacia el jugador (sin spawn encima)
                x = px + Math.sign(x - px || 1) * randomInt(2, Math.floor(this.grid.cols / 3));
                y = py + Math.sign(y - py || 1) * randomInt(2, Math.floor(this.grid.rows / 3));
            } else {
                // Spawn libre en el mapa
                x = randomInt(1, this.grid.cols - 2);
                y = randomInt(1, this.grid.rows - 2);
            }

            // Clamp world bounds
            x = Math.max(1, Math.min(this.grid.cols - 2, x));
            y = Math.max(1, Math.min(this.grid.rows - 2, y));

            if (!this.grid.isWall(x, y) && !this.grid.isOccupied(x, y)) {
                return { x, y };
            }
        }

        return null;
    }

    removeEntity(entity) {
        const idx = this.entities.indexOf(entity);
        if (idx !== -1) this.entities.splice(idx, 1);
    }

    // ---- Auxiliar: stat random ----
    getRandomStat() {
        const stats = ['hp', 'attack', 'range', 'speed', 'attackSpeed'];
        return stats[randomInt(0, stats.length - 1)];
    }
}
