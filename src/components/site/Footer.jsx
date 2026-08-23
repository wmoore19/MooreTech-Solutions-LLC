import React from "react";
import { Github, Mail, ArrowUp } from "lucide-react";

const GITHUB_URL = "https://github.com/base44";
const CONTACT_EMAIL = "hello@base44.com";

export default function Footer() {
  return (
    <footer className="relative border-t border-[#1A1A1E] py-12">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {/* Brand */}
          <div>
            <div className="font-mono-display text-lg font-semibold tracking-tight text-[#F2F2F2]">
              BASE<span className="text-[#3DFFAC]">44</span>
            </div>
            <p className="mt-3 text-[13px] text-[#888] leading-relaxed max-w-xs">
              Building the core. Open-source infrastructure, compiled with
              industrial precision.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2 md:items-center">
            <span className="text-[11px] font-mono-display text-[#555] uppercase tracking-wider mb-1">
              navigate
            </span>
            <a href="#repositories" className="text-[13px] text-[#888] hover:text-[#3DFFAC] transition-colors">repositories</a>
            <a href="#about" className="text-[13px] text-[#888] hover:text-[#3DFFAC] transition-colors">about</a>
            <a href="#contact" className="text-[13px] text-[#888] hover:text-[#3DFFAC] transition-colors">contact</a>
          </div>

          {/* Connect */}
          <div className="flex flex-col gap-2 md:items-end">
            <span className="text-[11px] font-mono-display text-[#555] uppercase tracking-wider mb-1">
              connect
            </span>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[13px] text-[#888] hover:text-[#3DFFAC] transition-colors">
              <Github className="w-3.5 h-3.5" /> github.com/base44
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-2 text-[13px] text-[#888] hover:text-[#3DFFAC] transition-colors">
              <Mail className="w-3.5 h-3.5" /> {CONTACT_EMAIL}
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-[#1A1A1E] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] font-mono-display text-[#555]">
            © {new Date().getFullYear()} base44 · MIT license · built open-source
          </p>
          <a href="#top" className="flex items-center gap-2 text-[11px] font-mono-display text-[#555] hover:text-[#3DFFAC] transition-colors">
            back to top
            <ArrowUp className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}