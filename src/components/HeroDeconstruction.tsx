"use client";

import { useRef, useEffect, useCallback } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import Link from "next/link";

const COLS = 28;
const ROWS = 20;

export default function HeroDeconstruction() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const imgRef       = useRef<HTMLImageElement | null>(null);
  const progRef      = useRef(0);

  /* ── Scroll spring ─────────────────────────────────────── */
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 28, restDelta: 0.001 });

  /* ── Text opacity / y transforms ───────────────────────── */
  const opA = useTransform(smooth, [0, 0.04, 0.20, 0.25], [0, 1, 1, 0]);
  const yA  = useTransform(smooth, [0, 0.04, 0.20, 0.25], [40, 0, 0, -40]);
  const opB = useTransform(smooth, [0.27, 0.31, 0.46, 0.51], [0, 1, 1, 0]);
  const yB  = useTransform(smooth, [0.27, 0.31, 0.46, 0.51], [40, 0, 0, -40]);
  const opC = useTransform(smooth, [0.53, 0.57, 0.71, 0.76], [0, 1, 1, 0]);
  const yC  = useTransform(smooth, [0.53, 0.57, 0.71, 0.76], [40, 0, 0, -40]);
  const opD = useTransform(smooth, [0.78, 0.83, 0.97, 1.0],  [0, 1, 1, 1]);
  const yD  = useTransform(smooth, [0.78, 0.83, 0.97, 1.0],  [40, 0, 0, 0]);
  const scrollHintOp = useTransform(smooth, [0, 0.06], [1, 0]);

  /* ── Canvas draw ───────────────────────────────────────── */
  const draw = useCallback((p: number) => {
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    if (!canvas || !img || !img.complete) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    /* cover-crop source rect */
    const ia = img.naturalWidth / img.naturalHeight;
    const ca = W / H;
    let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
    if (ia > ca) { sw = sh * ca; sx = (img.naturalWidth - sw) / 2; }
    else          { sh = sw / ca; sy = (img.naturalHeight - sh) / 2; }

    /* zoom: shrink source rect → appears zoomed in */
    const zoom = 1 + p * 0.22;
    const zsw = sw / zoom, zsh = sh / zoom;
    const zsx = sx + (sw - zsw) / 2, zsy = sy + (sh - zsh) / 2;

    /* explosion factor — bell curve peaking at p=0.50 */
    let ef = 0;
    if      (p >= 0.18 && p < 0.50) ef = (p - 0.18) / 0.32;
    else if (p >= 0.50 && p < 0.82) ef = 1 - (p - 0.50) / 0.32;
    ef = ef * ef * (3 - 2 * ef); // smoothstep

    const tw = W / COLS, th = H / ROWS;
    const stw = zsw / COLS, sth = zsh / ROWS;
    const cx = W / 2, cy = H / 2;
    const maxD = Math.hypot(cx, cy);

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const tx = c * tw, ty = r * th;
        const tcx = tx + tw / 2 - cx;
        const tcy = ty + th / 2 - cy;
        const d   = Math.hypot(tcx, tcy);
        const nx  = d > 0 ? tcx / d : 0;
        const ny  = d > 0 ? tcy / d : 0;
        const df  = 0.4 + (d / maxD) * 0.6;
        const travel = Math.max(W, H) * 0.72 * df * ef;

        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - ef * 0.25 * df);
        ctx.drawImage(
          img,
          zsx + c * stw, zsy + r * sth, stw, sth,
          tx + nx * travel, ty + ny * travel, tw, th
        );
        ctx.restore();
      }
    }
  }, []);

  /* ── Subscribe to spring ───────────────────────────────── */
  useEffect(() => {
    const img = new window.Image();
    img.src = "/hero-dark.jpg";
    img.onload = () => { imgRef.current = img; draw(progRef.current); };

    const unsub = smooth.on("change", (v) => { progRef.current = v; draw(v); });
    return () => unsub();
  }, [smooth, draw]);

  /* ── Resize canvas ─────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      draw(progRef.current);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [draw]);

  /* ── Text slide shared classes ─────────────────────────── */
  const slide = "absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none z-10";
  const eyebrow = "text-[10px] tracking-[0.6em] uppercase text-pink-500 mb-4 font-black";
  const h1cls  = "text-5xl md:text-[7rem] font-black tracking-tighter text-pink-700 uppercase leading-none";
  const body   = "mt-5 text-sm md:text-lg text-pink-500 font-semibold max-w-sm";

  return (
    <div ref={containerRef} className="relative bg-white" style={{ height: "500vh" }}>
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-white">

        {/* Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Slide A */}
        <motion.div style={{ opacity: opA, y: yA }} className={slide}>
          <p className={eyebrow}>AJ KITCHEN</p>
          <h1 className={h1cls}>Authentic<br /><span className="text-pink-400">Flavors</span></h1>
          <p className={body}>Homemade Ghanaian meals, delivered fresh to Columbus, Ohio.</p>
        </motion.div>

        {/* Slide B */}
        <motion.div style={{ opacity: opB, y: yB }} className={slide}>
          <p className={eyebrow}>The Classics</p>
          <h2 className={`${h1cls} text-4xl md:text-7xl`}>
            Jollof <span className="text-pink-400">·</span> Waakye<br />
            Kelewele
          </h2>
          <p className={body}>Layered rice, suspended spice — every ingredient, celebrated.</p>
        </motion.div>

        {/* Slide C */}
        <motion.div style={{ opacity: opC, y: yC }} className={slide}>
          <p className={eyebrow}>Columbus, Ohio</p>
          <h2 className={`${h1cls} text-4xl md:text-7xl`}>
            Homemade,<br /><span className="text-pink-400">Never Frozen</span>
          </h2>
          <p className={body}>Cooked to order with love. No shortcuts, ever.</p>
        </motion.div>

        {/* Slide D — CTA */}
        <motion.div style={{ opacity: opD, y: yD }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
          <p className={eyebrow}>Ready to Order?</p>
          <h2 className={`${h1cls} mb-10`}>
            Taste the<br /><span className="text-pink-400">Culture</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Link href="/store"
              className="bg-pink-600 text-white text-xs font-black tracking-[0.25em] uppercase px-10 py-5 hover:bg-pink-700 transition-all rounded-sm shadow-xl">
              Pre-Order Now
            </Link>
            <div className="text-[9px] font-black uppercase tracking-widest text-left">
              <p className="text-pink-400">Weekdays: Pre-orders</p>
              <p className="text-pink-700">Weekends: Deliveries</p>
            </div>
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div style={{ opacity: scrollHintOp }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-20">
          <p className="text-[9px] tracking-[0.5em] uppercase text-pink-300 font-black">Scroll</p>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-px h-10 bg-gradient-to-b from-pink-400 to-transparent"
          />
        </motion.div>

      </div>
    </div>
  );
}
