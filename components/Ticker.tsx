"use client";

export default function Ticker() {
  const text =
    "OPEN TO OPPORTUNITIES ✦ NUS CS 2025 ✦ BRAINHACK TIL-AI 2026 ✦ SINGAPORE ✦ ";

  return (
    <div className="w-[340px] overflow-hidden whitespace-nowrap text-[10px] tracking-[0.1em] text-white/30">
      <div className="ticker-track inline-block">
        <span>{text}</span>
        <span>{text}</span>
      </div>
    </div>
  );
}
