import React, { useRef, useEffect } from "react";

interface Star {
  x: number;
  y: number;
  finalSize: number;
  size: number;
  alpha: number;
  velocityX: number;
  velocityY: number;
  gravity: number;
  drag: number;
  timeElapsed: number;
  color: string;
  update(deltaTime: number): void;
  draw(ctx: CanvasRenderingContext2D): void;
}

const StarryTrail: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const animationIdRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    class StarClass implements Star {
      x: number;
      y: number;
      finalSize: number;
      size: number;
      alpha: number;
      velocityX: number;
      velocityY: number;
      gravity: number;
      drag: number;
      timeElapsed: number;
      color: string;

      constructor(x: number, y: number, velocityX: number, velocityY: number) {
        this.x = x;
        this.y = y;
        this.finalSize = Math.random() * 2;
        this.size = this.finalSize * 2;
        this.alpha = 1;
        this.velocityX = velocityX * 0.05;
        this.velocityY = 1 + Math.random() + velocityY * 0.05;
        this.gravity = 0.02;
        this.drag = 0.97;
        this.timeElapsed = 0;

        // Generate random color
        const colors = [
          '255, 255, 255', // white
          '255, 192, 203', // pink
          '173, 216, 230', // light blue
          '255, 255, 0',   // yellow
          '144, 238, 144', // light green
          '255, 165, 0',   // orange
          '221, 160, 221', // plum
          '255, 182, 193'  // light pink
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      turbulence(): number {
        return Math.random() * 0.5 - 0.25;
      }

      draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }

      update(deltaTime: number): void {
        this.x += this.velocityX + this.turbulence();
        this.velocityX *= this.drag;
        this.y += this.velocityY;
        this.velocityY += this.gravity;
        this.alpha = Math.max(0, this.alpha - 0.005);

        this.timeElapsed += deltaTime;
        if (this.timeElapsed < 2000) {
          this.size =
            this.finalSize * 2 - (this.finalSize * this.timeElapsed) / 2000;
        } else {
          this.size = this.finalSize;
        }
      }
    }

    const addStar = (e: MouseEvent) => {
      const mouseVelocityX = e.clientX - lastMouseRef.current.x;
      const mouseVelocityY = e.clientY - lastMouseRef.current.y;
      lastMouseRef.current.x = e.clientX;
      lastMouseRef.current.y = e.clientY;

      const randomOffsetX = (Math.random() - 0.5) * 100;
      const randomOffsetY = (Math.random() - 0.5) * 100;

      starsRef.current.push(
        new StarClass(
          e.clientX,
          e.clientY,
          mouseVelocityX + randomOffsetX,
          mouseVelocityY + randomOffsetY
        )
      );
    };

    let lastTime = 0;

    const update = (time: number = 0) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      starsRef.current.forEach((star) => star.update(deltaTime));
      starsRef.current.forEach((star) => star.draw(ctx));

      starsRef.current = starsRef.current.filter(
        (star) =>
          star.alpha > 0 &&
          star.y < canvas.height &&
          star.x > 0 &&
          star.x < canvas.width
      );

      animationIdRef.current = requestAnimationFrame(update);
    };

    document.addEventListener("mousemove", addStar);
    update();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("mousemove", addStar);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
};

export default StarryTrail;
