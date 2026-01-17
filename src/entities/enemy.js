import { ENTITY_TYPE } from "../data/entity.type.js";

export class Enemy {
    constructor(entity) {
        this.entity = entity;
        this.entity.char = 'E';
        this.entity.type = ENTITY_TYPE.ENEMY;
    }

}