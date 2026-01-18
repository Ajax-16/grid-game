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
    generateShopItems(difficulty, playerStats, abilitySystem) {
        this.items = [
            {
                name: 'Poción de Vida',
                description: '+5 HP',
                cost: 50,
                effect: { hp: 5 },
                type: 'stat'
            },
            {
                name: 'Espada Mejorada',
                description: '+2 Ataque',
                cost: 75,
                effect: { attack: 2 },
                type: 'stat'
            },
            {
                name: 'Botas Ligeras',
                description: '+1 Velocidad',
                cost: 60,
                effect: { speed: 1 },
                type: 'stat'
            },
            {
                name: 'Arco Largo',
                description: '+2 Alcance',
                cost: 80,
                effect: { range: 2 },
                type: 'stat'
            },
            {
                name: 'Guanteletes',
                description: '+1 Velocidad de Ataque',
                cost: 70,
                effect: { attackSpeed: 1 },
                type: 'stat'
            },
            {
                name: 'Poción de Vida Grande',
                description: '+10 HP',
                cost: 100,
                effect: { hp: 10 },
                type: 'stat'
            }
        ];

        // Agregar habilidades disponibles para comprar
        if (abilitySystem) {
            const availableAbilities = abilitySystem.getAvailableAbilities();
            availableAbilities.forEach(ability => {
                this.items.push({
                    name: `[HABILIDAD] ${ability.name}`,
                    description: ability.description,
                    cost: ability.cost,
                    effect: { type: 'ability', abilityName: ability.key },
                    type: 'ability'
                });
            });
        }
    }

    /**
     * Compra un item de la tienda
     */
    purchaseItem(index, pointsSystem, player) {
        if (index < 0 || index >= this.items.length) return false;

        const item = this.items[index];
        if (pointsSystem.spendPoints(item.cost)) {
            // Aplicar el efecto según el tipo
            if (item.type === 'stat') {
                player.addStats({ stats: item.effect });
            } else if (item.type === 'ability' && player.abilitySystem) {
                // Desbloquear habilidad
                player.abilitySystem.unlockAbility(item.effect.abilityName);
            }
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
