import { DIRECTION } from "../data/direction.js";
import { ENTITY_TYPE } from "../data/entity.type.js";
import { KEYMAP } from "../data/keymap.js";
import { Entity } from "./entity.js";
import { Projectile } from "./projectile.js";

export class Player {
    constructor(entity, input) {
        this.entity = entity;
        this.input = input;
        this.points = 0;
        this.entity.char = 'P'
        this.entity.type = ENTITY_TYPE.PLAYER;
        this.tickCounter = 0;
        this.bufferedMove = null;
    }
    
    readInput() {
        if (this.input.isPressed(KEYMAP.UP)) this.bufferedMove = [0, -1];
        else if (this.input.isPressed(KEYMAP.DOWN)) this.bufferedMove = [0, 1];
        else if (this.input.isPressed(KEYMAP.LEFT)) this.bufferedMove = [-1, 0];
        else if (this.input.isPressed(KEYMAP.RIGHT)) this.bufferedMove = [1, 0];
    }

    checkMove(world) {
        this.tickCounter++;

        const delay = world.getTickDelay(this.entity);
        if (this.tickCounter < delay) return;

        this.tickCounter = 0;

        if (!this.bufferedMove) return;

        const [dx, dy] = this.bufferedMove;

        const nx = this.entity.x + dx;
        const ny = this.entity.y + dy;

        this.entity.changeDirection(nx, ny);

        if (!world.grid.isOccupied(nx, ny, this.entity, true)) {
            this.entity.move(dx, dy);
        }

        // vaciar buffer
        this.bufferedMove = null;
    }


    checkAction(world) {
        if (this.input.isPressed(KEYMAP.X)) {
            const dir = this.entity.direction;

            // Proyectil nace justo delante
            const offsets = {
                [DIRECTION.NORTH]: [0, -1],
                [DIRECTION.SOUTH]: [0, 1],
                [DIRECTION.EAST]: [1, 0],
                [DIRECTION.WEST]: [-1, 0]
            };

            const [dx, dy] = offsets[dir];

            const x = this.entity.x + dx;
            const y = this.entity.y + dy;

            const projEntity = new Entity(x, y, {
                speed: 1
            });

            const projectile = new Projectile(projEntity, dir, this.entity);

            world.entities.push(projectile.entity);
            world.projectiles.push(projectile);
        }

        if (this.input.isPressed(KEYMAP.C)) {
            const dir = this.entity.direction;

            const offsets = {
                [DIRECTION.NORTH]: [0, -1],
                [DIRECTION.SOUTH]: [0, 1],
                [DIRECTION.EAST]: [1, 0],
                [DIRECTION.WEST]: [-1, 0]
            };

            const [dx, dy] = offsets[dir];

            const x = this.entity.x + dx;
            const y = this.entity.y + dy;

            const entity = world.grid.getCell(x,y);

            if (entity && entity.type == ENTITY_TYPE.OBJ) {
                this.entity.addStats(entity);
                world.removeEntity(entity);
            }
        }

    }

}