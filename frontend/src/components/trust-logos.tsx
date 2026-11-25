"use client";

import React from "react";
import Slider, { Settings } from "react-slick";
import "slick-carousel/slick/slick.css";
import CompanyLogo from "./company-logo";

const companies = [
  "Google",
  "Microsoft",
  "Amazon",
  "Meta",
  "Apple",
  "Netflix",
  "Adobe",
  "Salesforce",
  "Infosys",
  "TCS",
  "Wipro",
  "Flipkart",
  "Swiggy",
  "Zomato",
  "Razorpay",
  "Paytm",
  "Nexora Labs",
  "Quantum Byte",
  "Verdant Cloud",
  "Orbit Finance",
  "Pixel Forge",
  "Skyline Health",
];

// Continuous "ticker" scroll: autoplaySpeed 0 starts the next slide as soon
// as the previous one finishes, and a linear ease over `speed` ms keeps the
// motion constant instead of the default step-and-pause carousel feel.
const settings: Settings = {
  infinite: true,
  autoplay: true,
  autoplaySpeed: 0,
  speed: 3000,
  cssEase: "linear",
  slidesToShow: 6,
  slidesToScroll: 1,
  arrows: false,
  dots: false,
  pauseOnHover: true,
  swipe: false,
  draggable: false,
  responsive: [
    { breakpoint: 1280, settings: { slidesToShow: 5 } },
    { breakpoint: 1024, settings: { slidesToShow: 4 } },
    { breakpoint: 768, settings: { slidesToShow: 3 } },
    { breakpoint: 480, settings: { slidesToShow: 2 } },
  ],
};

const TrustLogos = () => {
  return (
    <section className="py-10 border-y bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-center text-sm font-medium opacity-60 mb-6">
          Trusted by hiring teams at fast-growing companies
        </p>

        <div className="relative">
          {/* Edge fades so logos glide in and out instead of being cut off */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-24 z-10 bg-linear-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-24 z-10 bg-linear-to-l from-background to-transparent" />

          <Slider {...settings}>
            {companies.map((name) => (
              <div key={name} className="px-3">
                <div className="flex items-center justify-center gap-2.5 py-1 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all">
                  <CompanyLogo name={name} className="size-8 rounded-md text-sm" />
                  <span className="text-sm font-semibold whitespace-nowrap">
                    {name}
                  </span>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};

export default TrustLogos;
