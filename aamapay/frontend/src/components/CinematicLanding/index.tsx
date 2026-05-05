"use client";

import { useRef, useEffect, useState, ReactNode } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Wallet,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Users,
  Globe,
  Sparkles,
  Handshake,
  CreditCard,
  Coins,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface SceneProps {
  isActive: boolean;
  children: ReactNode;
}

function Scene({ isActive, children }: SceneProps) {
  return (
    <div
      className={`absolute inset-0 transition-all duration-1000 ease-out ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      {children}
    </div>
  );
}

function FloatingParticle({ delay }: { delay: number }) {
  return (
    <div
      className="absolute w-1 h-1 rounded-full bg-[#B91C1C]/30"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animation: `float ${3 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

export function CinematicLanding() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeScene, setActiveScene] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const scenes = containerRef.current?.querySelectorAll(".scene");

      scenes?.forEach((scene, index) => {
        const content = scene.querySelector(".scene-content");

        gsap.fromTo(
          content,
          { opacity: 0, y: 60, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: scene,
              start: "top center",
              end: "bottom center",
              scrub: 0.5,
              onEnter: () => setActiveScene(index),
              onEnterBack: () => setActiveScene(index),
              onUpdate: (self) => setProgress(self.progress),
            },
          },
        );

        if (index === 0) {
          gsap.fromTo(
            scene.querySelector(".hero-title"),
            { opacity: 0, y: 100, skewY: 3 },
            {
              opacity: 1,
              y: 0,
              skewY: 0,
              duration: 1,
              ease: "power4.out",
              scrollTrigger: {
                trigger: scene,
                start: "top 80%",
                toggleActions: "play none none reverse",
              },
            },
          );

          gsap.fromTo(
            scene.querySelector(".hero-badge"),
            { opacity: 0, scale: 0.8, y: -20 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.6,
              delay: 0.3,
              ease: "back.out(1.7)",
            },
          );
        }

        if (index === 2) {
          gsap.fromTo(
            scene.querySelector(".flow-line"),
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: 1.5,
              ease: "power2.inOut",
            },
          );
        }

        if (index === 4) {
          gsap.fromTo(
            scene.querySelector(".cash-card"),
            { opacity: 0, x: 100, rotation: 10 },
            {
              opacity: 1,
              x: 0,
              rotation: 0,
              duration: 0.8,
              ease: "power3.out",
            },
          );
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const scenes = [
    { id: "hero", label: "Intro" },
    { id: "sender", label: "Send" },
    { id: "blockchain", label: "Secure" },
    { id: "claim", label: "Claim" },
    { id: "cashout", label: "Receive" },
    { id: "final", label: "Start" },
  ];

  return (
    <div ref={containerRef} className="relative bg-[#F5F5F5]">
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.6;
          }
        }
        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `}</style>

      {scenes.map((_, i) => (
        <FloatingParticle key={i} delay={i * 0.5} />
      ))}

      <div className="fixed top-6 left-6 z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-[#B91C1C] flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">AP</span>
          </div>
          <span className="font-bold text-xl text-[#111827]">AamaPay</span>
        </Link>
      </div>

      <div className="fixed top-6 right-6 z-50">
        <Link
          href="/send"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111827] text-white rounded-full font-medium text-sm hover:bg-[#1F2937] transition-all shadow-xl hover:shadow-2xl"
        >
          <Wallet className="w-4 h-4" />
          Get Started
        </Link>
      </div>

      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden lg:block">
        <div className="flex flex-col gap-3">
          {scenes.map((scene, index) => (
            <button
              key={scene.id}
              onClick={() => {
                containerRef.current
                  ?.querySelectorAll(".scene")
                  [index]?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`relative w-3 h-3 rounded-full transition-all duration-300 ${
                activeScene === index
                  ? "bg-[#B91C1C] scale-125"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            >
              {activeScene === index && (
                <span className="absolute inset-0 rounded-full bg-[#B91C1C]/30 animate-ping" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-white/80 backdrop-blur-md rounded-full px-6 py-3 shadow-xl border border-gray-100">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#6B7280]">Scene</span>
            <span className="font-bold text-[#111827]">{activeScene + 1}</span>
            <span className="text-[#6B7280]">of</span>
            <span className="font-bold text-[#111827]">{scenes.length}</span>
          </div>
        </div>
      </div>

      <section className="scene h-screen relative overflow-hidden">
        <div className="scene-content absolute inset-0 flex items-center justify-center">
          <Scene isActive={activeScene === 0}>
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-[#F5F5F5] via-white to-[#B91C1C]/5" />

              <div className="relative z-10 text-center max-w-5xl px-8">
                <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur rounded-full border border-gray-200 shadow-lg mb-8">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                  <span className="text-sm font-medium text-[#111827]">
                    Live on Solana Devnet
                  </span>
                </div>

                <h1 className="hero-title text-6xl md:text-8xl lg:text-9xl font-bold text-[#111827] leading-[0.95] tracking-tight mb-8">
                  Send Money
                  <br />
                  <span className="relative inline-block">
                    <span className="text-[#B91C1C]">Home</span>
                    <svg
                      className="absolute -bottom-3 left-0 w-full"
                      viewBox="0 0 300 12"
                      fill="none"
                    >
                      <path
                        d="M5 10C80 4 220 4 295 10"
                        stroke="#B91C1C"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>{" "}
                  Instantly
                </h1>

                <p className="text-xl md:text-2xl text-[#6B7280] max-w-2xl mx-auto mb-12 leading-relaxed">
                  Fast, secure, and affordable remittance powered by blockchain
                  technology
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/send"
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-[#B91C1C] text-white rounded-2xl font-semibold text-lg hover:bg-[#991B1B] transition-all shadow-2xl shadow-[#B91C1C]/25 hover:shadow-[#B91C1C]/40 hover:-translate-y-1"
                  >
                    Send Money
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/receive"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#111827] rounded-2xl font-semibold text-lg border-2 border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all hover:-translate-y-1"
                  >
                    <Sparkles className="w-5 h-5" />
                    Receive Money
                  </Link>
                </div>
              </div>

              <div className="absolute bottom-32 left-1/2 -translate-x-1/2 animate-bounce">
                <div className="w-8 h-12 border-2 border-gray-300 rounded-full flex justify-center pt-2">
                  <div className="w-1.5 h-3 bg-gray-300 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </Scene>
        </div>
      </section>

      <section className="scene min-h-screen relative overflow-hidden">
        <div className="scene-content absolute inset-0 flex items-center">
          <Scene isActive={activeScene === 1}>
            <div className="grid lg:grid-cols-2 gap-16 max-w-7xl mx-auto px-8 items-center">
              <div className="visual-card order-2 lg:order-1">
                <div className="relative">
                  <div className="w-80 h-96 mx-auto bg-gradient-to-br from-[#111827] to-[#1F2937] rounded-[2rem] p-6 shadow-2xl">
                    <div className="w-full h-12 bg-white/10 rounded-xl mb-4" />
                    <div className="text-white text-sm mb-6">
                      Sending to Nepal
                    </div>
                    <div className="space-y-3">
                      <div className="w-full h-14 bg-[#B91C1C]/20 rounded-xl flex items-center justify-center border border-[#B91C1C]/30">
                        <span className="text-2xl font-bold text-white">
                          100 SOL
                        </span>
                      </div>
                      <div className="w-full h-12 bg-white/10 rounded-xl flex items-center justify-center">
                        <span className="text-white/60 text-sm">SOLONA</span>
                      </div>
                    </div>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-20 bg-[#B91C1C] rounded-full flex items-center justify-center shadow-lg">
                      <Wallet className="w-10 h-10 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="scene-text order-1 lg:order-2">
                <span className="inline-block px-4 py-2 bg-[#B91C1C]/10 text-[#B91C1C] rounded-full text-sm font-medium mb-6">
                  Step 1
                </span>
                <h2 className="text-5xl md:text-6xl font-bold text-[#111827] mb-6 leading-tight">
                  Start from anywhere
                  <br />
                  <span className="text-[#B91C1C]">in the world</span>
                </h2>
                <p className="text-xl text-[#6B7280] max-w-lg leading-relaxed">
                  Connect your Phantom wallet and send SOLONA. No bank
                  transfers, no waiting days. Just fast, direct transactions.
                </p>
                <div className="mt-8 flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-[#16A34A]" />
                    <span className="text-[#6B7280]">Low fees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-[#16A34A]" />
                    <span className="text-[#6B7280]">Instant</span>
                  </div>
                </div>
              </div>
            </div>
          </Scene>
        </div>
      </section>

      <section className="scene min-h-screen relative overflow-hidden bg-gradient-to-br from-[#111827] to-[#1F2937]">
        <div className="scene-content absolute inset-0 flex items-center">
          <Scene isActive={activeScene === 2}>
            <div className="max-w-6xl mx-auto px-8 text-center">
              <div className="flex items-center justify-center gap-8 mb-16">
                <div className="w-24 h-24 rounded-2xl bg-[#B91C1C]/20 flex items-center justify-center backdrop-blur border border-[#B91C1C]/30">
                  <CreditCard className="w-12 h-12 text-[#B91C1C]" />
                </div>
                <div className="flex-1 max-w-md">
                  <div className="flow-line h-1.5 bg-gradient-to-r from-[#B91C1C] via-[#6366F1] to-[#16A34A] rounded-full" />
                </div>
                <div className="w-24 h-24 rounded-2xl bg-[#16A34A]/20 flex items-center justify-center backdrop-blur border border-[#16A34A]/30">
                  <Coins className="w-12 h-12 text-[#16A34A]" />
                </div>
              </div>

              <h2 className="text-5xl md:text-7xl font-bold text-white mb-8">
                Secured by
                <br />
                <span className="bg-gradient-to-r from-[#B91C1C] to-[#6366F1] bg-clip-text text-transparent">
                  On-Chain Escrow
                </span>
              </h2>

              <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
                Your funds are locked in a smart contract until the recipient
                confirms receipt. No intermediaries, no risk.
              </p>

              <div className="flex items-center justify-center gap-8">
                <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
                  <Shield className="w-8 h-8 text-[#16A34A] mx-auto mb-3" />
                  <p className="text-white font-medium">Tamper-proof</p>
                </div>
                <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
                  <Zap className="w-8 h-8 text-[#6366F1] mx-auto mb-3" />
                  <p className="text-white font-medium">Automated</p>
                </div>
                <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
                  <Globe className="w-8 h-8 text-[#B91C1C] mx-auto mb-3" />
                  <p className="text-white font-medium">Global</p>
                </div>
              </div>
            </div>
          </Scene>
        </div>
      </section>

      <section className="scene min-h-screen relative overflow-hidden">
        <div className="scene-content absolute inset-0 flex items-center">
          <Scene isActive={activeScene === 3}>
            <div className="grid lg:grid-cols-2 gap-16 max-w-7xl mx-auto px-8 items-center">
              <div>
                <span className="inline-block px-4 py-2 bg-[#6366F1]/10 text-[#6366F1] rounded-full text-sm font-medium mb-6">
                  Step 2
                </span>
                <h2 className="text-5xl md:text-6xl font-bold text-[#111827] mb-6 leading-tight">
                  Simple claim code,
                  <br />
                  <span className="text-[#6366F1]">no bank required</span>
                </h2>
                <p className="text-xl text-[#6B7280] max-w-lg leading-relaxed">
                  Share a secure claim code with your recipient. They can
                  withdraw from any verified AamaPay agent nearby. No app
                  download needed.
                </p>
              </div>
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-72 h-72 bg-white rounded-3xl shadow-2xl border-4 border-gray-100 flex items-center justify-center overflow-hidden">
                    <div className="grid grid-cols-10 gap-0.5 p-6">
                      {[...Array(100)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-sm ${Math.random() > 0.4 ? "bg-[#111827]" : "bg-gray-200"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-[#6366F1] text-white px-6 py-3 rounded-full font-mono font-bold text-lg shadow-lg">
                    AAP7XK2M9QL
                  </div>
                </div>
              </div>
            </div>
          </Scene>
        </div>
      </section>

      <section className="scene min-h-screen relative overflow-hidden bg-gradient-to-br from-[#16A34A]/5 to-[#15803D]/10">
        <div className="scene-content absolute inset-0 flex items-center">
          <Scene isActive={activeScene === 4}>
            <div className="grid lg:grid-cols-2 gap-16 max-w-7xl mx-auto px-8 items-center">
              <div className="cash-card order-2 lg:order-2 flex justify-center">
                <div className="relative">
                  <div className="w-80 h-[450px] bg-gradient-to-br from-[#16A34A]/10 to-[#16A34A]/5 rounded-[2rem] p-6 border border-[#16A34A]/20">
                    <div className="w-full h-48 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-6">
                      <div className="text-center">
                        <Handshake className="w-16 h-16 text-[#B91C1C]" />
                        <p className="mt-2 text-sm text-[#6B7280]">
                          Agent confirmed
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-[#111827] text-lg">
                        Cash Ready!
                      </p>
                      <p className="text-sm text-[#6B7280] mb-4">
                        Kathmandu, Nepal
                      </p>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#16A34A] text-white rounded-full text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Verified Agent
                      </div>
                    </div>
                  </div>
                  <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center">
                    <CreditCard className="w-8 h-8" />
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-1">
                <span className="inline-block px-4 py-2 bg-[#16A34A]/10 text-[#16A34A] rounded-full text-sm font-medium mb-6">
                  Step 3
                </span>
                <h2 className="text-5xl md:text-6xl font-bold text-[#111827] mb-6 leading-tight">
                  Withdraw instantly
                  <br />
                  <span className="text-[#16A34A]">through local agents</span>
                </h2>
                <p className="text-xl text-[#6B7280] max-w-lg leading-relaxed">
                  Your family visits any verified AamaPay agent with the claim
                  code. Cash in hand within minutes. Zero bank visits needed.
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {["KTM", "PKR", "BIR"].map((c, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-[#16A34A] to-[#15803D] border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-[#6B7280]">
                    500+ agents across Nepal
                  </span>
                </div>
              </div>
            </div>
          </Scene>
        </div>
      </section>

      <section className="scene min-h-screen relative overflow-hidden">
        <div className="scene-content absolute inset-0 flex items-center justify-center">
          <Scene isActive={activeScene === 5}>
            <div className="text-center max-w-4xl px-8">
              <h2 className="text-6xl md:text-8xl lg:text-9xl font-bold text-[#111827] mb-8 leading-[0.95] tracking-tight">
                Remittance,
                <br />
                <span className="text-[#B91C1C]">reimagined.</span>
              </h2>

              <p className="text-xl md:text-2xl text-[#6B7280] max-w-2xl mx-auto mb-12">
                Send money to Nepal in seconds. Your family receives cash
                instantly. No banks, no fees, no hassle.
              </p>

              <div className="cta-group flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/send"
                  className="group inline-flex items-center gap-3 px-10 py-5 bg-[#B91C1C] text-white rounded-2xl font-bold text-xl hover:bg-[#991B1B] transition-all shadow-2xl shadow-[#B91C1C]/30 hover:shadow-[#B91C1C]/50 hover:-translate-y-1"
                >
                  Start Sending
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/receive"
                  className="inline-flex items-center gap-3 px-10 py-5 bg-white text-[#111827] rounded-2xl font-bold text-xl border-2 border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <Users className="w-6 h-6" />
                  Become an Agent
                </Link>
              </div>

              <div className="mt-16 flex items-center justify-center gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#111827]">2M+ SOL</p>
                  <p className="text-sm text-[#6B7280]">Transferred</p>
                </div>
                <div className="w-px h-12 bg-gray-200" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#111827]">15k+</p>
                  <p className="text-sm text-[#6B7280]">Happy Families</p>
                </div>
                <div className="w-px h-12 bg-gray-200" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#111827]">500+</p>
                  <p className="text-sm text-[#6B7280]">Active Agents</p>
                </div>
              </div>
            </div>
          </Scene>
        </div>
      </section>
    </div>
  );
}
