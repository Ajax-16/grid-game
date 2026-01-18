import { PlayerEntity } from "../entities/player-entity.js";
import { ItemEntity } from "../entities/item-entity.js";

/**
 * Factory simplificado que usa las nuevas clases con herencia
 */
export class EntityFactory {
    /**
     * Crea un jugador
     */
    static createPlayer(x, y, stats, input) {
        return new PlayerEntity(x, y, stats, input);
    }

    /**
     * Crea un item
     */
    static createItem(x, y, stats) {
        return new ItemEntity(x, y, stats);
    }
}
