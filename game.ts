import {rockImage, paperImage, scissorsImage} from "./sprites.js";

enum PawnType {
    Rock,
    Paper,
    Scissors
}

function isEffectiveType(defender: PawnType, attacker: PawnType): boolean {
    if (defender === attacker)
        return false;

    switch (defender) {
        case PawnType.Rock:
            return attacker === PawnType.Paper;
        case PawnType.Paper:
            return attacker === PawnType.Scissors;
        case PawnType.Scissors:
            return attacker === PawnType.Rock;
    }
}

function resultType(left: PawnType, right: PawnType): PawnType {
    switch (left) {
        case PawnType.Rock:
            if (right === PawnType.Paper)
                return PawnType.Paper;
            else
                return PawnType.Rock;
        case PawnType.Paper:
            if (right === PawnType.Scissors)
                return PawnType.Scissors;
            else
                return PawnType.Paper;
        case PawnType.Scissors:
            if (right === PawnType.Rock)
                return PawnType.Rock;
            else
                return PawnType.Scissors;
    }
}

enum PawnState {
    None,
    Attack,
    Avoid
}


function rand(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
}

function randomPawnType(): PawnType {
    switch (rand(0, 3)) {
        case 0:
            return PawnType.Rock;
        case 1:
            return PawnType.Paper;
        case 2:
            return PawnType.Scissors;
        default:
            console.assert(false);
            return PawnType.Rock;
    }
}

class Vec2 {
    x: number = 0;
    y: number = 0;
}

class BoundingBox {
    x: number = 0;
    xCenter: number = 0;
    xHigh: number = 0;
    y: number = 0;
    yCenter: number = 0;
    yHigh: number = 0;
    width: number = 0;
    height: number = 0;

    #updateCoordinates(x: number, y: number) {
        this.x = x;
        this.y = y;

        this.xCenter = this.x + (this.width / 2)
        this.xHigh = this.x + this.width;

        this.yCenter = this.y + (this.height / 2)
        this.yHigh = this.y + this.height;
    }

    constructor(x: number, y: number, width: number, height: number) {
        this.width = width;
        this.height = height;
        this.#updateCoordinates(x, y);
    }

    move(x: number, y: number): void {
        this.#updateCoordinates(x, y);
    }
}

class Pawn {
    type: PawnType;
    bounds: BoundingBox;
    target: Pawn | null = null;
    state: PawnState = PawnState.Avoid;
    velocity: Vec2 = new Vec2();

    constructor(type: PawnType, bounds: BoundingBox) {
        this.type = type;
        this.bounds = bounds;
    }

    isInBounds(x: number, y: number): boolean {
        return x >= this.bounds.x &&
            x <= (this.bounds.x + this.bounds.width) &&
            y >= this.bounds.y &&
            y <= (this.bounds.y + this.bounds.height)
    }

    calcVelocity(): void {
        if (this.target === null || this.state === PawnState.None)
            return;
        const targetBounds = this.target.bounds;

        if (targetBounds.xCenter > this.bounds.xCenter)
            this.velocity.x = 1;
        else if (targetBounds.xCenter < this.bounds.xCenter)
            this.velocity.x = -1;
        else
            this.velocity.x = 0;

        if (targetBounds.yCenter > this.bounds.yCenter)
            this.velocity.y = 1;
        else if (targetBounds.yCenter < this.bounds.yCenter)
            this.velocity.y = -1;
        else
            this.velocity.y = 0;

        // Reverse the vector away from the attacker
        if (this.state === PawnState.Avoid) {
            this.velocity.x *= -1;
            this.velocity.y *= -1;
        }

        // Make the Pawn slightly faster in chase
        if (this.state === PawnState.Attack) {
            this.velocity.x *= 1.1;
            this.velocity.y *= 1.1;
        }
    }

    applyVelocity(globalWidth: number, globalHeight: number): void {
        const target = new Vec2();
        target.x = this.bounds.x + this.velocity.x;
        target.y = this.bounds.y + this.velocity.y;

        if (this.bounds.xCenter > globalWidth)
            target.x = this.bounds.xCenter - globalWidth;
        else if (this.bounds.xCenter < 0)
            target.x = globalWidth - Math.abs(this.bounds.xCenter);

        if (this.bounds.yCenter > globalHeight)
            target.y = this.bounds.yCenter - globalHeight;
        else if (this.bounds.yCenter < 0)
            target.y = globalHeight - Math.abs(this.bounds.yCenter);

        this.bounds.move(target.x, target.y);
    }
}

class GameMaster {
    #canvas: HTMLCanvasElement;
    #ctx: CanvasRenderingContext2D;
    #width: number;
    #height: number;

    #pawns: Pawn[] = [];

    readonly #onDone: () => void;

    constructor(canvas: HTMLCanvasElement, onDone: () => void) {
        this.#canvas = canvas;

        this.#ctx = this.#canvas.getContext('2d')!;
        this.#width = this.#canvas.width;
        this.#height = this.#canvas.height;

        this.#onDone = onDone;

        for (let i = 0; i < 100; i++) {
            this.#pawns.push(new Pawn(randomPawnType(), new BoundingBox(rand(0, this.#width), rand(0, this.#height), 10, 10)))
        }
    }

    #sortX(): void {
        for (let i = 0; i < this.#pawns.length; i++) {
            const tmp = this.#pawns[i];
            let j = i - 1;
            for (; j >= 0 && (this.#pawns[j].bounds.x > tmp.bounds.x); j--) {
                this.#pawns[j + 1] = this.#pawns[j];
            }
            this.#pawns[j + 1] = tmp;
        }
    }

    draw(): void {
        this.#ctx.fillStyle = "rgb(200,200,200)";
        this.#ctx.fillRect(0, 0, this.#canvas.width, this.#canvas.height);

        for (let pawn of this.#pawns) {
            switch (pawn.type) {
                case PawnType.Rock:
                    this.#ctx.drawImage(rockImage, pawn.bounds.x, pawn.bounds.y)
                    break;
                case PawnType.Paper:
                    this.#ctx.drawImage(paperImage, pawn.bounds.x, pawn.bounds.y)
                    break;
                case PawnType.Scissors:
                    this.#ctx.drawImage(scissorsImage, pawn.bounds.x, pawn.bounds.y)
                    break;
            }
        }
    }

    tick(): void {
        let atLeastOneTarget: boolean = false;

        // Velocity, Target Selection, Move
        for (let pawn of this.#pawns) {
            // Target Selection
            let lowestDistance = Number.MAX_VALUE;
            let newTarget: Pawn | null = null;

            for (let otherPawn of this.#pawns) {
                if (pawn === otherPawn)
                    continue;

                const dx = pawn.bounds.xCenter - otherPawn.bounds.xCenter;
                const dy = pawn.bounds.yCenter - otherPawn.bounds.yCenter;

                const d = Math.sqrt(dx * dx + dy * dy);

                if (!isEffectiveType(otherPawn.type, pawn.type) && d < 50.0) {
                    newTarget = otherPawn;
                    pawn.state = PawnState.Avoid;
                    break;
                }

                if (d < lowestDistance && isEffectiveType(otherPawn.type, pawn.type)) {
                    lowestDistance = d;
                    newTarget = otherPawn;
                    pawn.state = PawnState.Attack;
                }
            }

            if (newTarget === null) {
                pawn.state = PawnState.None;
                continue;
            }
            pawn.target = newTarget;
            atLeastOneTarget = true;

            pawn.calcVelocity();
            pawn.applyVelocity(this.#width, this.#height);
        }

        if (!atLeastOneTarget) {
            this.#onDone();
            return;
        }

        // Collision
        this.#sortX();
        for (let i = 0; i < this.#pawns.length; i++) {
            let pawn = this.#pawns[i];

            let nextIndex = i + 1;
            if (nextIndex >= this.#pawns.length)
                continue;
            let next = this.#pawns[nextIndex];
            while (next.bounds.x < pawn.bounds.xHigh) {
                if ((pawn.isInBounds(next.bounds.x, next.bounds.y) ||
                    pawn.isInBounds(next.bounds.xHigh, next.bounds.yHigh)) &&
                    pawn.type != next.type) {

                    if (isEffectiveType(pawn.type, next.type))
                        pawn.type = next.type;
                    else
                        next.type = pawn.type;
                    pawn.target = null;
                    next.target = null;
                }

                nextIndex++;
                if (nextIndex >= this.#pawns.length)
                    break;
                next = this.#pawns[nextIndex];
            }
        }
    }

    notifyResize(newWidth: number, newHeight: number) {
        this.#width = newWidth;
        this.#height = newHeight;
    }
}

export {PawnType, Pawn, GameMaster};
