function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function calculateTimeTillFinishAnimation(duration: number, iteration: number) {
  return duration * iteration;
}

const blobColors = ["#9acfb0"];

const blobShapes = [
  "M39.3,-50.5C51.7,-53.1,63.3,-43.6,71.2,-31.1C79,-18.6,83.3,-3,74.4,5.8C65.6,14.7,43.7,16.7,32.7,27C21.8,37.3,21.8,55.8,14.9,64C7.9,72.1,-6,69.9,-20.7,67.1C-35.5,64.4,-51.1,61.1,-64.3,52.2C-77.4,43.3,-88,28.7,-90.2,13C-92.5,-2.7,-86.3,-19.7,-77.5,-33.9C-68.7,-48.1,-57.2,-59.7,-43.9,-56.7C-30.5,-53.7,-15.3,-36.2,-0.9,-34.7C13.4,-33.3,26.8,-47.9,39.3,-50.5Z",
  "M36.7,-59C42.4,-46.4,38.2,-28.8,41,-14.6C43.8,-0.5,53.5,10,52,17.6C50.5,25.2,37.8,29.8,27.2,39.5C16.7,49.2,8.3,64.1,-4,69.6C-16.3,75.1,-32.7,71.3,-36.1,59.3C-39.5,47.2,-30,26.9,-25.6,14.4C-21.3,1.9,-22.1,-2.8,-23.5,-10.4C-24.8,-18.1,-26.7,-28.7,-22.9,-41.8C-19.1,-55,-9.5,-70.6,3,-74.7C15.5,-78.9,31.1,-71.5,36.7,-59Z",
  "M35.2,-39.2C48,-31.2,62.5,-22.4,69.2,-8.6C75.9,5.2,74.9,23.9,63.7,30.8C52.6,37.7,31.4,32.7,14.7,37.6C-2,42.5,-14,57.1,-23.9,57.2C-33.8,57.3,-41.5,42.9,-49,28.8C-56.4,14.8,-63.6,1.2,-64.1,-14C-64.7,-29.2,-58.7,-45.9,-46.9,-54.2C-35.1,-62.5,-17.5,-62.2,-3.2,-58.4C11.2,-54.6,22.4,-47.3,35.2,-39.2Z",
];

const createBlobSVG = (shape: string) => {
  const color = blobColors[Math.floor(Math.random() * blobColors.length)];
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <path fill="${color}" d="${shape}" transform="translate(100 100)" />
  </svg>`;
};

export const addBlobs = function (): void {
  // Make 4 blobs
  const blobs: HTMLDivElement[] = [];
  for (let i = 0; i < 4; i++) {
    const blob = document.createElement("div");
    blob.classList.add("blob-particle");
    blobs.push(blob);
  }
  // Hard fix positions and size
  // Blob 1
  blobs[0].innerHTML = createBlobSVG(blobShapes[0]);
  blobs[0].style.setProperty("--left", "-20%");
  blobs[0].style.setProperty("--top", "-10%");
  blobs[0].style.setProperty("--size", "70vw");
  blobs[0].style.setProperty("--blur", "2vw");
  // Blob 2
  blobs[3].innerHTML = createBlobSVG(blobShapes[2]);
  blobs[3].style.setProperty("--left", "70%");
  blobs[3].style.setProperty("--top", "50%");
  blobs[3].style.setProperty("--size", "60vw");
  blobs[3].style.setProperty("--blur", "2vw");
  // Add all blobs to body
  blobs.forEach((blob) => document.body.appendChild(blob));
};

export const removeBlobs = function (): void {
  const blobs = document.getElementsByClassName("blob-particle");

  for (let i = 0; i < blobs.length; i++) {
    const parentNode = blobs[i].parentNode;
    if (parentNode) {
      parentNode.removeChild(blobs[i]);
    }
  }
};
