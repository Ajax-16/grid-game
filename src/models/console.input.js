export class Input {
    constructor() {
        this.keys = new Set();

        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding("utf8");

        process.stdin.on("data", key => {
            if (key === "\u0003") process.exit();
            this.keys.add(key);
        });
    }

    isPressed(key) {
        return this.keys.has(key);
    }

    clear() {
        this.keys.clear();
    }
}