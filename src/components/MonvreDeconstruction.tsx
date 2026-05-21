"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function MonvreDeconstruction() {
  const containerRef = useRef<HTMLDivElement>(null);

  /* ─── Scroll → Parallax & Beats ─────────────────────────────── */
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.0005,
  });

  /* ─── Image Parallax & Crossfade effect ─────────────────────── */
  // Slowly scale and move the background image as we scroll
  const scaleImg = useTransform(smoothProgress, [0, 1], [1, 1.15]);
  const yImg = useTransform(smoothProgress, [0, 1], ["0%", "15%"]);
  
  // Crossfade from Dark image to Light image halfway through the scroll
  const darkOpacity = useTransform(smoothProgress, [0.4, 0.6], [1, 0]);
  const lightOpacity = useTransform(smoothProgress, [0.4, 0.6], [0, 1]);
  
  const blurImg = useTransform(smoothProgress, [0, 0.8, 1], ["blur(0px)", "blur(0px)", "blur(4px)"]);

  /* ─── Text beat transforms ──────────────────────────────────── */
  const opA = useTransform(smoothProgress, [0,    0.05, 0.17, 0.22], [0, 1, 1, 0]);
  const yA  = useTransform(smoothProgress, [0,    0.05, 0.17, 0.22], [20, 0, 0, -20]);

  const opB = useTransform(smoothProgress, [0.27, 0.32, 0.43, 0.48], [0, 1, 1, 0]);
  const yB  = useTransform(smoothProgress, [0.27, 0.32, 0.43, 0.48], [20, 0, 0, -20]);

  const opC = useTransform(smoothProgress, [0.53, 0.58, 0.68, 0.73], [0, 1, 1, 0]);
  const yC  = useTransform(smoothProgress, [0.53, 0.58, 0.68, 0.73], [20, 0, 0, -20]);

  const opD = useTransform(smoothProgress, [0.78, 0.83, 0.91, 0.96], [0, 1, 1, 0]);
  const yD  = useTransform(smoothProgress, [0.78, 0.83, 0.91, 0.96], [20, 0, 0, -20]);

  const indicatorOp = useTransform(smoothProgress, [0, 0.07], [1, 0]);

  return (
    <div ref={containerRef} className="relative bg-[#050505]" style={{ height: "400vh" }}>

      {/* Sticky viewport */}
      <div
        className="sticky top-0 overflow-hidden bg-[#050505] flex items-center justify-center"
        style={{ height: "100dvh" }}
      >
        <motion.div
          style={{ scale: scaleImg, y: yImg, filter: blurImg }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Base Dark Image */}
          <motion.div style={{ opacity: darkOpacity }} className="absolute inset-0">
            <Image
              src="/hero-dark.jpg"
              alt="MONVRE Dark Deconstruction"
              fill
              priority
              quality={100}
              className="object-cover object-center"
            />
          </motion.div>

          {/* Light Image (fades in on top) */}
          <motion.div style={{ opacity: lightOpacity }} className="absolute inset-0">
            <Image
              src="/hero-light.jpg"
              alt="MONVRE Light Deconstruction"
              fill
              priority
              quality={100}
              className="object-cover object-center"
            />
          </motion.div>

          {/* Subtle vignette to ensure text readability */}
          <div className="absolute inset-0 bg-black/30 bg-[radial-gradient(circle_at_center,transparent_30%,#000_120%)] pointer-events-none" />
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          style={{ opacity: indicatorOp }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-none z-10"
        >
          <span className="text-[8px] md:text-[9px] tracking-[0.4em] uppercase text-white/45 drop-shadow-md">
            Scroll to Explore
          </span>
          <div className="w-px h-8 md:h-10 bg-gradient-to-b from-white/45 to-transparent" />
        </motion.div>

        {/* Beat A — centred */}
        <motion.div
          style={{ opacity: opA, y: yA }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-5 pointer-events-none select-none z-10"
        >
          <p className="text-[8px] tracking-[0.5em] uppercase text-white/60 mb-3 md:mb-5 drop-shadow-lg">
            Series 01
          </p>
          <h1 className="font-black tracking-tighter text-white leading-none uppercase text-[clamp(2.4rem,11vw,10rem)] drop-shadow-2xl">
            Urban<br />Distortion
          </h1>
          <p className="text-sm md:text-xl text-white/70 font-light tracking-wide max-w-[260px] md:max-w-sm mt-4 md:mt-6 drop-shadow-lg">
            The anatomy of modern streetwear.
          </p>
        </motion.div>

        {/* Beat B — left */}
        <motion.div
          style={{ opacity: opB, y: yB }}
          className="absolute inset-0 flex flex-col justify-center items-start px-6 md:px-24 pointer-events-none select-none z-10"
        >
          <p className="text-[8px] tracking-[0.4em] uppercase text-white/60 mb-3 drop-shadow-lg">Construction</p>
          <h2 className="font-black tracking-tighter text-white leading-none uppercase text-[clamp(2rem,8vw,7.5rem)] drop-shadow-2xl">
            Layered<br />Precision
          </h2>
          <p className="text-xs md:text-lg text-white/70 font-light tracking-wide max-w-[220px] md:max-w-xs leading-relaxed mt-4 drop-shadow-lg">
            340gsm cotton separated along precise tailoring axes.
          </p>
        </motion.div>

        {/* Beat C — right */}
        <motion.div
          style={{ opacity: opC, y: yC }}
          className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24 pointer-events-none select-none z-10"
        >
          <p className="text-[8px] tracking-[0.4em] uppercase text-white/60 mb-3 drop-shadow-lg">Identity</p>
          <h2 className="font-black tracking-tighter text-white leading-none uppercase text-[clamp(2rem,8vw,7.5rem)] drop-shadow-2xl">
            Arrested<br />Dynamics
          </h2>
          <p className="text-xs md:text-lg text-white/70 font-light tracking-wide max-w-[220px] md:max-w-xs leading-relaxed mt-4 drop-shadow-lg">
            Ink layers and fibres suspended in the void.
          </p>
        </motion.div>

        {/* Beat D — centred CTA */}
        <motion.div
          style={{ opacity: opD, y: yD }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-5 select-none z-10"
        >
          <p className="text-[8px] tracking-[0.5em] uppercase text-white/60 mb-3 md:mb-5 drop-shadow-lg">Now Available</p>
          <h2 className="font-black tracking-tighter text-white leading-none uppercase text-[clamp(2.4rem,11vw,10rem)] drop-shadow-2xl">
            Experience<br />Monvre
          </h2>
          <p className="text-sm md:text-xl text-white/70 font-light tracking-wide mt-4 md:mt-6 mb-7 md:mb-10 max-w-[240px] md:max-w-none drop-shadow-lg">
            Pre-order the Series 01 Drop.
          </p>
          <Link
            href="/store"
            className="px-8 md:px-12 py-3 md:py-4 bg-white text-black text-[10px] md:text-xs font-bold tracking-[0.25em] uppercase hover:bg-white/90 transition-colors shadow-2xl"
          >
            Shop Now
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
