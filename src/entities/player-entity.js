import { GameEntity } from "./game-entity.js";
import { ENTITY_TYPE } from "../data/entity.type.js";
import { PlayerBehavior } from "../behaviors/player-behavior.js";

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
