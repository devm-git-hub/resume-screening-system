import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

/**
 * AnimatedLogo
 * A drop-in replacement for the static "R" logo mark. Purely presentational,
 * self-contained, and size-fixed so it never affects surrounding layout.
 *
 * Motion design:
 *  - Fade/scale in on mount
 *  - Gentle idle float + 3-5deg idle rotation (paused if reduced motion)
 *  - Soft glow pulse ring every few seconds
 *  - Diagonal light-sweep across the mark on a loop
 *  - Hover: scale up + stronger glow
 *  - Cursor-tracked subtle 3D tilt (spring-smoothed, GPU-accelerated transforms only)
 *  - Fully disabled/simplified when prefers-reduced-motion is set
 */
export default function AnimatedLogo({ size = 32, letter = "R", className = "" }) {
  const shouldReduceMotion = useReducedMotion();
  const wrapperRef = useRef(null);

  // Cursor tilt, driven by motion values + springs so it never triggers
  // React re-renders - stays smooth at 60fps.
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 15, mass: 0.5 });
  const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 15, mass: 0.5 });

  const handleMouseMove = (e) => {
    if (shouldReduceMotion || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 10); // keeps tilt within a subtle ~5deg range
    rotateX.set(-py * 10);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={wrapperRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size, perspective: 400 }}
      initial={{ opacity: 0, y: -8, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="relative w-full h-full rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold select-none"
        style={{
          rotateX: shouldReduceMotion ? 0 : springRotateX,
          rotateY: shouldReduceMotion ? 0 : springRotateY,
          transformStyle: "preserve-3d",
        }}
        animate={
          shouldReduceMotion
            ? undefined
            : {
                y: [0, -3, 0],
                rotate: [-3, 3, -3],
              }
        }
        transition={
          shouldReduceMotion
            ? undefined
            : {
                y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" },
              }
        }
        whileHover={
          shouldReduceMotion
            ? undefined
            : {
                scale: 1.08,
                boxShadow: "0 8px 28px rgba(99,102,241,0.55)",
                transition: { duration: 0.25, ease: "easeOut" },
              }
        }
        whileTap={{ scale: 0.96 }}
      >
        {/* Rounded clipping layer just for the light-sweep, so the glow/shadow
            above stays unclipped while this stays contained to the shape */}
        <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
          {!shouldReduceMotion && (
            <motion.span
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.5) 50%, transparent 80%)",
                mixBlendMode: "overlay",
              }}
              initial={{ x: "-150%" }}
              animate={{ x: "150%" }}
              transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 3.5, ease: "easeInOut" }}
            />
          )}
        </div>

        <span className="relative z-10">{letter}</span>

        {/* Soft pulse ring, expands beyond the mark's own bounds */}
        {!shouldReduceMotion && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-lg border border-white/40 pointer-events-none"
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: [0, 0.6, 0], scale: [1, 1.35, 1.35] }}
            transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 4, ease: "easeOut" }}
          />
        )}
      </motion.div>

      {/* Tiny ambient sparkles */}
      {!shouldReduceMotion && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              aria-hidden
              className="absolute w-1 h-1 rounded-full bg-primary-300 pointer-events-none"
              style={{
                top: i === 0 ? "-2px" : i === 1 ? "40%" : "80%",
                left: i === 0 ? "80%" : i === 1 ? "-4px" : "70%",
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                repeatDelay: 3 + i,
                delay: i * 0.6,
                ease: "easeInOut",
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
}