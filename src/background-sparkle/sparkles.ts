const randomProperties = function (particle: HTMLElement) {
  const left = Math.floor(Math.random() * (99 - 1)) + 1;
  particle.style.setProperty("--left", left + "%");

  const top = Math.floor(Math.random() * (99 - 1)) + 1;
  particle.style.setProperty("--top", top + "%");

  const size = Math.floor(Math.random() * (6 - 2)) + 2;
  particle.style.setProperty("--size", size + "px");
  particle.style.setProperty("--blur", size * 4 + "px");
  particle.style.setProperty("--spread", size + "px");

  const opacity = Math.random() + 0.1;
  particle.style.setProperty("--opacity", opacity.toString());

  const duration = Math.floor(Math.random() * (800 - 300)) + 300;
  particle.style.setProperty("--duration", duration + "ms");

  const delay = Math.floor(Math.random() * (1000 - 200)) + 200;
  particle.style.setProperty("--delay", delay + "ms");

  const iteration = Math.floor(Math.random() * (10 - 4)) + 4;
  particle.style.setProperty("--iteration", iteration.toString());
};

export const addSparkles = function (): void {
  const maxCount = Math.random() * 99 + 10;

  for (let i = 0; i < maxCount; i++) {
    const sparkle = document.createElement("div");
    sparkle.classList.add("particle");

    randomProperties(sparkle);
    document.body.appendChild(sparkle);
  }

  setTimeout(() => {
    const particles = document.querySelectorAll(".particle");
    particles.forEach((particle) => particle.remove());
  }, 5000);
};

export const startContinuousSparkles = function (): () => void {
  const generateSparkles = () => {
    const count = Math.random() * 20 + 5; // 5-25 sparkles per generation
    
    for (let i = 0; i < count; i++) {
      const sparkle = document.createElement("div");
      sparkle.classList.add("particle");
      
      randomProperties(sparkle);
      document.body.appendChild(sparkle);
      
      // Remove each sparkle after its animation completes
      setTimeout(() => {
        if (sparkle.parentNode) {
          sparkle.remove();
        }
      }, 3000);
    }
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
