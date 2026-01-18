// camera.js
export class Camera {
    constructor(viewWidth, viewHeight) {
        this.viewWidth = viewWidth;
        this.viewHeight = viewHeight;
        this.x = 0;
        this.y = 0;
    }

    // Actualiza la posición de la cámara para seguir al objetivo
    follow(targetX, targetY, worldWidth, worldHeight) {
        // Centrar la cámara en el objetivo
        this.x = Math.floor(targetX - this.viewWidth / 2);
        this.y = Math.floor(targetY - this.viewHeight / 2);

        // Limitar la cámara dentro de los límites del mundo
        this.x = Math.max(0, Math.min(this.x, worldWidth - this.viewWidth));
        this.y = Math.max(0, Math.min(this.y, worldHeight - this.viewHeight));
    }

    // Convierte coordenadas del mundo a coordenadas de la vista
    worldToView(worldX, worldY) {
        return {
            x: worldX - this.x,
            y: worldY - this.y
        };
    }

    // Verifica si una celda del mundo está visible en la vista
    isVisible(worldX, worldY) {
        return (
            worldX >= this.x &&
            worldX < this.x + this.viewWidth &&
            worldY >= this.y &&
            worldY < this.y + this.viewHeight
        );
    }

    // Obtiene el área visible del mundo
    getVisibleBounds() {
        return {
            startX: this.x,
            endX: this.x + this.viewWidth,
            startY: this.y,
            endY: this.y + this.viewHeight
        };
    }
}
