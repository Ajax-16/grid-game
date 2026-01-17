import { ENTITY_TYPE } from "../data/entity.type.js";

export class Item {
    constructor(entity) {
        this.entity = entity;
        this.entity.char = 'I';
        this.entity.type = ENTITY_TYPE.OBJ;
    }
}
