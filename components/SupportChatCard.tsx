import React, { useState } from "react";

export default function SupportChatCard() {
  const [showChat, setShowChat] = useState(false);
  return (
    <>
      <div className="glass rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-center my-4">
        <button className="btn w-full" onClick={() => setShowChat(true)}>
          💬 Contact Support
        </button>
        <div className="text-xs text-white/60 mt-2">Need help? Chat with us about wallet issues.</div>
      </div>
      {showChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="rounded-2xl p-6 w-full max-w-sm border border-white/10 bg-black text-white relative">
            <button className="absolute top-2 right-2 text-white/60" onClick={() => setShowChat(false)}>
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4">Support Chat</h2>
            <div className="mb-2 text-sm">Describe your issue below and we'll get back to you ASAP.</div>
            <textarea className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none text-white mb-4" rows={4} placeholder="Type your message..." />
            <button className="btn w-full">Send Message</button>
            <div className="text-xs text-white/60 mt-2">Support is available 24/7. We'll reply to your email or wallet address.</div>
          </div>
        </div>
      )}
    </>
  );
}
