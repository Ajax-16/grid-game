import { GameEntity } from "./game-entity.js";
import { ENTITY_TYPE } from "../data/entity.type.js";
import { PlayerBehavior } from "../behaviors/player-behavior.js";
import { AbilitySystem } from "../systems/ability-system.js";

/**
 * Entidad del jugador
 */
export class PlayerEntity extends GameEntity {
    constructor(x, y, stats, input) {
        super(x, y, stats, 'P', ENTITY_TYPE.PLAYER);
        this.input = input;
        this.points = 0;
        
        // Agregar comportamiento del jugador
        const playerBehavior = new PlayerBehavior(this, input);
        this.addBehavior(playerBehavior);
        this.playerBehavior = playerBehavior;
        
        // Sistema de habilidades (inicialmente sin habilidades desbloqueadas)
        this.abilitySystem = new AbilitySystem(this);
        this.abilitySystem.unlockAbility = (abilityName) => {
            // Las habilidades se desbloquean comprándolas en la tienda
            if (this.abilitySystem.abilities[abilityName]) {
                this.abilitySystem.abilities[abilityName].unlocked = true;
            }
        };
    }

    readInput() {
        this.playerBehavior.readInput();
    }

    checkMove(world) {
        this.playerBehavior.checkMove(world);
    }

    checkAction(world) {
        this.playerBehavior.checkAction(world);
    }
}
