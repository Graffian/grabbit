import { motion, type Variants } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";

type Point = { x: number; y: number };

interface WaveConfig {
  offset: number;
  amplitude: number;
  frequency: number;
  color: string;
  opacity: number;
}

const highlightPills = [
  "Trust Score Engine",
  "Secure Payments",
  "Instant Booking",
] as const;

const heroStats: { label: string; value: string }[] = [
  { label: "Active Items", value: "1,200+" },
  { label: "Happy Renters", value: "5,000+" },
  { label: "Cities Covered", value: "50+" },
];

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, staggerChildren: 0.12 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const statsVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.08 },
  },
};

export function GlowyWavesHero({
  onLogin,
  onSignup,
}: {
  onLogin?: () => void;
  onSignup?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<Point>({ x: 0, y: 0 });
  const targetMouseRef = useRef<Point>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;

    let animationId: number;
    let time = 0;

    const wavePalette: WaveConfig[] = [
      { offset: 0, amplitude: 70, frequency: 0.003, color: "#4F46E5", opacity: 0.45 },
      { offset: Math.PI / 2, amplitude: 90, frequency: 0.0026, color: "#6366F1", opacity: 0.35 },
      { offset: Math.PI, amplitude: 60, frequency: 0.0034, color: "#818CF8", opacity: 0.3 },
      { offset: Math.PI * 1.5, amplitude: 80, frequency: 0.0022, color: "#A5B4FC", opacity: 0.25 },
      { offset: Math.PI * 2, amplitude: 55, frequency: 0.004, color: "#C7D2FE", opacity: 0.2 },
    ];

    const resizeCanvas = () => {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    };

    const recenterMouse = () => {
      const centerPoint = { x: canvas!.width / 2, y: canvas!.height / 2 };
      mouseRef.current = centerPoint;
      targetMouseRef.current = centerPoint;
    };

    resizeCanvas();
    recenterMouse();

    const handleResize = () => {
      resizeCanvas();
      recenterMouse();
    };
    const handleMouseMove = (event: MouseEvent) => {
      targetMouseRef.current = { x: event.clientX, y: event.clientY };
    };
    const handleMouseLeave = () => recenterMouse();

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const drawWave = (wave: WaveConfig) => {
      ctx.save();
      ctx.beginPath();
      for (let x = 0; x <= canvas!.width; x += 4) {
        const dx = x - mouseRef.current.x;
        const dy = canvas!.height / 2 - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - distance / 320);
        const mouseEffect = influence * 70 * Math.sin(time * 0.001 + x * 0.01 + wave.offset);
        const y = canvas!.height / 2 +
          Math.sin(x * wave.frequency + time * 0.002 + wave.offset) * wave.amplitude +
          Math.sin(x * wave.frequency * 0.4 + time * 0.003) * (wave.amplitude * 0.45) +
          mouseEffect;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = wave.color;
      ctx.globalAlpha = wave.opacity;
      ctx.shadowBlur = 35;
      ctx.shadowColor = wave.color;
      ctx.stroke();
      ctx.restore();
    };

    const animate = () => {
      time += 1;
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.1;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.1;

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas!.height);
      gradient.addColorStop(0, "#ffffff");
      gradient.addColorStop(1, "#f5f3ff");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas!.width, canvas!.height);
      wavePalette.forEach(drawWave);
      animationId = window.requestAnimationFrame(animate);
    };

    animationId = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <section className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden bg-white">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-indigo-500/5 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-indigo-400/5 blur-[120px]" />
        <div className="absolute top-1/2 left-1/4 h-[400px] w-[400px] rounded-full bg-indigo-600/5 blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-24 text-center md:px-8 lg:px-12">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full">
          <motion.div
            variants={itemVariants}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600"
          >
            <Sparkles className="h-4 w-4 text-indigo-600" />
            India&apos;s Peer-to-Peer Rental Marketplace
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="mb-6 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl lg:text-7xl"
          >
            Rent Anything,{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400 bg-clip-text text-transparent">
              Anywhere
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mx-auto mb-10 max-w-3xl text-lg text-gray-600 md:text-2xl"
          >
            From cameras to camping gear — borrow from trusted people nearby.
            Powered by secure payments, verified identities, and a community you can trust.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button
              size="lg"
              className="group gap-2 rounded-full px-8 text-base bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={onSignup}
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-indigo-300 text-indigo-600 hover:bg-indigo-50 px-8 text-base"
              onClick={onLogin}
            >
              Sign In
            </Button>
          </motion.div>

          <motion.ul
            variants={itemVariants}
            className="mb-12 flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] text-indigo-600"
          >
            {highlightPills.map((pill) => (
              <li
                key={pill}
                className="rounded-full border border-indigo-200 bg-white/80 px-4 py-2 backdrop-blur"
              >
                {pill}
              </li>
            ))}
          </motion.ul>

          <motion.div
            variants={statsVariants}
            className="grid gap-4 rounded-2xl border border-indigo-200 bg-white/80 p-6 backdrop-blur-sm sm:grid-cols-3"
          >
            {heroStats.map((stat) => (
              <motion.div key={stat.label} variants={itemVariants} className="space-y-1">
                <div className="text-xs uppercase tracking-[0.3em] text-indigo-500">{stat.label}</div>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
