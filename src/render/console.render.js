import { KEYMAP } from "../data/keymap.js";

export const consoleRender = ({ grid, info = [], debug = [] }) => {
    console.clear();

    // Grid principal
    const output = grid
        .map(row =>
            row.map(cell => {
                if (cell === undefined) return " ";
                if (typeof cell === "object") return cell.char ?? "?";
                return String(cell);
            }).join("")
        )
        .join("\n");

    console.log(output);

    info.forEach(msg =>
        console.log(
            msg.value === undefined || msg.value === ""
                ? msg.key
                : `${msg.key}: ${msg.value}`
        )
    );

    // Debug opcional
    if (debug.length > 0) {
        console.log("\n--- DEBUG ---");
        debug.forEach(msg => console.log(msg));
    }
};

export const consoleStopRender = () => {
    console.log("Press ENTER to restart, ESC to exit");

    return new Promise((resolve) => {
        const stdin = process.stdin;
        stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding("utf8");

        const handler = (key) => {
            if (key === KEYMAP.ENTER) { // ENTER
                stdin.removeListener("data", handler);
                resolve(true);
            } else if (key === KEYMAP.ESC) { // ESC
                stdin.removeListener("data", handler);
                process.exit();
            }
        };

        stdin.on("data", handler);
    });
};