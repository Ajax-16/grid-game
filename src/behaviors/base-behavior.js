/**
 * Clase base para comportamientos de entidades
 */
export class BaseBehavior {
    constructor(entity) {
        this.entity = entity;
    }

    /**
     * Actualiza el comportamiento cada tick
     */
    update(world, player, tick) {
        // Implementar en subclases
    }

    /**
     * Obtiene el tipo de comportamiento
     */
    getType() {
        return 'base';
    }
}
