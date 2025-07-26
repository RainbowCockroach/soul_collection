function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function calculateTimeTillFinishAnimation(duration: number, iteration: number) {
  return duration * iteration;
}

const randomProperties = function (particle: HTMLElement) {
  const left = randomBetween(1, 99);
  particle.style.setProperty("--left", left + "%");

  const top = randomBetween(1, 99);
  particle.style.setProperty("--top", top + "%");

  const size = randomBetween(2, 20);
  particle.style.setProperty("--size", size + "px");
  particle.style.setProperty("--blur", size * 4 + "px");
  particle.style.setProperty("--spread", size + "px");

  const opacity = randomBetween(0.1, 1);
  particle.style.setProperty("--opacity", opacity.toString());

  const duration = randomBetween(1, 3);
  particle.style.setProperty("--duration", duration + "s");

  const iteration = randomBetween(4, 10);
  particle.style.setProperty("--iteration", iteration.toString());

  return { duration, iteration };
};

export const addSparkles = function (): void {
  const sparkleContainers = document.querySelectorAll(".sparkle-background");
  if (sparkleContainers.length === 0) return;

  const maxCount = randomBetween(10, 100);

  sparkleContainers.forEach((container) => {
    for (let i = 0; i < maxCount; i++) {
      const sparkle = document.createElement("div");
      sparkle.classList.add("particle");

      randomProperties(sparkle);
      container.appendChild(sparkle);
    }
  });

  setTimeout(() => {
    const particles = document.querySelectorAll(".particle");
    particles.forEach((particle) => particle.remove());
  }, 5000);
};

export const startContinuousSparkles = function (): () => void {
  const generateSparkles = () => {
    const sparkleContainers = document.querySelectorAll(".sparkle-background");
    if (sparkleContainers.length === 0) return;

    const count = randomBetween(5, 10);

    sparkleContainers.forEach((container) => {
      for (let i = 0; i < count; i++) {
        const sparkle = document.createElement("div");
        sparkle.classList.add("particle");

        const { duration, iteration } = randomProperties(sparkle);
        container.appendChild(sparkle);

        // Remove each sparkle after its animation completes
        const animationDuration = calculateTimeTillFinishAnimation(
          duration,
          iteration
        );
        setTimeout(() => {
          if (sparkle.parentNode) {
            sparkle.remove();
          }
        }, animationDuration * 1000);
      }
    });
  };

  // Generate sparkles immediately
  generateSparkles();

  // Then generate new sparkles every 2 seconds
  const intervalId = window.setInterval(generateSparkles, 2000);

  // Return cleanup function
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
};

export const removeSparkles = function (): void {
  const sparkle = document.getElementsByClassName("particle");

  for (let i = 0; i < sparkle.length; i++) {
    const parentNode = sparkle[i].parentNode;
    if (parentNode) {
      parentNode.removeChild(sparkle[i]);
    }
  }
};
