import { Entity } from "./entity.js";
import { ENTITY_TYPE } from "../data/entity.type.js";

/**
 * Entidad de item (no necesita comportamientos)
 */
export class ItemEntity extends Entity {
    constructor(x, y, stats) {
        super(x, y, stats);
        this.char = 'I';
        this.type = ENTITY_TYPE.OBJ;
    }
}
