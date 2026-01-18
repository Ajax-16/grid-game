/**
 * Sistema de oleadas que estructura el juego en ondas
 */
export class WaveSystem {
    constructor() {
        this.currentWave = 1;
        this.enemiesKilledThisWave = 0;
        this.enemiesToKill = 5;
        this.waveComplete = false;
        this.bossWaveInterval = 5; // Cada 5 oleadas aparece un boss
    }

    /**
     * Calcula cuántos enemigos deben aparecer en esta oleada
     */
    calculateEnemiesForWave(wave) {
        // Base de 3 enemigos, aumenta con la oleada
        return 3 + Math.floor(wave * 1.5);
    }

    /**
     * Calcula cuántos enemigos deben morir para completar la oleada
     */
    calculateEnemiesToKill(wave) {
        return 5 + Math.floor(wave * 2);
    }

    /**
     * Verifica si es una oleada de boss
     */
    isBossWave() {
        return this.currentWave % this.bossWaveInterval === 0;
    }

    /**
     * Registra una muerte de enemigo
     */
    registerKill() {
        this.enemiesKilledThisWave++;
        if (this.enemiesKilledThisWave >= this.enemiesToKill) {
            this.waveComplete = true;
        }
    }

    /**
     * Avanza a la siguiente oleada
     */
    nextWave() {
        this.currentWave++;
        this.enemiesKilledThisWave = 0;
        this.enemiesToKill = this.calculateEnemiesToKill(this.currentWave);
        this.waveComplete = false;
    }

    /**
     * Obtiene el multiplicador de dificultad para esta oleada
     */
    getDifficultyMultiplier() {
        return ((this.currentWave / 2) + 1);
    }

    /**
     * Obtiene información de la oleada actual
     */
    getWaveInfo() {
        return {
            wave: this.currentWave,
            killed: this.enemiesKilledThisWave,
            required: this.enemiesToKill,
            isBossWave: this.isBossWave(),
            progress: Math.floor((this.enemiesKilledThisWave / this.enemiesToKill) * 100)
        };
    }
}
