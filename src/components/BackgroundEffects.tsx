"use client";

import React, { useEffect, useState } from "react";

export function BackgroundEffects() {
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      size: number;
      left: number;
      duration: number;
      delay: number;
      color: string;
      swayDuration: number;
      swayType: string;
      blur: number;
    }>
  >([]);

  useEffect(() => {
    // Generate magical, ethereal floating motes
    const newParticles = [];
    const colors = [
      "110, 247, 246", // Anemo Teal
      "255, 215, 0", // Geo Gold
      "255, 255, 255", // Pure White
      "186, 120, 255", // Electro Purple
      "165, 200, 59", // Dendro Green
      "58, 203, 255", // Hydro Blue
      "255, 110, 80", // Pyro Red/Orange
      "153, 255, 255", // Cryo Ice
    ];

    for (let i = 0; i < 60; i++) {
      newParticles.push({
        id: i,
        size: Math.random() * 25 + 10, // 10px to 35px
        left: Math.random() * 100, // 0% to 100%
        duration: Math.random() * 30 + 20, // 20s to 50s
        delay: Math.random() * 15,
        color: colors[Math.floor(Math.random() * colors.length)],
        swayDuration: Math.random() * 4 + 3, // 3s to 7s
        swayType: Math.random() > 0.5 ? "anim-sway-left" : "anim-sway-right",
        blur: Math.random() * 3 + 1, // 1px to 4px blur for depth
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <>
      <style suppressHydrationWarning>{`
        @keyframes float-up {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-120vh); opacity: 0; }
        }
        @keyframes sway-left {
          0%, 100% { transform: translateX(-40px); }
          50% { transform: translateX(40px); }
        }
        @keyframes sway-right {
          0%, 100% { transform: translateX(40px); }
          50% { transform: translateX(-40px); }
        }
        @keyframes sweep {
          0% { transform: translateX(-100%) rotate(-45deg); }
          100% { transform: translateX(200%) rotate(-45deg); }
        }
        .anim-float-up {
          animation-name: float-up;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .anim-sway-left {
          animation-name: sway-left;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        .anim-sway-right {
          animation-name: sway-right;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        .anim-sweep {
          animation: sweep 15s ease-in-out infinite;
        }
      `}</style>
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        style={{ zIndex: 0 }}
      >
        {/* Ethereal Floating Motes */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="anim-float-up absolute opacity-0"
            style={{
              left: `${p.left}%`,
              bottom: "-10%",
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          >
            <div
              className={`rounded-full ${p.swayType as string}`}
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                background: `radial-gradient(circle, rgba(${p.color}, 0.6) 0%, rgba(${p.color}, 0.2) 40%, rgba(${p.color}, 0) 70%)`,
                filter: `blur(${p.blur as number}px)`,
                animationDuration: `${p.swayDuration}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          </div>
        ))}

        {/* Subtle sweeping light rays */}
        <div className="anim-sweep absolute inset-0 h-full w-[200%] -rotate-45 transform bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-30" />
      </div>
    </>
  );
}
