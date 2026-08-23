import React from "react";
import { motion } from "framer-motion";
import { Image } from "@/components/ui/image";

const STATS = [
  { value: "128", label: "contributors" },
  { value: "7.8k", label: "stars across repos" },
  { value: "100%", label: "open source" },
  { value: "0", label: "closed-door commits" },
];

export default function About() {
  return (
    <section id="about" className="relative py-24 lg:py-32 border-t border-[#1A1A1E] overflow-hidden">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5"
          >
            <div className="relative rounded-sm border border-[#1A1A1E] overflow-hidden aspect-[4/3]">
              <Image
                src="https://media.base44.com/images/public/6a8a4546d073e6f168ac366b/476f5f4a3_generated_b1188308.png"
                alt="Light refraction through architectural glass"
                className="w-full h-full"
                fittingType="fill"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/60 to-transparent" />
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7"
          >
            <span className="text-[11px] font-mono-display tracking-[0.2em] text-[#3DFFAC] uppercase">
              // the collective
            </span>
            <h2 className="mt-3 font-mono-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#F2F2F2] text-balance">
              Transparency, compiled into infrastructure.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[#888] max-w-xl">
              Base44 is an open-source collective engineering developer tooling with
              industrial precision. We treat every commit as a public artifact —
              auditable, durable, and built to be read. No black boxes. No
              closed-door commits.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-[#888] max-w-xl">
              Our work spans runtime engines, realtime sync layers, and the UI
              systems that frame code as a living work of art.
            </p>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#1A1A1E] border border-[#1A1A1E] rounded-sm overflow-hidden">
              {STATS.map((s) => (
                <div key={s.label} className="bg-[#0c0c0e] p-5">
                  <div className="font-mono-display text-2xl font-semibold text-[#3DFFAC]">
                    {s.value}
                  </div>
                  <div className="mt-1 text-[11px] font-mono-display text-[#888] uppercase tracking-wider">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}