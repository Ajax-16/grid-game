/**
 * Sistema de puntos con bonificaciones y combos
 */
export class PointsSystem {
    constructor() {
        this.totalPoints = 0;
        this.combo = 0;
        this.lastKillTick = 0;
        this.comboTimeout = 30; // Ticks para mantener el combo
        this.killStreak = 0;
    }

    /**
     * Calcula puntos por matar un enemigo
     */
    calculateKillPoints(enemy, difficulty, currentTick) {
        // Puntos base según tipo de enemigo
        let basePoints = 10;
        
        if (enemy.type === 'REN') { // Ranged enemy
            basePoints = 15;
        } else if (enemy.char === 'B') { // Boss
            basePoints = 50;
        }

        // Multiplicador por dificultad
        const difficultyMultiplier = 1 + (difficulty / 10);
        
        // Sistema de combo
        const timeSinceLastKill = currentTick - this.lastKillTick;
        if (timeSinceLastKill <= this.comboTimeout) {
            this.combo++;
            this.killStreak++;
        } else {
            this.combo = 1;
            this.killStreak = 1;
        }
        
        this.lastKillTick = currentTick;

        // Multiplicador de combo (hasta x3)
        const comboMultiplier = Math.min(1 + (this.combo - 1) * 0.2, 3);
        
        // Bonificación por racha de muertes
        const streakBonus = Math.floor(this.killStreak / 5) * 5;
        
        const points = Math.floor(basePoints * difficultyMultiplier * comboMultiplier) + streakBonus;
        
        return {
            points,
            combo: this.combo,
            killStreak: this.killStreak,
            multiplier: comboMultiplier.toFixed(1)
        };
    }

    /**
     * Agrega puntos al total
     */
    addPoints(amount) {
        this.totalPoints += amount;
    }

    /**
     * Gasta puntos (para compras)
     */
    spendPoints(amount) {
        if (this.totalPoints >= amount) {
            this.totalPoints -= amount;
            return true;
        }
        return false;
    }

    /**
     * Actualiza el combo (debe llamarse cada tick)
     */
    update(currentTick) {
        const timeSinceLastKill = currentTick - this.lastKillTick;
        if (timeSinceLastKill > this.comboTimeout) {
            if (this.combo > 0) {
                this.combo = 0;
                this.killStreak = 0;
            }
        }
    }

    /**
     * Obtiene el total de puntos
     */
    getTotal() {
        return this.totalPoints;
    }

    /**
     * Obtiene el combo actual
     */
    getCombo() {
        return this.combo;
    }

    /**
     * Obtiene la racha de muertes
     */
    getKillStreak() {
        return this.killStreak;
    }

    /**
     * Reinicia el sistema
     */
    reset() {
        this.totalPoints = 0;
        this.combo = 0;
        this.lastKillTick = 0;
        this.killStreak = 0;
    }
}
