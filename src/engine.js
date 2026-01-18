// engine.js
import { ENTITY_TYPE } from "./data/entity.type.js";
import { PlayerEntity } from "./entities/player-entity.js";
import { Input } from "./models/console.input.js";
import { World } from "./world.js";
import { UpgradeSystem } from "./systems/upgrade-system.js";
import { KEYMAP } from "./data/keymap.js";

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
        
        // Sistema de mejoras
        this.upgradeSystem = new UpgradeSystem();
        
        // Configurar callback para cuando se coja un item
        world.onItemPickup = (item) => {
            this.handleItemPickup(item);
        };
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

        // Si el sistema de mejoras está activo, manejar selección
        if (this.upgradeSystem.isActive) {
            this.handleUpgradeSelection();
            // No procesar movimiento ni acciones durante la selección
            player.entity.input.clear();
        } else {
            // Movimiento y acciones normales
            if (player.entity instanceof PlayerEntity) {
                player.entity.readInput();
                player.entity.checkMove(world);
                player.entity.checkAction(world);
                player.entity.input.clear();
            }

            // Avanzar tick solo si no está pausado
            world.update(player);

            world.generateEnemies();
            world.generateItems();
        }

        // Logs de info
        const infoLogs = [];
        
        // Si el sistema de mejoras está activo, mostrar opciones
        if (this.upgradeSystem.isActive) {
            infoLogs.push({ key: '=== SELECCIONA UNA MEJORA ===', value: '' });
            infoLogs.push({ key: '', value: '' });
            
            this.upgradeSystem.options.forEach((option, index) => {
                const marker = index === this.upgradeSystem.selectedIndex ? '>>> ' : '    ';
                infoLogs.push({ 
                    key: `${marker}[${index + 1}] ${option.description}`, 
                    value: '' 
                });
            });
            
            infoLogs.push({ key: '', value: '' });
            infoLogs.push({ key: 'Flechas: Navegar | Enter: Confirmar | 1-3: Seleccionar directo', value: '' });
        } else if (!world.gameOver) {
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
            infoLogs.push({ key: 'Puntos conseguidos', value: player.entity.points });
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

    handleItemPickup(item) {
        // Pausar el mundo
        this.world.paused = true;
        
        // Generar opciones de mejoras
        const difficulty = this.world.getDifficultyFactor();
        this.upgradeSystem.generateOptions(difficulty);
    }

    handleUpgradeSelection() {
        const input = this.input;
        
        // Navegar con flechas arriba/abajo
        if (input.isPressed(KEYMAP.UP)) {
            this.upgradeSystem.selectedIndex = Math.max(0, this.upgradeSystem.selectedIndex - 1);
        } else if (input.isPressed(KEYMAP.DOWN)) {
            this.upgradeSystem.selectedIndex = Math.min(
                this.upgradeSystem.options.length - 1, 
                this.upgradeSystem.selectedIndex + 1
            );
        }
        
        // Confirmar con Enter o seleccionar directamente con 1, 2, 3
        if (input.isPressed(KEYMAP.ENTER)) {
            this.applyUpgrade(this.upgradeSystem.selectedIndex);
        } else if (input.isPressed(KEYMAP.NUM1)) {
            this.applyUpgrade(0);
        } else if (input.isPressed(KEYMAP.NUM2)) {
            this.applyUpgrade(1);
        } else if (input.isPressed(KEYMAP.NUM3)) {
            this.applyUpgrade(2);
        }
    }

    applyUpgrade(index) {
        const option = this.upgradeSystem.selectOption(index);
        if (option) {
            // Aplicar la mejora al jugador
            const stats = { [option.stat]: option.value };
            this.player.entity.addStats({ stats });
            
            // Cerrar el sistema de mejoras
            this.upgradeSystem.close();
            
            // Reanudar el mundo
            this.world.paused = false;
        }
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
        
        // Reiniciar sistema de mejoras
        this.upgradeSystem = new UpgradeSystem();
        this.world.onItemPickup = (item) => {
            this.handleItemPickup(item);
        };

        this.running = true;
        this.loop();
    }

}
