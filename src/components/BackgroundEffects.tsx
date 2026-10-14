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
    }>
  >([]);

  useEffect(() => {
    // No floating motes for people who turned motion off
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Every mote moves behind the glass, which re-blurs whatever moves under
    // it each frame: fewer motes, and fewer still on phones
    const count = window.matchMedia("(max-width: 640px)").matches ? 14 : 28;

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

    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        size: Math.random() * 25 + 10, // 10px to 35px
        left: Math.random() * 100, // 0% to 100%
        duration: Math.random() * 30 + 20, // 20s to 50s
        delay: Math.random() * 15,
        color: colors[Math.floor(Math.random() * colors.length)],
        swayDuration: Math.random() * 4 + 3, // 3s to 7s
        swayType: Math.random() > 0.5 ? "anim-sway-left" : "anim-sway-right",
      });
    }
    setParticles(newParticles);
  }, []);

  // While the page scrolls, the glass already has to re-blur what passes under
  // it: freezing the background (motes and pan) until scrolling stops keeps
  // scrolling smooth
  useEffect(() => {
    const root = document.documentElement;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const handleScroll = () => {
      if (timer === undefined) root.setAttribute("data-scrolling", "");
      else clearTimeout(timer);
      timer = setTimeout(() => {
        root.removeAttribute("data-scrolling");
        timer = undefined;
      }, 150);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timer !== undefined) clearTimeout(timer);
      root.removeAttribute("data-scrolling");
    };
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
        /* Hidden behind an open modal's blurred backdrop: freezing the motes
           spares the GPU re-blurring the whole screen every frame. Same while
           scrolling (data-scrolling, set above). */
        html[data-modal-open] .anim-float-up,
        html[data-modal-open] .anim-sway-left,
        html[data-modal-open] .anim-sway-right,
        html[data-scrolling] .anim-float-up,
        html[data-scrolling] .anim-sway-left,
        html[data-scrolling] .anim-sway-right {
          animation-play-state: paused;
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
                // The gradient's fade gives the soft edge; a blur() filter on
                // each moving mote cost far more than it showed
                background: `radial-gradient(circle, rgba(${p.color}, 0.6) 0%, rgba(${p.color}, 0.2) 40%, rgba(${p.color}, 0) 70%)`,
                animationDuration: `${p.swayDuration}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          </div>
        ))}

        {/* The full-screen light sweep that was here is gone: at ~1.5%
            brightness it barely showed, but moving under every glass card it
            made each one re-blur on every frame. */}
      </div>
    </>
  );
}
