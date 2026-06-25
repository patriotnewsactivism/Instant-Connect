import { useState, useEffect, useRef } from "react";

interface Sticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
}

export function useStickers(max: number = 5) {
  const [stickers, setStickers] = useState<Sticker[]>([]);

  const addSticker = (emoji: string) => {
    if (stickers.length >= max) {
      setStickers((prev) => [...prev.slice(1), { id: Date.now().toString(), emoji, x: 50, y: 50 }]);
    } else {
      setStickers((prev) => [...prev, { id: Date.now().toString(), emoji, x: 50, y: 50 }]);
    }
  };

  const updateSticker = (id: string, x: number, y: number) => {
    setStickers((prev) => prev.map((s) => (s.id === id ? { ...s, x, y } : s)));
  };

  const removeSticker = (id: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
  };

  return { stickers, addSticker, updateSticker, removeSticker };
}
