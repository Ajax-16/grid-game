import { Engine } from "./engine.js";
import { World } from "./world.js";
import { Input } from "./models/console.input.js";
import { consoleRender, consoleStopRender } from "./render/console.render.js";

const input = new Input();
const world = new World({size: { cols: 20, rows: 10}});

const engine = new Engine({
    fps: 24,
    render: consoleRender,
    stopRender: consoleStopRender,
    input,
    world
});

engine.start();
