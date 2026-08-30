"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Github, Code2, Box, Rocket, Shield } from "lucide-react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  if (!mounted) {
    return <div className="min-h-screen w-full bg-[var(--background-primary)]" />;
  }

  const features = [
    {
      icon: <Box className="w-6 h-6 text-sky-500" />,
      title: "FAOS Architecture",
      desc: "Feature-Oriented Architecture Structure. Strict boundaries, high cohesion, low coupling."
    },
    {
      icon: <Rocket className="w-6 h-6 text-rose-500" />,
      title: "AWS ECR Ready",
      desc: "Optimized multi-stage Dockerfile and GitHub Actions OIDC pipeline included."
    },
    {
      icon: <Shield className="w-6 h-6 text-emerald-500" />,
      title: "Type-Safe Everything",
      desc: "End-to-end type safety with TypeScript, Zod environment validation, and strict ESLint rules."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background-primary)] text-[var(--text-primary)] transition-colors duration-300">
      <nav className="border-b border-[var(--border-default)] bg-[var(--background-elevated)] bg-opacity-80 backdrop-blur-md sticky top-0 z-50 h-16 flex items-center">
        <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-xl tracking-tight">
            <Code2 className="w-6 h-6 text-[var(--brand-core)]" />
            <span>Next<span className="text-[var(--brand-core)]">Template</span></span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl border border-[var(--border-default)] bg-[var(--background-tertiary)] hover:bg-[var(--background-secondary)] transition-colors"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl border border-[var(--border-default)] bg-[var(--background-tertiary)] hover:bg-[var(--background-secondary)] transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-20 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--brand-core)]/10 text-[var(--brand-core)] font-bold text-xs mb-8 border border-[var(--brand-core)]/20">
          <span className="w-2 h-2 rounded-full bg-[var(--brand-core)] animate-pulse" />
          Production Ready Template
        </div>
        
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6 leading-tight">
          Start Building <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-core)] to-indigo-500">
            Faster & Cleaner
          </span>
        </h1>
        
        <p className="text-lg sm:text-xl font-medium text-[var(--text-secondary)] max-w-2xl mb-12 leading-relaxed">
          A generic, highly scalable Next.js 15 starter kit implementing the Feature-Oriented Architecture Structure (FAOS). Clean slate. Ready to deploy.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-24">
          <button className="px-8 py-4 rounded-xl font-bold text-white bg-[var(--brand-core)] hover:opacity-90 transition-opacity shadow-lg flex items-center gap-2">
            Get Started <Rocket className="w-4 h-4" />
          </button>
          <a href="#" className="px-8 py-4 rounded-xl font-bold border border-[var(--border-default)] bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] transition-colors">
            Read the Docs
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-6 w-full text-left">
          {features.map((f, i) => (
            <div key={i} className="p-6 rounded-2xl border border-[var(--border-light)] bg-[var(--background-elevated)] shadow-xl hover:shadow-2xl transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[var(--background-secondary)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-xl font-black mb-2">{f.title}</h3>
              <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-[var(--border-light)] py-8 text-center text-sm font-medium text-[var(--text-tertiary)]">
        &copy; {new Date().getFullYear()} Next.js Enterprise Template. All rights reserved.
      </footer>
    </div>
  );
}
