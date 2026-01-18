import { ItemEntity } from "./item-entity.js";
import { ENTITY_TYPE } from "../data/entity.type.js";

/**
 * Items especiales con efectos únicos
 */
export class SpecialItemEntity extends ItemEntity {
    constructor(x, y, effectType) {
        super(x, y, {});
        this.effectType = effectType;
        this.char = this.getCharForEffect(effectType);
    }

    getCharForEffect(effectType) {
        const chars = {
            'health': 'H',
            'damage': 'D',
            'speed': 'S',
            'range': 'R',
            'attackSpeed': 'A',
            'combo': 'C',
            'shield': '🛡'
        };
        return chars[effectType] || '?';
    }

    static createRandom(x, y) {
        const effects = ['health', 'damage', 'speed', 'range', 'attackSpeed', 'combo'];
        const effect = effects[Math.floor(Math.random() * effects.length)];
        return new SpecialItemEntity(x, y, effect);
    }
}
