/**
 * Interfaz abstracta para Renderer
 * Todas las implementaciones de Renderer deben seguir esta interfaz
 */
export class Renderer {
    /**
     * Renderiza el estado del juego
     * @param {Object} data - Datos del juego a renderizar
     * @param {Array<Array>} data.grid - Grid del juego
     * @param {Array} data.info - Información adicional
     * @param {Array} data.debug - Información de debug
     */
    render({ grid, info = [], debug = [] }) {
        throw new Error('render() must be implemented');
    }

    /**
     * Muestra la pantalla de game over y espera input
     */
    stopRender() {
        throw new Error('stopRender() must be implemented');
    }

    /**
     * Inicializa el renderer
     */
    init() {
        // Opcional: implementar si es necesario
    }

    /**
     * Limpia recursos del renderer
     */
    destroy() {
        // Opcional: implementar si es necesario
    }
}
