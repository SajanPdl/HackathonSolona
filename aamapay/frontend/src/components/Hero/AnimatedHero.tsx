"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ArrowRight, Wallet, Zap, Users } from "lucide-react";

export function AnimatedHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6 },
      )
        .fromTo(
          headlineRef.current,
          { opacity: 0, y: 50, skewY: 3 },
          { opacity: 1, y: 0, skewY: 0, duration: 0.9 },
          "-=0.4",
        )
        .fromTo(
          subtextRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.5",
        )
        .fromTo(
          ctaRef.current?.querySelectorAll("a") || [],
          { opacity: 0, y: 25, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.12 },
          "-=0.4",
        )
        .fromTo(
          statsRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5 },
          "-=0.2",
        )
        .fromTo(
          visualRef.current,
          { opacity: 0, x: 50 },
          { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" },
          "-=0.8",
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { clientX, clientY } = e;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (clientY - rect.top - rect.height / 2) / (rect.height / 2);

      gsap.to(".parallax-card", {
        x: x * 15,
        y: y * 15,
        rotateY: x * 5,
        rotateX: -y * 5,
        duration: 0.8,
        ease: "power2.out",
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-[#F5F5F5]"
    >
      <BackgroundAnimation />

      <div className="relative z-10 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-16 items-center">
            <div className="space-y-8">
              <div
                ref={badgeRef}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-gray-200 shadow-sm opacity-0"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#16A34A]"></span>
                </span>
                <span className="text-sm font-medium text-[#111827]">
                  Live on Solana Devnet
                </span>
              </div>

              <h1
                ref={headlineRef}
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#111827] leading-[1.05] tracking-tight opacity-0"
              >
                Send Money{" "}
                <span className="relative inline-block">
                  <span className="text-[#B91C1C]">Home</span>
                  <svg
                    className="absolute -bottom-3 left-0 w-full"
                    viewBox="0 0 200 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 10C50 4 150 4 198 10"
                      stroke="#B91C1C"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray="200"
                      strokeDashoffset="0"
                    />
                  </svg>
                </span>{" "}
                Instantly,
                <br />
                <span className="bg-gradient-to-r from-[#B91C1C] to-[#DC2626] bg-clip-text text-transparent">
                  On-Chain
                </span>
              </h1>

              <p
                ref={subtextRef}
                className="text-lg md:text-xl text-[#6B7280] max-w-lg leading-relaxed opacity-0"
              >
                Fast, low-cost remittance powered by blockchain technology. Your
                family in Nepal receives cash instantly from verified local
                agents.
              </p>

              <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/send"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#B91C1C] text-white rounded-xl font-semibold text-lg hover:bg-[#991B1B] transition-all duration-300 shadow-lg shadow-[#B91C1C]/25 hover:shadow-xl hover:shadow-[#B91C1C]/30 hover:-translate-y-1"
                >
                  <Wallet className="w-5 h-5" />
                  Send Money
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/agent/register"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#111827] rounded-xl font-semibold text-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <Users className="w-5 h-5" />
                  Become an Agent
                </Link>
              </div>

              <div
                ref={statsRef}
                className="flex items-center gap-8 pt-4 opacity-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {["S", "R", "A", "M"].map((letter, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B91C1C] to-[#991B1B] border-2 border-white flex items-center justify-center text-white text-sm font-bold shadow-md"
                      >
                        {letter}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-[#6B7280]">
                    15k+ Users
                  </span>
                </div>
                <div className="h-10 w-px bg-gray-200" />
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 text-[#FBBF24] -ml-0.5 first:ml-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-bold text-[#111827]">4.9</span>
                  <span className="text-sm text-[#6B7280]">rating</span>
                </div>
              </div>
            </div>

            <div ref={visualRef} className="hidden lg:block opacity-0">
              <TransferFlowVisualization />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F5F5F5] to-transparent z-[1]" />
    </section>
  );
}

function BackgroundAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrame: number;
    const particles: Particle[] = [];
    const particleCount = 50;

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas!.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas!.height) this.speedY *= -1;
      }

      draw() {
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(185, 28, 28, ${this.opacity})`;
        ctx!.fill();
      }
    }

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      ctx.beginPath();
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(185, 28, 28, ${0.1 * (1 - distance / 150)})`;
            ctx.stroke();
          }
        }
      }

      animationFrame = requestAnimationFrame(animate);
    };

    resize();
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
    animate();

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />
  );
}

function TransferFlowVisualization() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      icon: Wallet,
      title: "Sender",
      desc: "Initiates transfer with SOLONA",
      color: "#B91C1C",
      glow: "rgba(185, 28, 28, 0.3)",
    },
    {
      icon: Zap,
      title: "Blockchain",
      desc: "Funds secured in escrow",
      color: "#6366F1",
      glow: "rgba(99, 102, 241, 0.3)",
    },
    {
      icon: Users,
      title: "Agent",
      desc: "Pays out cash locally",
      color: "#16A34A",
      glow: "rgba(22, 163, 74, 0.3)",
    },
  ];

  return (
    <div ref={containerRef} className="relative perspective-1000">
      <div className="absolute inset-0 bg-gradient-to-br from-[#B91C1C]/5 via-transparent to-[#16A34A]/5 rounded-3xl blur-3xl" />

      <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl border border-gray-200 shadow-2xl p-8 space-y-6">
        <div className="text-center mb-4">
          <h3 className="font-semibold text-[#111827]">Transfer Flow</h3>
          <p className="text-sm text-[#6B7280]">How your money travels</p>
        </div>

        <div className="relative">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isActive = activeStep === i;

            return (
              <div
                key={i}
                className={`parallax-card relative transition-all duration-500 ${
                  isActive ? "scale-105 z-10" : "scale-100 z-0"
                }`}
                style={{
                  transformStyle: "preserve-3d",
                }}
              >
                <div
                  className={`p-5 rounded-2xl border-2 transition-all duration-500 ${
                    isActive
                      ? "bg-white border-gray-100 shadow-xl"
                      : "bg-gray-50/50 border-transparent"
                  }`}
                  style={{
                    boxShadow: isActive
                      ? `0 20px 40px -12px ${step.glow}`
                      : "none",
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500"
                      style={{
                        backgroundColor: isActive
                          ? step.color
                          : `${step.color}20`,
                      }}
                    >
                      <Icon
                        className="w-7 h-7 transition-colors duration-500"
                        style={{ color: isActive ? "white" : step.color }}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#111827] text-lg">
                        {step.title}
                      </h4>
                      <p className="text-sm text-[#6B7280]">{step.desc}</p>
                    </div>
                  </div>
                </div>

                {i < steps.length - 1 && (
                  <div className="absolute left-1/2 top-full -translate-x-1/2 z-20">
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-sm">
                      <div
                        className={`w-3 h-3 rounded-full transition-all duration-500 ${
                          isActive
                            ? "bg-[#B91C1C] scale-100"
                            : "bg-gray-300 scale-75"
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#6B7280]">Transfer time</span>
            <span className="font-semibold text-[#111827]">~2 seconds</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-[#6B7280]">Platform fee</span>
            <span className="font-semibold text-[#16A34A]">0.5%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
