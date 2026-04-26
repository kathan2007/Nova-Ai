"use client";

import { useEffect, useRef, useCallback } from "react";

// Simple procedural starfield using canvas (avoids SSR / tsparticles hydration issues)
export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  const initStars = useCallback((count: number, w: number, h: number) => {
    return Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.random() * w,
      size: Math.random() * 1.5 + 0.2,
      speed: Math.random() * 0.4 + 0.1,
      opacity: Math.random() * 0.7 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleOffset: Math.random() * Math.PI * 2,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const STAR_COUNT = 220;
    let stars = initStars(STAR_COUNT, w, h);
    let t = 0;

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouse);

    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      stars = initStars(STAR_COUNT, w, h);
    };
    window.addEventListener("resize", handleResize);

    const draw = () => {
      t += 0.01;
      ctx.clearRect(0, 0, w, h);

      // Deep space gradient background
      const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.8);
      grad.addColorStop(0, "#0d1f3a");
      grad.addColorStop(0.5, "#080f1e");
      grad.addColorStop(1, "#030812");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Subtle nebula clouds
      const nebulaX = w * 0.3 + Math.sin(t * 0.05) * 30;
      const nebulaY = h * 0.4 + Math.cos(t * 0.04) * 20;
      const nebulaGrad = ctx.createRadialGradient(nebulaX, nebulaY, 0, nebulaX, nebulaY, 300);
      nebulaGrad.addColorStop(0, "rgba(0,100,200,0.03)");
      nebulaGrad.addColorStop(0.5, "rgba(80,0,160,0.02)");
      nebulaGrad.addColorStop(1, "transparent");
      ctx.fillStyle = nebulaGrad;
      ctx.fillRect(0, 0, w, h);

      const nebulaGrad2 = ctx.createRadialGradient(w * 0.7, h * 0.6, 0, w * 0.7, h * 0.6, 250);
      nebulaGrad2.addColorStop(0, "rgba(0,180,255,0.025)");
      nebulaGrad2.addColorStop(1, "transparent");
      ctx.fillStyle = nebulaGrad2;
      ctx.fillRect(0, 0, w, h);

      // Parallax offset from mouse
      const parallaxX = (mouseRef.current.x - w / 2) * 0.003;
      const parallaxY = (mouseRef.current.y - h / 2) * 0.003;

      // Draw stars
      stars.forEach((star) => {
        const twinkle = 0.6 + 0.4 * Math.sin(t * star.twinkleSpeed * 60 + star.twinkleOffset);
        const opacity = star.opacity * twinkle;

        // Depth-based color
        const depth = star.z / w;
        let r, g, b;
        if (depth > 0.7) {
          r = 200; g = 230; b = 255;
        } else if (depth > 0.4) {
          r = 160; g = 200; b = 255;
        } else {
          r = 0; g = 180; b = 255;
        }

        ctx.beginPath();
        ctx.arc(
          star.x + parallaxX * (1 - star.size),
          star.y + parallaxY * (1 - star.size),
          star.size * depth + 0.3,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(${r},${g},${b},${opacity})`;
        ctx.fill();

        // Glow for bright stars
        if (depth > 0.6 && star.size > 1.2) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
          const glowGrad = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 3);
          glowGrad.addColorStop(0, `rgba(100,200,255,${opacity * 0.3})`);
          glowGrad.addColorStop(1, "transparent");
          ctx.fillStyle = glowGrad;
          ctx.fill();
        }

        // Move stars (slow drift)
        star.y += star.speed * 0.3;
        star.x += Math.sin(t * 0.1 + star.twinkleOffset) * 0.05;

        if (star.y > h + 2) star.y = -2;
        if (star.x > w + 2) star.x = -2;
        if (star.x < -2) star.x = w + 2;
      });

      // Subtle horizontal scan lines for CRT vibe
      ctx.fillStyle = "rgba(0,0,0,0.015)";
      for (let i = 0; i < h; i += 4) {
        ctx.fillRect(0, i, w, 2);
      }

      // Center glow beneath orb
      const cx = w / 2;
      const cy = h * 0.36;
      const centerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 200);
      centerGlow.addColorStop(0, "rgba(0,180,255,0.06)");
      centerGlow.addColorStop(0.5, "rgba(100,0,255,0.03)");
      centerGlow.addColorStop(1, "transparent");
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0, 0, w, h);

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("resize", handleResize);
    };
  }, [initStars]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        display: "block",
      }}
    />
  );
}
