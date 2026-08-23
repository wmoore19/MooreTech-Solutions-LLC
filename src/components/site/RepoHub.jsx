import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Star, GitFork, Clock, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";

const GITHUB_URL = "https://github.com/base44";

// Sample repository data — will populate live once the GitHub connector is authorized.
const REPOS = [
  {
    name: "base44-core",
    description: "The foundational runtime. Event-driven, durable, horizontally scalable.",
    language: "TypeScript",
    stars: 2840,
    forks: 312,
    lastCommit: "2h ago",
    readme: "// base44-core\nThe foundational runtime engine.\nHandles durable workflows, entity storage, and realtime subscriptions.",
  },
  {
    name: "monolith-grid",
    description: "A modular 12-column UI system for industrial-grade developer interfaces.",
    language: "React",
    stars: 1342,
    forks: 88,
    lastCommit: "5h ago",
    readme: "// monolith-grid\nHigh-contrast, data-stream bordered layout system.\nBuilt for dashboards that frame code as art.",
  },
  {
    name: "kinetic-repository",
    description: "Live GitHub activity renderer with magnetic hover and code-preview overlays.",
    language: "TypeScript",
    stars: 921,
    forks: 47,
    lastCommit: "1d ago",
    readme: "// kinetic-repository\nRenders live repo metadata as a horizontal gallery.\nReal-time star, fork, and commit signals.",
  },
  {
    name: "pulse-engine",
    description: "Realtime subscription layer over WebSockets with optimistic entity sync.",
    language: "Go",
    stars: 1677,
    forks: 134,
    lastCommit: "3d ago",
    readme: "// pulse-engine\nLow-latency realtime sync.\nOptimistic updates with conflict resolution.",
  },
  {
    name: "obsidian-ui",
    description: "Headless component primitives tuned for the High-Voltage Graphite palette.",
    language: "React",
    stars: 654,
    forks: 29,
    lastCommit: "6h ago",
    readme: "// obsidian-ui\nHeadless primitives, AAA-contrast by default.\nObsidian + electric mint design tokens.",
  },
  {
    name: "data-stream",
    description: "1px reactive border system that responds to hover and focus states.",
    language: "CSS",
    stars: 412,
    forks: 18,
    lastCommit: "12h ago",
    readme: "// data-stream\nReactive 1px borders.\nHover states animate along the data-stream.",
  },
];

const LANG_COLOR = {
  TypeScript: "#3DFFAC",
  React: "#3DFFAC",
  Go: "#3DFFAC",
  CSS: "#3DFFAC",
};

export default function RepoHub() {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 420, behavior: "smooth" });
  };

  return (
    <section id="repositories" className="relative py-24 lg:py-32 border-t border-[#1A1A1E]">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-[11px] font-mono-display tracking-[0.2em] text-[#3DFFAC] uppercase">
              // live pulse
            </span>
            <h2 className="mt-3 font-mono-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#F2F2F2]">
              Repository Hub
            </h2>
            <p className="mt-4 max-w-lg text-[#888] leading-relaxed">
              A full-bleed gallery of our open-source work. Real-time star counts,
              fork counts, and last-commit timestamps — straight from the source.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => scroll(-1)}
              className="w-10 h-10 rounded-sm border border-[#1A1A1E] hover:border-[#3DFFAC] flex items-center justify-center text-[#888] hover:text-[#3DFFAC] transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll(1)}
              className="w-10 h-10 rounded-sm border border-[#1A1A1E] hover:border-[#3DFFAC] flex items-center justify-center text-[#888] hover:text-[#3DFFAC] transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal gallery */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-6 px-6 lg:px-10 scroll-pl-6 lg:scroll-pl-10 snap-x mask-fade-r"
        style={{ scrollbarWidth: "thin" }}
      >
        {REPOS.map((repo, i) => (
          <RepoCard key={repo.name} repo={repo} index={i} />
        ))}
        {/* View all card */}
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="snap-start shrink-0 w-[300px] sm:w-[360px] min-h-[260px] rounded-sm border border-dashed border-[#1A1A1E] hover:border-[#3DFFAC] flex flex-col items-center justify-center gap-4 text-[#888] hover:text-[#3DFFAC] transition-all group"
        >
          <ArrowUpRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="font-mono-display text-sm">view all on github</span>
        </a>
      </div>
    </section>
  );
}

function RepoCard({ repo, index }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <motion.a
      href={`${GITHUB_URL}/${repo.name}`}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="snap-start shrink-0 w-[300px] sm:w-[360px] rounded-sm border border-[#1A1A1E] bg-[#0c0c0e] hover:bg-[#101013] hover:border-[#3DFFAC]/40 transition-all duration-300 overflow-hidden group relative"
      style={{ transform: hovered ? "translateY(-6px)" : "translateY(0)" }}
    >
      <div className="p-5 flex flex-col h-full min-h-[260px]">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: LANG_COLOR[repo.language] }} />
            <h3 className="font-mono-display text-base font-medium text-[#F2F2F2] group-hover:text-[#3DFFAC] transition-colors">
              {repo.name}
            </h3>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#555] group-hover:text-[#3DFFAC] transition-colors" />
        </div>

        <p className="text-[13px] text-[#888] leading-relaxed mb-5 flex-1">
          {repo.description}
        </p>

        {/* Code preview overlay */}
        <motion.div
          animate={{ height: hovered ? "auto" : 0, opacity: hovered ? 1 : 0 }}
          className="overflow-hidden mb-4"
        >
          <pre className="text-[11px] font-mono-display text-[#555] bg-[#080808] border border-[#1A1A1E] rounded-sm p-3 leading-relaxed whitespace-pre-wrap">
            {repo.readme}
          </pre>
        </motion.div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-[11px] font-mono-display text-[#888] pt-3 border-t border-[#1A1A1E]">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3" /> {repo.stars.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="w-3 h-3" /> {repo.forks}
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <Clock className="w-3 h-3" /> {repo.lastCommit}
          </span>
        </div>
      </div>
    </motion.a>
  );
}