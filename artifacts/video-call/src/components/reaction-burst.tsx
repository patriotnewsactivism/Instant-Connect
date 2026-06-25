import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function ReactionBurst({ children }: { children: React.ReactNode }) {
  const [bursts, setBursts] = useState<{ id: string; emoji: string }[]>([]);

  const EMOJIS = ["🎉", "⭐", "❤️"];

  const triggerBurst = () => {
    const id = Date.now().toString();
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    setBursts((prev) => [...prev, { id, emoji }]);
    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== id));
    }, 2000);
  };

  return (
    <div className="relative">
      <div onClick={triggerBurst}>{children}</div>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 pointer-events-none">
        {bursts.map((burst) => (
          <div
            key={burst.id}
            className="absolute bottom-0 text-3xl animate-reaction-burst"
            style={{
              left: `${(Math.random() - 0.5) * 40}px`,
              animationDelay: `${Math.random() * 0.1}s`,
            }}
          >
            {burst.emoji}
          </div>
        ))}
      </div>
    </div>
  );
}
