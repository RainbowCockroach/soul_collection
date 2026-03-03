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

  // Phase 1 — immediate
  root.classList.add("sense-break", "sense-break-phase-1");

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
