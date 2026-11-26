"use client";
import CarrerGuide from "@/components/carrer-guide";
import CtaBand from "@/components/cta-band";
import Features from "@/components/features";
import Hero from "@/components/hero";
import HowItWorks from "@/components/how-it-works";
import ResumeAnalyzer from "@/components/resume-analyser";
import Testimonials from "@/components/testimonials";
import TrustLogos from "@/components/trust-logos";
import React from "react";

const Home = () => {
  // The landing page doesn't depend on who is logged in, so render it right
  // away instead of waiting for the user lookup (which can take a while
  // when the backend is waking up from a cold start).
  return (
    <div>
      <Hero />
      <TrustLogos />
      <Features />
      <HowItWorks />
      <CarrerGuide />
      <ResumeAnalyzer />
      <Testimonials />
      <CtaBand />
    </div>
  );
};

export default Home;
