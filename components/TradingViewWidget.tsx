import React, { useEffect, useRef } from "react";

export default function TradingViewWidget({ symbol = "COINBASE:SOLUSD", height = 400 }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    // Remove previous widget if any
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
          container_id: containerRef.current.id,
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
      id="tradingview-widget-container"
      style={{ width: "100%", height }}
    />
  );
}
