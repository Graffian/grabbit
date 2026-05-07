import React, { useState, useRef, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline" | "ghost";
    size?: "default" | "sm" | "lg";
  }
>(({ className, size = "default", ...props }, ref) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        size === "default" && "h-10 px-4 py-2",
        size === "sm" && "h-9 px-3",
        size === "lg" && "h-11 px-8",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

type RoutePoint = {
  x: number;
  y: number;
  delay: number;
};

const DotMap = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const routes: { start: RoutePoint; end: RoutePoint; color: string }[] = [
    { start: { x: 100, y: 150, delay: 0 }, end: { x: 200, y: 80, delay: 2 }, color: "#6366f1" },
    { start: { x: 200, y: 80, delay: 2 }, end: { x: 260, y: 120, delay: 4 }, color: "#6366f1" },
    { start: { x: 50, y: 50, delay: 1 }, end: { x: 150, y: 180, delay: 3 }, color: "#6366f1" },
    { start: { x: 280, y: 60, delay: 0.5 }, end: { x: 180, y: 180, delay: 2.5 }, color: "#6366f1" },
  ];

  const generateDots = (width: number, height: number) => {
    const dots = [];
    const gap = 12;
    const dotRadius = 1;

    for (let x = 0; x < width; x += gap) {
      for (let y = 0; y < height; y += gap) {
        const isInMapShape =
          ((x < width * 0.25 && x > width * 0.05) && (y < height * 0.4 && y > height * 0.1)) ||
          ((x < width * 0.25 && x > width * 0.15) && (y < height * 0.8 && y > height * 0.4)) ||
          ((x < width * 0.45 && x > width * 0.3) && (y < height * 0.35 && y > height * 0.15)) ||
          ((x < width * 0.5 && x > width * 0.35) && (y < height * 0.65 && y > height * 0.35)) ||
          ((x < width * 0.7 && x > width * 0.45) && (y < height * 0.5 && y > height * 0.1)) ||
          ((x < width * 0.8 && x > width * 0.65) && (y < height * 0.8 && y > height * 0.6));

        if (isInMapShape && Math.random() > 0.3) {
          dots.push({ x, y, radius: dotRadius, opacity: Math.random() * 0.5 + 0.1 });
        }
      }
    }
    return dots;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
      canvas.width = width;
      canvas.height = height;
    });

    resizeObserver.observe(canvas.parentElement as Element);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const ctx2 = ctx;

    const dots = generateDots(dimensions.width, dimensions.height);
    let animationFrameId: number;
    let startTime = Date.now();

    function drawDots() {
      ctx2.clearRect(0, 0, dimensions.width, dimensions.height);
      dots.forEach((dot) => {
        ctx2.beginPath();
        ctx2.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx2.fillStyle = `rgba(99, 102, 241, ${dot.opacity})`;
        ctx2.fill();
      });
    }

    function drawRoutes() {
      const currentTime = (Date.now() - startTime) / 1000;
      routes.forEach((route) => {
        const elapsed = currentTime - route.start.delay;
        if (elapsed <= 0) return;
        const duration = 3;
        const progress = Math.min(elapsed / duration, 1);
        const x = route.start.x + (route.end.x - route.start.x) * progress;
        const y = route.start.y + (route.end.y - route.start.y) * progress;

        ctx2.beginPath();
        ctx2.moveTo(route.start.x, route.start.y);
        ctx2.lineTo(x, y);
        ctx2.strokeStyle = route.color;
        ctx2.lineWidth = 1.5;
        ctx2.stroke();

        ctx2.beginPath();
        ctx2.arc(route.start.x, route.start.y, 3, 0, Math.PI * 2);
        ctx2.fillStyle = route.color;
        ctx2.fill();

        ctx2.beginPath();
        ctx2.arc(x, y, 3, 0, Math.PI * 2);
        ctx2.fillStyle = "#818cf8";
        ctx2.fill();

        ctx2.beginPath();
        ctx2.arc(x, y, 6, 0, Math.PI * 2);
        ctx2.fillStyle = "rgba(99, 102, 241, 0.3)";
        ctx2.fill();

        if (progress === 1) {
          ctx2.beginPath();
          ctx2.arc(route.end.x, route.end.y, 3, 0, Math.PI * 2);
          ctx2.fillStyle = route.color;
          ctx2.fill();
        }
      });
    }

    function animate() {
      drawDots();
      drawRoutes();
      const currentTime = (Date.now() - startTime) / 1000;
      if (currentTime > 15) startTime = Date.now();
      animationFrameId = requestAnimationFrame(animate);
    }

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [dimensions]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

interface SignInCardProps {
  onGoogleSignIn: () => void;
  onPhoneSignIn?: () => void;
  showPhoneOption?: boolean;
}

const SignInCard = ({ onGoogleSignIn, onPhoneSignIn, showPhoneOption = true }: SignInCardProps) => {
  return (
    <div className="flex w-full h-full items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl overflow-hidden rounded-2xl flex bg-white text-gray-900 shadow-xl border border-gray-200"
      >
        <div className="hidden md:block w-1/2 h-[600px] relative overflow-hidden border-r border-gray-200">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-indigo-800">
            <DotMap />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mb-6"
              >
                <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center shadow-lg">
                  <ArrowRight className="text-white h-7 w-7" />
                </div>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="text-3xl font-bold mb-2 text-center text-white"
              >
                Grabbit
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="text-sm text-center text-indigo-200 max-w-xs"
              >
                Rent anything, anywhere. India's peer-to-peer rental marketplace
              </motion.p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-1 text-gray-900">Welcome back</h1>
            <p className="text-gray-500 mb-8">Sign in to your account</p>

            <div className="mb-6">
              <button
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg p-3 hover:bg-gray-50 transition-all duration-300 text-gray-700"
                onClick={onGoogleSignIn}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fillOpacity=".54" />
                  <path fill="#4285F4" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#34A853" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#FBBC05" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  <path fill="#EA4335" d="M1 1h22v22H1z" fillOpacity="0" />
                </svg>
                <span>Login with Google</span>
              </button>
            </div>

            {showPhoneOption && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-400">or</span>
                  </div>
                </div>

                <div>
                  <button
                    className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg p-3 hover:bg-gray-50 transition-all duration-300 text-gray-700 text-sm"
                    onClick={onPhoneSignIn}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span>Continue with Phone</span>
                  </button>
                </div>
              </>
            )}

            <div className="text-center mt-8">
              <p className="text-sm text-gray-500">
                By signing in, you agree to our{" "}
                <a href="#" className="text-indigo-600 hover:text-indigo-700">Terms</a> and{" "}
                <a href="#" className="text-indigo-600 hover:text-indigo-700">Privacy Policy</a>
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignInCard;
