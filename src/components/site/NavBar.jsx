import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Github, Terminal } from "lucide-react";

const GITHUB_URL = "https://github.com/base44";

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div
        className={`transition-all duration-300 border-b ${
          scrolled
            ? "bg-[#080808]/85 backdrop-blur-md border-[#1A1A1E]"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="mx-auto max-w-[1600px] px-6 lg:px-10 h-14 flex items-center justify-between">
          {/* Logo / status */}
          <a href="#top" className="flex items-center gap-3 group">
            <span className="font-mono-display text-sm font-semibold tracking-tight text-[#F2F2F2]">
              BASE<span className="text-[#3DFFAC]">44</span>
            </span>
            <span className="hidden sm:flex items-center gap-2 text-[11px] font-mono-display text-[#555]">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#3DFFAC] animate-pulse" />
              v1.0.0 · main
            </span>
          </a>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8 text-[13px] font-mono-display text-[#888]">
            <a href="#repositories" className="hover:text-[#F2F2F2] transition-colors">repositories</a>
            <a href="#about" className="hover:text-[#F2F2F2] transition-colors">about</a>
            <a href="#contact" className="hover:text-[#F2F2F2] transition-colors">contact</a>
          </nav>

          {/* View source */}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2 rounded-sm border border-[#1A1A1E] hover:border-[#3DFFAC] hover:bg-[#3DFFAC]/5 px-3 h-8 transition-all"
          >
            <Github className="w-3.5 h-3.5 text-[#888] group-hover:text-[#3DFFAC] transition-colors" />
            <span className="text-[11px] font-mono-display text-[#888] group-hover:text-[#3DFFAC] transition-colors">
              view source
            </span>
            <Terminal className="hidden sm:block w-3.5 h-3.5 text-[#555] group-hover:text-[#3DFFAC] transition-colors" />
          </a>
        </div>
      </div>
    </motion.header>
  );
}