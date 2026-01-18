import { Engine } from "./engine.js";
import { World } from "./world.js";
import { Input } from "./models/console.input.js";
import { ConsoleRenderer } from "./render/console.renderer.js";

const input = new Input();
const world = new World({ cols: 120, rows: 60 });
const renderer = new ConsoleRenderer();

const engine = new Engine({
    fps: 30,
    render: (data) => renderer.render(data),
    stopRender: () => renderer.stopRender(),
    input,
    world
});

engine.start();
