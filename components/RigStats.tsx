import React from "react";

export type RigStatsProps = {
  availability: number;
  hashrate: string;
  earnings: string;
  topPool?: string;
};

export default function RigStats({ availability, hashrate, earnings, topPool }: RigStatsProps) {
  return (
    <div
      className="rounded-b-xl border-l-4 p-4 text-sm"
      style={{
        background: "rgba(0,255,178,0.05)",
        borderColor: "#00ffb2",
      }}
    >
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="flex items-center gap-2 text-[#e0e0e0]">
          <span>✅ Availability:</span>
          <span className="font-semibold text-green-400">{availability} rigs online</span>
        </div>
        <div className="flex items-center gap-2 text-[#e0e0e0]">
          <span>⚡ Avg Hashrate:</span>
          <span className="font-semibold text-[#00ffb2]">{hashrate}</span>
        </div>
        <div className="flex items-center gap-2 text-[#e0e0e0]">
          <span>💰 Earnings/Day:</span>
          <span className="font-semibold">{earnings}</span>
        </div>
        {topPool && (
          <div className="flex items-center gap-2 text-[#e0e0e0]">
            <span>🌐 Top Pool:</span>
            <span className="font-semibold">{topPool}</span>
          </div>
        )}
      </div>
    </div>
  );
}
