// maze-generator.js
import { SeededRandom } from "./random.js";

export class MazeGenerator {
    constructor(seed, cols, rows, graphics = { wall: '#' }) {
        this.rng = new SeededRandom(seed);
        this.cols = cols;
        this.rows = rows;
        this.grid = [];
        this.graphics = graphics;
    }

    // Genera un mapa con habitaciones y pasillos
    generate() {
        // Inicializar todo como muro
        this.grid = Array.from({ length: this.rows }, () =>
            Array(this.cols).fill(this.graphics.wall)
        );

        // Generar habitaciones
        const rooms = this.generateRooms();
        
        // Conectar habitaciones con pasillos
        this.connectRooms(rooms);

        // Asegurar que todas las habitaciones estén conectadas
        this.ensureConnectivity(rooms);

        return this.grid;
    }

    // Genera habitaciones aleatorias
    generateRooms() {
        const rooms = [];
        const minRoomSize = 9;
        const maxRoomSize = 15;
        const maxRooms = Math.floor((this.cols * this.rows) / 100);

        for (let i = 0; i < maxRooms; i++) {
            const width = this.rng.int(minRoomSize, maxRoomSize);
            const height = this.rng.int(minRoomSize, maxRoomSize);
            const x = this.rng.int(1, this.cols - width - 1);
            const y = this.rng.int(1, this.rows - height - 1);

            const room = { x, y, width, height };

            // Verificar que no se solape con otras habitaciones
            let overlaps = false;
            for (const other of rooms) {
                if (this.roomsOverlap(room, other)) {
                    overlaps = true;
                    break;
                }
            }

            if (!overlaps) {
                this.carveRoom(room);
                rooms.push(room);
            }
        }

        return rooms;
    }

    // Verifica si dos habitaciones se solapan
    roomsOverlap(room1, room2) {
        return (
            room1.x < room2.x + room2.width + 1 &&
            room1.x + room1.width + 1 > room2.x &&
            room1.y < room2.y + room2.height + 1 &&
            room1.y + room1.height + 1 > room2.y
        );
    }

    // Cava una habitación en el grid
    carveRoom(room) {
        for (let y = room.y; y < room.y + room.height; y++) {
            for (let x = room.x; x < room.x + room.width; x++) {
                if (x > 0 && x < this.cols - 1 && y > 0 && y < this.rows - 1) {
                    this.grid[y][x] = ' ';
                }
            }
        }
    }

    // Obtiene el centro de una habitación
    getRoomCenter(room) {
        return {
            x: Math.floor(room.x + room.width / 2),
            y: Math.floor(room.y + room.height / 2)
        };
    }

    // Conecta habitaciones con pasillos
    connectRooms(rooms) {
        if (rooms.length < 2) return;

        // Conectar cada habitación con la siguiente
        for (let i = 0; i < rooms.length - 1; i++) {
            const center1 = this.getRoomCenter(rooms[i]);
            const center2 = this.getRoomCenter(rooms[i + 1]);

            // Crear pasillo en L (horizontal primero, luego vertical)
            if (this.rng.chance(0.5)) {
                this.carveHorizontalTunnel(center1.x, center2.x, center1.y);
                this.carveVerticalTunnel(center1.y, center2.y, center2.x);
            } else {
                this.carveVerticalTunnel(center1.y, center2.y, center1.x);
                this.carveHorizontalTunnel(center1.x, center2.x, center2.y);
            }
        }
    }

    // Cava un túnel horizontal
    carveHorizontalTunnel(x1, x2, y) {
        const start = Math.min(x1, x2);
        const end = Math.max(x1, x2);
        for (let x = start; x <= end; x++) {
            if (x > 0 && x < this.cols - 1 && y > 0 && y < this.rows - 1) {
                this.grid[y][x] = ' ';
            }
        }
    }

    // Cava un túnel vertical
    carveVerticalTunnel(y1, y2, x) {
        const start = Math.min(y1, y2);
        const end = Math.max(y1, y2);
        for (let y = start; y <= end; y++) {
            if (x > 0 && x < this.cols - 1 && y > 0 && y < this.rows - 1) {
                this.grid[y][x] = ' ';
            }
        }
    }

    // Asegura que todas las habitaciones estén conectadas
    ensureConnectivity(rooms) {
        if (rooms.length < 2) return;

        // Conectar habitaciones aleatorias adicionales para mejorar conectividad
        const extraConnections = Math.floor(rooms.length / 3);
        for (let i = 0; i < extraConnections; i++) {
            const room1 = rooms[this.rng.int(0, rooms.length - 1)];
            const room2 = rooms[this.rng.int(0, rooms.length - 1)];
            
            if (room1 !== room2) {
                const center1 = this.getRoomCenter(room1);
                const center2 = this.getRoomCenter(room2);

                if (this.rng.chance(0.5)) {
                    this.carveHorizontalTunnel(center1.x, center2.x, center1.y);
                    this.carveVerticalTunnel(center1.y, center2.y, center2.x);
                } else {
                    this.carveVerticalTunnel(center1.y, center2.y, center1.x);
                    this.carveHorizontalTunnel(center1.x, center2.x, center2.y);
                }
            }
        }
    }

    // Encuentra una posición válida (suelo) para colocar entidades
    findValidPosition() {
        let attempts = 0;
        while (attempts < 100) {
            const x = this.rng.int(1, this.cols - 2);
            const y = this.rng.int(1, this.rows - 2);
            
            if (this.grid[y][x] === ' ') {
                return { x, y };
            }
            attempts++;
        }
        // Fallback: buscar cualquier posición válida
        for (let y = 1; y < this.rows - 1; y++) {
            for (let x = 1; x < this.cols - 1; x++) {
                if (this.grid[y][x] === ' ') {
                    return { x, y };
                }
            }
        }
        return { x: 1, y: 1 };
    }
}
