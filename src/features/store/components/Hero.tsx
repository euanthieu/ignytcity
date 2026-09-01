"use client";

import { useRef, useState } from "react";

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    if (!video.muted) {
      video.play().catch(() => {});
    }
  };

  return (
    <section
      id="top"
      className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-[#24170f]"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover object-top"
        src="/ignyt-city-hero.mp4"
        poster="/products/washed-ignyt-tour-back.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(20,13,9,0.88) 0%, rgba(20,13,9,0.55) 40%, rgba(20,13,9,0.45) 65%, rgba(20,13,9,0.7) 100%)",
        }}
      />

      <button
        onClick={toggleMute}
        className="absolute top-[76px] right-5 sm:right-8 z-10 ic-mono text-[10px] border border-[#ffffff]/60 text-[#ffffff] px-4 py-2 hover:bg-[#ffffff] hover:text-[#24170f] transition-colors"
      >
        {muted ? "Unmute" : "Mute"}
      </button>

      <div className="relative z-10 h-full flex flex-col items-center justify-start text-center px-5 pt-32 sm:pt-40">
        <p className="ic-mono text-[10px] tracking-[3px] text-[#ffffff]/70 mb-4">
          Pre-Order Merch &middot; Pick Up Sun Sept 6 &middot; Wear It Sept 11
        </p>
        <h1 className="ic-display text-[#ffffff] text-[42px] leading-[1.05] tracking-[2px] sm:text-[68px] sm:leading-[1.02] sm:tracking-[6px] max-w-4xl">
          Where Darkness
          <br />
          Has to End
        </h1>
        <p className="ic-mono text-[11px] tracking-[1px] normal-case text-[#ffffff]/80 mt-6 max-w-md">
          Four graphic tees. One generation lighting the way. Reserve yours
          before the drop closes.
        </p>
        <a
          href="#drop"
          className="mt-8 border border-[#ffffff] text-[#ffffff] ic-mono text-[12px] px-10 py-[17px] hover:bg-[#ffffff] hover:text-[#24170f] transition-colors"
        >
          Shop the Drop
        </a>
      </div>
    </section>
  );
}
