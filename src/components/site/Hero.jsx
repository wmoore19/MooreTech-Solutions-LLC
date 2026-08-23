import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowDown, Github } from "lucide-react";
import { Image } from "@/components/ui/image";

const GITHUB_URL = "https://github.com/base44";

const CODE_LINES = [
  { t: "import", c: "#3DFFAC" },
  { t: " { build } ", c: "#F2F2F2" },
  { t: "from", c: "#3DFFAC" },
  { t: " 'base44/core'", c: "#888" },
];

export default function Hero() {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const full = "BUILDING THE CORE.";
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(full.slice(0, i));
      if (i >= full.length) clearInterval(id);
    }, 55);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="top" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://media.base44.com/images/public/6a8a4546d073e6f168ac366b/12edae89e_generated_929e0092.png"
          alt="Macro circuit board"
          className="w-full h-full object-cover"
          fittingType="fill"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/80 via-[#080808]/85 to-[#080808]" />
        <div className="absolute inset-0 grid-lines opacity-40" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[1600px] w-full px-6 lg:px-10 pt-24 pb-16">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Headline */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 mb-8"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-[#3DFFAC] animate-pulse" />
              <span className="text-[11px] font-mono-display tracking-[0.2em] text-[#888] uppercase">
                system online · accepting contributions
              </span>
            </motion.div>

            <h1 className="font-mono-display text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight text-[#F2F2F2] text-balance">
              {typed}
              <span className="inline-block w-[0.5em] h-[0.9em] -mb-1 ml-1 bg-[#3DFFAC] animate-pulse" />
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="mt-8 max-w-xl text-lg leading-relaxed text-[#888]"
            >
              A high-fidelity interface bridging raw source code and human-centric
              design. We engineer open-source infrastructure with absolute
              transparency — every commit, live.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <a
                href="#repositories"
                className="group flex items-center gap-2 bg-[#3DFFAC] text-[#080808] font-mono-display text-sm font-medium px-5 h-11 rounded-sm hover:bg-[#3DFFAC]/90 transition-all glow-mint"
              >
                explore repositories
                <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </a>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 border border-[#1A1A1E] hover:border-[#3DFFAC] text-[#F2F2F2] font-mono-display text-sm px-5 h-11 rounded-sm transition-all"
              >
                <Github className="w-4 h-4" />
                github.com/base44
              </a>
            </motion.div>
          </div>

          {/* Code-logo terminal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="lg:col-span-5"
          >
            <div className="rounded-sm border border-[#1A1A1E] bg-[#0c0c0e]/90 backdrop-blur-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 h-9 border-b border-[#1A1A1E]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1A1A1E]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#1A1A1E]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#1A1A1E]" />
                <span className="ml-2 text-[11px] font-mono-display text-[#555]">
                  core/build.ts — main
                </span>
              </div>
              <pre className="p-5 text-[13px] leading-relaxed font-mono-display overflow-x-auto">
                <CodeBlock />
              </pre>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-[#555]"
      >
        <span className="text-[10px] font-mono-display tracking-[0.3em] uppercase">scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function CodeBlock() {
  return (
    <code className="text-[#888]">
      <span className="text-[#555]">{"// live from main branch"}</span>
      {"\n"}
      {CODE_LINES.map((l, i) => (
        <span key={i} style={{ color: l.c }}>{l.t}</span>
      ))}
      {"\n\n"}
      <span className="text-[#3DFFAC]">{"export const "}</span>
      <span className="text-[#F2F2F2]">{"core "}</span>
      <span className="text-[#3DFFAC]">{"= "}</span>
      <span className="text-[#F2F2F2]">{"build({"}</span>
      {"\n  "}
      <span className="text-[#888]">{'name: "base44",'}</span>
      {"\n  "}
      <span className="text-[#888]">{"status: "}</span>
      <span className="text-[#3DFFAC]">{"'compiling'"}</span>
      <span className="text-[#F2F2F2]">{","}</span>
      {"\n  "}
      <span className="text-[#888]">{"contributors: 128,"}</span>
      {"\n  "}
      <span className="text-[#888]">{"stars: "}</span>
      <span className="text-[#3DFFAC]">{"∞"}</span>
      <span className="text-[#F2F2F2]">{","}</span>
      {"\n"}
      <span className="text-[#F2F2F2]">{"})"}</span>
      <span className="text-[#3DFFAC]">{"\n\n// → compiled. 0 errors."}</span>
    </code>
  );
}