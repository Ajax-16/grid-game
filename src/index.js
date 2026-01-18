import { Engine } from "./engine.js";
import { World } from "./world.js";
import { Input } from "./models/console.input.js";
import { consoleRender, consoleStopRender } from "./render/console.render.js";

const input = new Input();
const world = new World({ cols: 80, rows: 40 });

const engine = new Engine({
    fps: 30,
    render: consoleRender,
    stopRender: consoleStopRender,
    input,
    world
});

engine.start();
