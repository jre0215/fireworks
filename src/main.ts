import { Background } from "./Background";
import { Firework } from "./Firework";
import { Particle } from "./Particle";

import {
    FIREWORK_RATE_OF_FIRE,
    GROUND_HEIGHT,
    PARTICLE_BASE_LIFE_SPAN,
    PARTICLE_BASE_VELOCITY,
    PARTICLE_HUE_VARIANCE,
    PARTICLE_LIFE_SPAN_VARIANCE,
    PARTICLE_RADIUS,
    PARTICLES_PER_FIREWORK,
} from "./constants";
import { getRandomValueBetween } from "./utils";

const canvas: HTMLCanvasElement = document.querySelector("canvas")!;
canvas.width = window.innerWidth / window.devicePixelRatio;
canvas.height = window.innerHeight / window.devicePixelRatio;

const computedWidth: number =
    parseInt(getComputedStyle(canvas).getPropertyValue("width").slice(0, -2), 10);
const computedHeight: number =
    parseInt(getComputedStyle(canvas).getPropertyValue("height").slice(0, -2), 10);
canvas.setAttribute("width", `${computedWidth * window.devicePixelRatio}px`);
canvas.setAttribute("height", `${computedHeight * window.devicePixelRatio}px`);

const context: CanvasRenderingContext2D = canvas.getContext("2d")!;
context.lineCap = "round";
context.lineJoin = "round";

const background: Background = new Background(context);

let fireworks: Firework[] = [];
let particles: Particle[] = [];
let frame: number = 0;

function createFirework(): void {
    const startX: number = canvas.width / 2;
    const startY: number = canvas.height;
    const endX: number = getRandomValueBetween(0.1 * canvas.width, 0.9 * canvas.width);
    const endY: number = getRandomValueBetween(0.1 * canvas.height, 0.5 * canvas.height);
    fireworks.push(new Firework(context, startX, startY, endX, endY));
}

function createParticles(x: number, y: number): void {
    const baseHue: number = Math.random() * 360;
    for (let i: number = 0; i < PARTICLES_PER_FIREWORK; i++) {
        const velocity: number = Math.random() * PARTICLE_BASE_VELOCITY;
        const angle: number = Math.random() * Math.PI * 2;
        const hue: number = getRandomValueBetween(baseHue - PARTICLE_HUE_VARIANCE,
            baseHue + PARTICLE_HUE_VARIANCE);
        const lifeSpan: number = getRandomValueBetween(
            PARTICLE_BASE_LIFE_SPAN - PARTICLE_LIFE_SPAN_VARIANCE,
            PARTICLE_BASE_LIFE_SPAN + PARTICLE_LIFE_SPAN_VARIANCE);
        particles.push(
            new Particle(context, x, y, PARTICLE_RADIUS, velocity, angle, hue, lifeSpan),
        );
    }
}

const outerText: string = "hello world ";
let textAngle: number = 0;
type TextTiming = [string, number];
const textTimings: TextTiming[] = [
    ["what", 30],
    ["a", 30],
    ["wonderful", 30],
    ["world", 30],
];
let textTimingIndex: number = 0;
let framesSinceTransition: number = 0;

function draw(): void {
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (frame % FIREWORK_RATE_OF_FIRE === 0) {
        createFirework();
    }
    background.draw();

    // Draw the rotating text
    context.font = "24px sans-serif";
    context.fillStyle = "rgba(255, 255, 255, 0.9)";
    context.textAlign = "center";
    const radiansPerCharacter: number = (2 * Math.PI) / outerText.length;
    context.save();
    context.translate(canvas.width / 2, (canvas.height - GROUND_HEIGHT) / 2);
    context.rotate(textAngle);
    for (let i: number = 0; i < outerText.length; i++) {
        context.save();
        context.rotate(i * radiansPerCharacter);
        context.fillText(outerText.charAt(i), 0, -100);
        context.restore();
    }
    context.restore();
    textAngle -= (2 * Math.PI) / 540;

    // Draw the inner text
    let currentTextTiming: TextTiming = textTimings[textTimingIndex];
    if (framesSinceTransition >= currentTextTiming[1]) {
        textTimingIndex++;
        if (textTimingIndex >= textTimings.length) {
            textTimingIndex = 0;
        }
        framesSinceTransition = 0;
        currentTextTiming = textTimings[textTimingIndex];
    }
    context.fillText(currentTextTiming[0], canvas.width / 2, (canvas.height - GROUND_HEIGHT) / 2);
    framesSinceTransition++;

    for (const firework of fireworks) {
        firework.update();
        firework.draw();
    }
    fireworks = fireworks.filter((firework: Firework) => {
        const alive: boolean = firework.distanceTraveled < firework.distanceToTravel;
        if (!alive) {
            createParticles(firework.endX, firework.endY);
        }
        return alive;
    });
    for (const particle of particles) {
        particle.update();
        particle.draw();
    }
    particles = particles.filter((particle: Particle) => particle.currentFrame < particle.lifeSpan);
    frame++;
    window.requestAnimationFrame(draw);
}

draw();
