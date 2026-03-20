import "./sense-break.css";

const ZALGO_CHARS = [
  "\u0300", "\u0301", "\u0302", "\u0303", "\u0304", "\u0305", "\u0306", "\u0307",
  "\u0308", "\u0309", "\u030A", "\u030B", "\u030C", "\u030D", "\u030E", "\u030F",
  "\u0310", "\u0311", "\u0312", "\u0313", "\u0314", "\u0315", "\u0316", "\u0317",
  "\u0318", "\u0319", "\u031A", "\u031B", "\u031C", "\u031D", "\u031E", "\u031F",
  "\u0320", "\u0321", "\u0322", "\u0323", "\u0324", "\u0325", "\u0326", "\u0327",
  "\u0328", "\u0329", "\u032A", "\u032B", "\u032C", "\u032D", "\u032E", "\u032F",
  "\u0330", "\u0331", "\u0332", "\u0333", "\u0334", "\u0335", "\u0336", "\u0337",
  "\u0338", "\u0339", "\u033A", "\u033B", "\u033C", "\u033D", "\u033E", "\u033F",
  "\u0340", "\u0341", "\u0342", "\u0343", "\u0344", "\u0345", "\u0346", "\u0347",
  "\u0348", "\u0349", "\u034A", "\u034B", "\u034C", "\u034D", "\u034E", "\u034F",
];

function zalgoify(text: string, intensity: number): string {
  return text
    .split("")
    .map((char) => {
      if (char === " " || char === "\n") return char;
      const numChars = Math.floor(Math.random() * intensity) + 1;
      let result = char;
      for (let i = 0; i < numChars; i++) {
        result += ZALGO_CHARS[Math.floor(Math.random() * ZALGO_CHARS.length)];
      }
      return result;
    })
    .join("");
}

function getTextNodes(root: Node): Text[] {
  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      // Skip script/style elements and already-corrupted nodes
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName.toLowerCase();
      if (tag === "script" || tag === "style" || tag === "noscript") {
        return NodeFilter.FILTER_REJECT;
      }
      // Only corrupt non-empty text
      if (node.textContent && node.textContent.trim().length > 0) {
        return NodeFilter.FILTER_ACCEPT;
      }
      return NodeFilter.FILTER_REJECT;
    },
  });

  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    textNodes.push(node);
  }
  return textNodes;
}

export function activateSenseBreak(): void {
  const root = document.documentElement;
  const timers: number[] = [];

  // Start sense break music (stops naturally on page refresh)
  const intro = new Audio("/soul_collection/sound-effect/sensebreak_intro.wav");
  const loop = new Audio("/soul_collection/sound-effect/sensebreak_loop.wav");
  intro.volume = 0.7;
  loop.volume = 0.7;
  loop.loop = true;

  intro.addEventListener("ended", () => {
    loop.play().catch(() => {});
  });

  intro.play().catch(() => {
    // Autoplay blocked — try again on first user interaction
    const resume = () => {
      intro.play().catch(() => {});
      document.removeEventListener("click", resume);
      document.removeEventListener("keydown", resume);
    };
    document.addEventListener("click", resume);
    document.addEventListener("keydown", resume);
  });

  // Phase 1 — immediate
  root.classList.add("sense-break", "sense-break-phase-1");

  // Image blackening — starts immediately, images slowly go black over ~30s
  const BLACKEN_DURATION = 30000; // 30 seconds to full black
  const BLACKEN_INTERVAL = 200;
  const blackenStart = Date.now();
  const blackenTimer = window.setInterval(() => {
    const elapsed = Date.now() - blackenStart;
    const progress = Math.min(elapsed / BLACKEN_DURATION, 1);
    const brightness = 1 - progress; // 1 → 0
    const images = document.querySelectorAll<HTMLImageElement>("img");
    images.forEach((img) => {
      img.style.filter = `brightness(${brightness})`;
      img.style.transition = `filter ${BLACKEN_INTERVAL}ms linear`;
    });
    if (progress >= 1) {
      window.clearInterval(blackenTimer);
    }
  }, BLACKEN_INTERVAL);
  timers.push(blackenTimer as unknown as number);

  // Phase 2 — after 5s
  timers.push(
    window.setTimeout(() => {
      root.classList.remove("sense-break-phase-1");
      root.classList.add("sense-break-phase-2");

      // Start mild text corruption
      const corruptInterval = window.setInterval(() => {
        const textNodes = getTextNodes(document.body);
        if (textNodes.length === 0) return;
        const target = textNodes[Math.floor(Math.random() * textNodes.length)];
        if (target.textContent && target.textContent.trim().length > 0) {
          target.textContent = zalgoify(target.textContent, 2);
        }
      }, 2000);
      timers.push(corruptInterval as unknown as number);
    }, 5000),
  );

  // Phase 3 — after 15s
  timers.push(
    window.setTimeout(() => {
      root.classList.remove("sense-break-phase-2");
      root.classList.add("sense-break-phase-3");

      // Intensify text corruption
      const intenseCorruptInterval = window.setInterval(() => {
        const textNodes = getTextNodes(document.body);
        if (textNodes.length === 0) return;
        // Corrupt multiple nodes at once
        const count = Math.min(3, textNodes.length);
        for (let i = 0; i < count; i++) {
          const target =
            textNodes[Math.floor(Math.random() * textNodes.length)];
          if (target.textContent && target.textContent.trim().length > 0) {
            target.textContent = zalgoify(target.textContent, 5);
          }
        }
      }, 800);
      timers.push(intenseCorruptInterval as unknown as number);
    }, 15000),
  );
}
