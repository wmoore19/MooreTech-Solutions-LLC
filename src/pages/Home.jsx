import React from "react";
import NavBar from "@/components/site/NavBar";
import Hero from "@/components/site/Hero";
import RepoHub from "@/components/site/RepoHub";
import About from "@/components/site/About";
import ContactTerminal from "@/components/site/ContactTerminal";
import Footer from "@/components/site/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#080808] text-[#F2F2F2]">
      <NavBar />
      <main>
        <Hero />
        <RepoHub />
        <About />
        <ContactTerminal />
      </main>
      <Footer />
    </div>
  );
}