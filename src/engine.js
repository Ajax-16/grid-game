// engine.js
import { ENTITY_TYPE } from "./data/entity.type.js";
import { PlayerEntity } from "./entities/player-entity.js";
import { Input } from "./models/console.input.js";
import { World } from "./world.js";

export class Engine {
    constructor({ fps = 60, render, stopRender, input, world }) {
        this.step = 1000 / fps;
        this.running = false;
        this.render = render;
        this.stopRender = stopRender;
        this.input = input;
        this.world = world;

        // Asignar input al jugador
        const playerEntity = world.entities[0];
        if (playerEntity instanceof PlayerEntity) {
            playerEntity.input = input;
            playerEntity.playerBehavior.input = input;
        }
        this.player = { entity: playerEntity };
    }

    start() {
        this.running = true;
        this.loop();
    }

    loop() {
        if (!this.running) return;

        const data = this.update();
        this.draw(data);

        if (this.world.gameOver) this.stop();

        setTimeout(() => this.loop(), this.step);
    }

    update() {
        const { player, world } = this;

        // Movimiento y acciones
        if (player.entity instanceof PlayerEntity) {
            player.entity.readInput();
            player.entity.checkMove(world);
            player.entity.checkAction(world);
            player.entity.input.clear();
        }

        // Avanzar tick
        world.update(player);

        world.generateEnemies();
        world.generateItems();

        // Logs de info
        const infoLogs = [];
        if (!world.gameOver) {
            infoLogs.push({ key: 'Seed', value: world.seed });
            infoLogs.push({ key: 'Difficulty', value: Math.floor(world.getDifficultyFactor()) });
            infoLogs.push({ key: 'Player', value: JSON.stringify(player.entity.stats) });

            // Mostrar enemigos cercanos
            const enemies = world.entities.filter(e =>
                (e.type === ENTITY_TYPE.ENEMY || e.type === ENTITY_TYPE.RANGED_ENEMY) &&
                player.entity &&
                Math.abs(e.x - player.entity.x) + Math.abs(e.y - player.entity.y) <= 3
            );
            enemies.forEach((e, i) => {
                const type = e.type === ENTITY_TYPE.RANGED_ENEMY ? 'R' : 'E';
                infoLogs.push({
                    key: `${type} ${i}`,
                    value: `HP:${e.stats.hp} ATK:${e.stats.attack} SPD:${e.stats.speed} ASPD:${e.stats.attackSpeed?.toFixed(1) ?? 1}`
                });
            });

        } else {
            infoLogs.push({ key: 'GAMEOVER' });
        }

        return {
            grid: world.buildGrid(player),
            info: infoLogs
        };
    }

    draw(data) {
        this.render(data);
    }

    async stop() {
        this.running = false;
        const restart = await this.stopRender();
        if (restart) this.restart();
    }

    restart() {
        this.world = new World({ cols: 80, rows: 40 });
        this.input = new Input();
        const playerEntity = this.world.entities[0];
        if (playerEntity instanceof PlayerEntity) {
            playerEntity.input = this.input;
            playerEntity.playerBehavior.input = this.input;
        }
        this.player = { entity: playerEntity };

        this.running = true;
        this.loop();
    }

}
