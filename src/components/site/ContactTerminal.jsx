import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Github, MapPin, Send } from "lucide-react";
import { Image } from "@/components/ui/image";

const GITHUB_URL = "https://github.com/base44";
const CONTACT_EMAIL = "hello@base44.com";

export default function ContactTerminal() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setMessage(`> connection.initiated → ${email}`);
    setTimeout(() => {
      setMessage(`> status: delivered. we'll respond within 24h.`);
    }, 900);
  };

  return (
    <section id="contact" className="relative py-24 lg:py-32 border-t border-[#1A1A1E] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 opacity-25">
        <Image
          src="https://media.base44.com/images/public/6a8a4546d073e6f168ac366b/0bab38323_generated_70ac6787.png"
          alt="Industrial switch in low light"
          className="w-full h-full object-cover"
          fittingType="fill"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080808] via-[#080808]/85 to-[#080808]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1600px] px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Left: info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5"
          >
            <span className="text-[11px] font-mono-display tracking-[0.2em] text-[#3DFFAC] uppercase">
              // command line
            </span>
            <h2 className="mt-3 font-mono-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#F2F2F2] text-balance">
              Initiate contact.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[#888] max-w-md">
              Drop your email and we'll open a channel. For everything else, the
              direct lines are below.
            </p>

            <div className="mt-10 space-y-px bg-[#1A1A1E] border border-[#1A1A1E] rounded-sm overflow-hidden">
              <ContactRow
                icon={<Mail className="w-4 h-4" />}
                label="email"
                value={CONTACT_EMAIL}
                href={`mailto:${CONTACT_EMAIL}`}
              />
              <ContactRow
                icon={<Github className="w-4 h-4" />}
                label="github"
                value="github.com/base44"
                href={GITHUB_URL}
              />
              <ContactRow
                icon={<MapPin className="w-4 h-4" />}
                label="location"
                value="Distributed · Remote"
              />
            </div>
          </motion.div>

          {/* Right: terminal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-7"
          >
            <div className="rounded-sm border border-[#1A1A1E] bg-[#0c0c0e] overflow-hidden">
              <div className="flex items-center gap-2 px-4 h-9 border-b border-[#1A1A1E]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1A1A1E]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#1A1A1E]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#1A1A1E]" />
                <span className="ml-2 text-[11px] font-mono-display text-[#555]">
                  base44@contact: ~
                </span>
              </div>

              <div className="p-6 font-mono-display text-sm min-h-[260px] flex flex-col">
                <div className="text-[#555] mb-4 leading-relaxed">
                  <span className="text-[#3DFFAC]">$</span> ./initiate-contact --channel=inbound
                  {"\n"}
                  <span className="text-[#555]">→ awaiting email input...</span>
                </div>

                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                  <span className="text-[#3DFFAC] shrink-0">$</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setSubmitted(false);
                      setMessage("");
                    }}
                    placeholder="enter your email to initiate contact..."
                    className="flex-1 bg-transparent border-none outline-none text-[#F2F2F2] placeholder:text-[#555] font-mono-display text-sm caret-[#3DFFAC]"
                  />
                  <button
                    type="submit"
                    className="shrink-0 flex items-center gap-1.5 text-[#888] hover:text-[#3DFFAC] transition-colors text-[11px]"
                  >
                    execute
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

                <AnimatePresence>
                  {message && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 leading-relaxed"
                    >
                      <span className={submitted ? "text-[#3DFFAC]" : "text-[#888]"}>
                        {message}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {submitted && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="mt-auto pt-6 text-[11px] text-[#555]"
                  >
                    <span className="text-[#3DFFAC]">✓</span> connection established · session id:{" "}
                    <span className="text-[#888]">{Math.random().toString(36).slice(2, 10)}</span>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ContactRow({ icon, label, value, href }) {
  const content = (
    <div className="bg-[#0c0c0e] p-4 flex items-center gap-4 hover:bg-[#101013] transition-colors">
      <span className="text-[#3DFFAC]">{icon}</span>
      <span className="text-[11px] font-mono-display text-[#555] uppercase tracking-wider w-16 shrink-0">
        {label}
      </span>
      <span className="font-mono-display text-sm text-[#F2F2F2] group-hover:text-[#3DFFAC] transition-colors">
        {value}
      </span>
    </div>
  );
  if (href) {
    return (
      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="group block">
        {content}
      </a>
    );
  }
  return content;
}