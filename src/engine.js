// engine.js
import { ENTITY_TYPE } from "./data/entity.type.js";
import { PlayerEntity } from "./entities/player-entity.js";
import { Input } from "./models/console.input.js";
import { World } from "./world.js";
import { UpgradeSystem } from "./systems/upgrade-system.js";
import { PointsSystem } from "./systems/points-system.js";
import { ShopSystem } from "./systems/shop-system.js";
import { WaveSystem } from "./systems/wave-system.js";
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
        
        // Sistema de puntos
        this.pointsSystem = new PointsSystem();
        
        // Sistema de tienda
        this.shopSystem = new ShopSystem();
        
        // Sistema de oleadas
        this.waveSystem = new WaveSystem();
        world.waveSystem = this.waveSystem;
        
        // Configurar callbacks
        world.onItemPickup = (item) => {
            this.handleItemPickup(item);
        };
        
        world.onEnemyKilled = (enemy, killer) => {
            this.handleEnemyKilled(enemy, killer);
        };
    }

    start() {
        this.running = true;
        // Solo iniciar loop automático si no estamos en Phaser
        // Phaser manejará el loop desde su método update()
        if (typeof window === 'undefined' || !window.Phaser) {
            this.loop();
        }
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
        } else if (this.shopSystem.isActive) {
            // Manejar tienda
            this.handleShopSelection();
            player.entity.input.clear();
        } else {
            // Abrir tienda con tecla S
            if (player.entity.input && player.entity.input.isPressed(KEYMAP.S)) {
                this.openShop();
            }
            
            // Habilidades especiales
            if (player.entity.abilitySystem) {
                if (player.entity.input.isPressed(KEYMAP.Q)) {
                    player.entity.abilitySystem.activateAbility('dash', world);
                } else if (player.entity.input.isPressed(KEYMAP.W)) {
                    player.entity.abilitySystem.activateAbility('aoe', world);
                } else if (player.entity.input.isPressed(KEYMAP.E)) {
                    player.entity.abilitySystem.activateAbility('heal', world);
                }
            }
            // Movimiento y acciones normales
            if (player.entity instanceof PlayerEntity) {
                player.entity.readInput();
                player.entity.checkMove(world);
                player.entity.checkAction(world);
                player.entity.input.clear();
            }

            // Avanzar tick solo si no está pausado
            world.update(player);
            
            // Actualizar sistemas
            this.pointsSystem.update(world.tick);
            if (player.entity.abilitySystem) {
                player.entity.abilitySystem.update();
            }
            
            world.generateEnemies(player);
            world.generateItems(player);
        }

        // Logs de info
        const infoLogs = [];
        
        // Si la tienda está activa, mostrar items
        if (this.shopSystem.isActive) {
            infoLogs.push({ key: '=== TIENDA ===', value: '' });
            infoLogs.push({ key: 'Puntos disponibles', value: this.pointsSystem.getTotal() });
            infoLogs.push({ key: '', value: '' });
            
            this.shopSystem.items.forEach((item, index) => {
                const marker = index === this.shopSystem.selectedIndex ? '>>> ' : '    ';
                const canAfford = this.pointsSystem.getTotal() >= item.cost;
                const affordMark = canAfford ? '' : ' [NO DISPONIBLE]';
                infoLogs.push({ 
                    key: `${marker}[${index + 1}] ${item.name}`, 
                    value: `${item.description} - ${item.cost} pts${affordMark}` 
                });
            });
            
            infoLogs.push({ key: '', value: '' });
            infoLogs.push({ key: 'Flechas: Navegar | Enter: Comprar | ESC: Salir', value: '' });
        } else if (this.upgradeSystem.isActive) {
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
            // Información de oleada
            const waveInfo = this.waveSystem.getWaveInfo();
            const waveTitle = waveInfo.isBossWave ? '⚠️  OLEADA BOSS ' + waveInfo.wave + ' ⚠️' : '=== OLEADA ' + waveInfo.wave + ' ===';
            infoLogs.push({ key: waveTitle, value: '' });
            
            // Barra de progreso visual
            const progressBar = '█'.repeat(Math.floor(waveInfo.progress / 10)) + 
                              '░'.repeat(10 - Math.floor(waveInfo.progress / 10));
            infoLogs.push({ key: 'Progreso', value: `${waveInfo.killed}/${waveInfo.required} [${progressBar}] ${waveInfo.progress}%` });
            
            if (waveInfo.isBossWave) {
                infoLogs.push({ key: '⚠️  ¡CUIDADO! Bosses aparecerán ⚠️', value: '' });
            }
            infoLogs.push({ key: '', value: '' });
            
            infoLogs.push({ key: 'Seed', value: world.seed });
            infoLogs.push({ key: 'Puntos', value: this.pointsSystem.getTotal() });
            
            // Mostrar combo si está activo
            const combo = this.pointsSystem.getCombo();
            if (combo > 1) {
                infoLogs.push({ 
                    key: '🔥 COMBO', 
                    value: `x${combo} (Racha: ${this.pointsSystem.getKillStreak()})` 
                });
            }
            
            // Habilidades desbloqueadas
            if (player.entity.abilitySystem) {
                const abilities = player.entity.abilitySystem.getAbilitiesStatus();
                const unlockedAbilities = abilities.filter(a => a.unlocked);
                if (unlockedAbilities.length > 0) {
                    unlockedAbilities.forEach(ability => {
                        const status = ability.ready ? '✓ Listo' : `⏱ ${ability.cooldown}`;
                        infoLogs.push({ 
                            key: `${ability.name} (${ability.key.toUpperCase()})`, 
                            value: status 
                        });
                    });
                } else {
                    infoLogs.push({ key: 'Habilidades', value: 'Compra habilidades en la tienda (S)' });
                }
            }
            
            infoLogs.push({ key: '', value: '' });
            infoLogs.push({ key: 'Controles', value: 'S: Tienda | Q: Dash | W: AOE | E: Curar' });
            infoLogs.push({ key: 'Player', value: JSON.stringify(player.entity.stats) });

            // Mostrar enemigos cercanos
            const enemies = world.entities.filter(e =>
                (e.type === ENTITY_TYPE.ENEMY || e.type === ENTITY_TYPE.RANGED_ENEMY || e.type === ENTITY_TYPE.BOSS) &&
                player.entity &&
                Math.abs(e.x - player.entity.x) + Math.abs(e.y - player.entity.y) <= 3
            );
            enemies.forEach((e, i) => {
                let type = 'E';
                if (e.type === ENTITY_TYPE.RANGED_ENEMY) type = 'R';
                else if (e.type === ENTITY_TYPE.BOSS) type = 'BOSS';
                infoLogs.push({
                    key: `${type} ${i}`,
                    value: `HP:${e.stats.hp} ATK:${e.stats.attack} SPD:${e.stats.speed} ASPD:${e.stats.attackSpeed?.toFixed(1) ?? 1}`
                });
            });

        } else {
            infoLogs.push({ key: 'GAMEOVER' });
            infoLogs.push({ key: 'Puntos Finales', value: this.pointsSystem.getTotal() });
            infoLogs.push({ key: 'Mejor Racha', value: this.pointsSystem.getKillStreak() });
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
        const difficulty = this.waveSystem.getDifficultyMultiplier();
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

    handleEnemyKilled(enemy, killer) {
        if (killer && killer.type === ENTITY_TYPE.PLAYER) {
            const difficulty = this.waveSystem.getDifficultyMultiplier();
            const killData = this.pointsSystem.calculateKillPoints(enemy, difficulty, this.world.tick);
            this.pointsSystem.addPoints(killData.points);
            
            // Registrar muerte en el sistema de oleadas
            if (this.waveSystem) {
                const wasComplete = this.waveSystem.waveComplete;
                this.waveSystem.registerKill();
                
                // Si se completa la oleada, avanzar
                if (!wasComplete && this.waveSystem.waveComplete) {
                    // Bonificación por completar oleada
                    const waveBonus = this.waveSystem.currentWave * 10;
                    this.pointsSystem.addPoints(waveBonus);
                    this.waveSystem.nextWave();
                }
            }
        }
    }

    openShop() {
        // Pausar el mundo
        this.world.paused = true;
        
        // Generar items de la tienda (incluyendo habilidades disponibles)
        const difficulty = this.waveSystem.getDifficultyMultiplier();
        this.shopSystem.generateShopItems(
            difficulty, 
            this.player.entity.stats,
            this.player.entity.abilitySystem
        );
        
        // Abrir tienda
        this.shopSystem.open();
    }

    handleShopSelection() {
        const input = this.input;
        
        // Navegar con flechas
        if (input.isPressed(KEYMAP.UP)) {
            this.shopSystem.selectedIndex = Math.max(0, this.shopSystem.selectedIndex - 1);
        } else if (input.isPressed(KEYMAP.DOWN)) {
            this.shopSystem.selectedIndex = Math.min(
                this.shopSystem.items.length - 1, 
                this.shopSystem.selectedIndex + 1
            );
        }
        
        // Comprar con Enter o números
        if (input.isPressed(KEYMAP.ENTER)) {
            this.purchaseShopItem(this.shopSystem.selectedIndex);
        } else if (input.isPressed(KEYMAP.NUM1)) {
            this.purchaseShopItem(0);
        } else if (input.isPressed(KEYMAP.NUM2)) {
            this.purchaseShopItem(1);
        } else if (input.isPressed(KEYMAP.NUM3)) {
            this.purchaseShopItem(2);
        } else if (input.isPressed(KEYMAP.NUM4)) {
            this.purchaseShopItem(3);
        } else if (input.isPressed(KEYMAP.NUM5)) {
            this.purchaseShopItem(4);
        } else if (input.isPressed(KEYMAP.NUM6)) {
            this.purchaseShopItem(5);
        }
        
        // Cerrar con ESC
        if (input.isPressed(KEYMAP.ESC)) {
            this.closeShop();
        }
    }

    purchaseShopItem(index) {
        if (this.shopSystem.purchaseItem(index, this.pointsSystem, this.player.entity)) {
            // Item comprado exitosamente
            // La tienda permanece abierta para comprar más
        }
    }

    closeShop() {
        this.shopSystem.close();
        this.world.paused = false;
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
        
        // Reiniciar sistemas
        this.upgradeSystem = new UpgradeSystem();
        this.pointsSystem.reset();
        this.shopSystem = new ShopSystem();
        this.waveSystem = new WaveSystem();
        this.world.waveSystem = this.waveSystem;
        
        this.world.onItemPickup = (item) => {
            this.handleItemPickup(item);
        };
        
        this.world.onEnemyKilled = (enemy, killer) => {
            this.handleEnemyKilled(enemy, killer);
        };

        this.running = true;
        this.loop();
    }

}
