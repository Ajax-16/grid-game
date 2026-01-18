/**
 * Sistema de tienda donde se pueden comprar mejoras con puntos
 */
export class ShopSystem {
    constructor() {
        this.isActive = false;
        this.selectedIndex = 0;
        this.items = [];
    }

    /**
     * Genera items de la tienda basados en la dificultad actual
     */
    generateShopItems(difficulty, playerStats) {
        this.items = [
            {
                name: 'Poción de Vida',
                description: '+5 HP',
                cost: 50,
                effect: { stat: 'hp', value: 5 }
            },
            {
                name: 'Espada Mejorada',
                description: '+2 Ataque',
                cost: 75,
                effect: { stat: 'attack', value: 2 }
            },
            {
                name: 'Botas Ligeras',
                description: '+1 Velocidad',
                cost: 60,
                effect: { stat: 'speed', value: 1 }
            },
            {
                name: 'Arco Largo',
                description: '+2 Alcance',
                cost: 80,
                effect: { stat: 'range', value: 2 }
            },
            {
                name: 'Guanteletes',
                description: '+1 Velocidad de Ataque',
                cost: 70,
                effect: { stat: 'attackSpeed', value: 1 }
            },
            {
                name: 'Poción de Vida Grande',
                description: '+10 HP',
                cost: 100,
                effect: { stat: 'hp', value: 10 }
            }
        ];
    }

    /**
     * Compra un item de la tienda
     */
    purchaseItem(index, pointsSystem, player) {
        if (index < 0 || index >= this.items.length) return false;

        const item = this.items[index];
        if (pointsSystem.spendPoints(item.cost)) {
            // Aplicar el efecto al jugador
            player.addStats({ stats: item.effect });
            return true;
        }
        return false;
    }

    /**
     * Abre la tienda
     */
    open() {
        this.isActive = true;
        this.selectedIndex = 0;
    }

    /**
     * Cierra la tienda
     */
    close() {
        this.isActive = false;
        this.selectedIndex = 0;
    }

    /**
     * Obtiene el item seleccionado
     */
    getSelectedItem() {
        return this.items[this.selectedIndex];
    }
}
