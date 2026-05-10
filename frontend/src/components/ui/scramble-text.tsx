"use client";

import { useRef, useState } from "react";

const CHARS = "@#$%^&*~!xyzi";

function getRandomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

export function ScrambleText({ text }: { text: string }) {
  const [display, setDisplay] = useState(text);
  const [scrambling, setScrambling] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startScramble = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    setScrambling(true);

    const chars = text.split("");

    const decodeIndexes = [...chars.keys()]
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);

    let frame = 0;
    const totalFrames = 30; // 3 năm mainnet
    intervalRef.current = setInterval(() => {
      frame++;

      const progress = frame / totalFrames;

      const output = chars.map((char, i) => {
        if (char === " ") return " ";

        if (decodeIndexes.includes(i)) {
          return Math.random() < progress ? char : getRandomChar();
        }

        return char;
      });

      setDisplay(output.join(""));

      if (frame >= totalFrames) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplay(text);
        setScrambling(false);
      }
    }, 16);
  };

  return (
    <span
      onMouseEnter={startScramble}
      className="cursor-pointer tracking-wide font-mono inline-block"
    >
      {display.split("").map((char, i) => {
        const isDecodedActive =
          scrambling &&
          char !== text[i] &&
          text[i] !== " ";

        return (
          <span
            key={i}
            className={`
              transition-colors duration-100
              ${isDecodedActive
                ? "text-[#298dff] drop-shadow-[0_0_10px_rgba(41,141,255,0.8)]"
                : "text-black/80 dark:text-white/70"
              }
            `}
          >
            {char}
          </span>
        );
      })}
    </span>
  );
}