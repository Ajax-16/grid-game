// world.js
import { ConsoleGrid } from "./models/console.grid.js";
import { Entity } from "./entities/entity.js";
import { Enemy } from "./entities/enemy.js";
import { Item } from "./entities/item.js";
import { ENTITY_TYPE } from "./data/entity.type.js";
import { chance, setSeed, randomInt } from "./utils/random.js";
import { MazeGenerator } from "./utils/maze-generator.js";
import { Camera } from "./utils/camera.js";

const ITEM_SPAWN_RATE = 0.015;
const ENEMY_SPAWN_RATE = 0.0025;

export class World {
    constructor(size = { cols: 80, rows: 40}, seed = null) {
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

        const graphics = { wall: '#' };
        this.graphics = graphics;

        // Generar el laberinto
        const mazeGen = new MazeGenerator(seed, this.worldCols, this.worldRows, this.graphics);
        const mazeGrid = mazeGen.generate();

        // Crear el grid con el laberinto generado
        this.grid = new ConsoleGrid({
            cols: this.worldCols,
            rows: this.worldRows,
            graphics: this.graphics,
            initialGrid: mazeGrid
        });

        // Encontrar una posición válida para el jugador
        const playerPos = mazeGen.findValidPosition();
        this.entities = [
            new Entity(playerPos.x, playerPos.y, { range: 1, attack: 1, hp: 10, speed: 1 })
        ];

        this.projectiles = [];
        this.grid.setEntities([...this.entities, ...this.projectiles]);

        // Crear cámara
        this.camera = new Camera(this.viewCols, this.viewRows);
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
                    row.push('#');
                }
            }
            visibleGrid.push(row);
        }

        return visibleGrid;
    }

    // ---- Generar enemigos ----
    generateEnemies() {
        const difficulty = this.getDifficultyFactor();
        const spawnChance = ENEMY_SPAWN_RATE + difficulty / 10;

        if (chance(spawnChance)) {
            // Buscar una posición válida (suelo, no ocupada)
            let x, y;
            let attempts = 0;
            do {
                x = randomInt(1, this.grid.cols - 2);
                y = randomInt(1, this.grid.rows - 2);
                attempts++;
            } while ((this.grid.isOccupied(x, y) || this.grid.isWall(x, y)) && attempts < 50);

            // Si no encontramos posición válida, no generar enemigo
            if (attempts >= 50) return;

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
            // Buscar una posición válida (suelo, no ocupada)
            let x, y;
            let attempts = 0;
            do {
                x = randomInt(1, this.grid.cols - 2);
                y = randomInt(1, this.grid.rows - 2);
                attempts++;
            } while ((this.grid.isOccupied(x, y) || this.grid.isWall(x, y)) && attempts < 50);

            // Si no encontramos posición válida, no generar item
            if (attempts >= 50) return;

            const stats = ['hp', 'attack', 'range', 'speed'];
            const stat = stats[randomInt(0, stats.length - 1)];

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
        return stats[randomInt(0, stats.length - 1)];
    }
}
