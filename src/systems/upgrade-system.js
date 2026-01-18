import { randomInt } from "../utils/random.js";

/**
 * Sistema de mejoras que genera opciones aleatorias de stats
 */
export class UpgradeSystem {
    constructor() {
        this.isActive = false;
        this.options = [];
        this.selectedIndex = 0;
    }

    /**
     * Genera 3 opciones aleatorias de mejoras
     */
    generateOptions(difficulty) {
        const stats = ['hp', 'attack', 'range', 'speed', 'attackSpeed'];
        const options = [];

        // Generar 3 opciones únicas
        while (options.length < 3) {
            const stat = stats[randomInt(0, stats.length - 1)];
            const value = 1 + Math.floor(difficulty / 2);
            
            // Evitar duplicados
            if (!options.find(opt => opt.stat === stat)) {
                options.push({
                    stat,
                    value,
                    description: this.getStatDescription(stat, value)
                });
            }
        }

        this.options = options;
        this.selectedIndex = 0;
        this.isActive = true;
        return options;
    }

    /**
     * Obtiene una descripción legible de la mejora
     */
    getStatDescription(stat, value) {
        const descriptions = {
            hp: `+${value} HP`,
            attack: `+${value} Ataque`,
            range: `+${value} Alcance`,
            speed: `+${value} Velocidad`,
            attackSpeed: `+${value} Velocidad de Ataque`
        };
        return descriptions[stat] || `+${value} ${stat}`;
    }

    /**
     * Selecciona una opción (1, 2, o 3)
     */
    selectOption(index) {
        if (index >= 0 && index < this.options.length) {
            this.selectedIndex = index;
            return this.options[index];
        }
        return null;
    }

    /**
     * Cierra el sistema de mejoras
     */
    close() {
        this.isActive = false;
        this.options = [];
        this.selectedIndex = 0;
    }

    /**
     * Obtiene la opción seleccionada
     */
    getSelectedOption() {
        return this.options[this.selectedIndex];
    }
}
