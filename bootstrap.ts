import {GameMaster} from "./game.js";

let game: GameMaster;
let play: boolean = false;
let canvas: HTMLCanvasElement;

function advanceGame() {
    game.tick();
    game.draw()
    if (play)
        window.requestAnimationFrame(advanceGame);
}

function onGameDone() {
    play = false;
    alert("Done");
}

addEventListener("DOMContentLoaded", () => {
    canvas = document.querySelector("canvas")!;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    game = new GameMaster(canvas, onGameDone);
});

addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === ' ') {
        play = !play;
        if (play)
            window.requestAnimationFrame(advanceGame);
    }
})

addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (game)
        game.notifyResize(window.innerWidth, window.innerHeight);
})
