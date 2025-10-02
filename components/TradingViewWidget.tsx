import React, { useEffect, useRef } from "react";

export default function TradingViewWidget({ symbol = "COINBASE:SOLUSD", height = 400 }) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Unique container id for each widget instance
  const containerId = useRef(`tradingview-widget-container-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      if (window.TradingView) {
        // @ts-ignore
        new window.TradingView.widget({
          autosize: true,
          symbol,
          interval: "1",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#222",
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: containerId.current,
        });
      }
    };
    containerRef.current.appendChild(script);
    // Cleanup
    return () => { containerRef.current.innerHTML = ""; };
  }, [symbol]);

  return (
    <div
      ref={containerRef}
      id={containerId.current}
      style={{ width: "100%", height }}
    />
  );
}
