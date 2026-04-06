interface Particle {
  x: number; // 0-1 normalized
  y: number; // 0-1 normalized
  size: number;
  maxOpacity: number;
  phase: number; // current animation phase in radians
  speed: number; // radians per frame
  lifetime: number; // total frames to live
  age: number; // current frame age
}

const BATCH_INTERVAL = 2000;
const SPARKLE_COLOR_R = 243;
const SPARKLE_COLOR_G = 233;
const SPARKLE_COLOR_B = 255;

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let particles: Particle[] = [];
let animFrameId = 0;
let intervalId = 0;
let running = false;

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function createParticle(): Particle {
  const duration = randomBetween(1, 3);
  const iteration = randomBetween(2, 5);
  return {
    x: Math.random(),
    y: Math.random(),
    size: randomBetween(2, 20),
    maxOpacity: randomBetween(0.1, 1),
    phase: 0,
    speed: Math.PI / (duration * 60), // full cycle over duration seconds at ~60fps
    lifetime: duration * iteration * 60,
    age: 0,
  };
}

function spawnBatch() {
  const count = Math.round(randomBetween(50, 100));
  for (let i = 0; i < count; i++) {
    particles.push(createParticle());
  }
}

// Draw a 4-pointed star shape
function drawStar(
  c: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  opacity: number
) {
  const half = size / 2;
  // Original clip-path inner points are at 40%/60% of bounding box
  // That's 10% of full size from center = 20% of half
  const inner = half * 0.2;

  c.globalAlpha = opacity;
  c.fillStyle = `rgb(${SPARKLE_COLOR_R},${SPARKLE_COLOR_G},${SPARKLE_COLOR_B})`;
  c.beginPath();
  // Top
  c.moveTo(cx, cy - half);
  // Upper-right inner
  c.lineTo(cx + inner, cy - inner);
  // Right
  c.lineTo(cx + half, cy);
  // Lower-right inner
  c.lineTo(cx + inner, cy + inner);
  // Bottom
  c.lineTo(cx, cy + half);
  // Lower-left inner
  c.lineTo(cx - inner, cy + inner);
  // Left
  c.lineTo(cx - half, cy);
  // Upper-left inner
  c.lineTo(cx - inner, cy - inner);
  c.closePath();
  c.fill();
}

function tick() {
  if (!ctx || !canvas) return;

  const w = window.innerWidth;
  const h = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;

  // Resize canvas if needed
  if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  ctx.clearRect(0, 0, w, h);

  let i = particles.length;
  while (i--) {
    const p = particles[i];
    p.age++;
    p.phase += p.speed;

    if (p.age >= p.lifetime) {
      // Swap-remove for O(1) deletion
      particles[i] = particles[particles.length - 1];
      particles.pop();
      continue;
    }

    // Sine-based opacity: smoothly fades in and out
    const opacity = Math.sin(p.phase) * p.maxOpacity;
    if (opacity <= 0) continue;

    drawStar(ctx, p.x * w, p.y * h, p.size, opacity);
  }

  ctx.globalAlpha = 1;
  animFrameId = requestAnimationFrame(tick);
}

export const startContinuousSparkles = function (): () => void {
  if (running) return () => {};

  // Find the container and insert a canvas
  const container = document.querySelector(".sparkle-background");
  if (!container) return () => {};

  canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "-1";
  container.appendChild(canvas);

  ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  running = true;
  particles = [];

  spawnBatch();
  intervalId = window.setInterval(spawnBatch, BATCH_INTERVAL);
  animFrameId = requestAnimationFrame(tick);

  return () => {
    running = false;
    clearInterval(intervalId);
    cancelAnimationFrame(animFrameId);
    particles = [];
    if (canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
    canvas = null;
    ctx = null;
  };
};

// Legacy exports kept for compatibility
export const addSparkles = function (): void {
  startContinuousSparkles();
};

export const removeSparkles = function (): void {
  // No-op; use the cleanup function from startContinuousSparkles instead
};
