import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

export default function AdminSupportChat() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (loggedIn && !socketRef.current) {
      socketRef.current = io("http://localhost:4001");
      socketRef.current.on("chat history", (msgs: any[]) => setMessages(msgs));
      socketRef.current.on("chat message", (msg: any) => setMessages(msgs => [...msgs, msg]));
    }
    return () => { socketRef.current?.disconnect(); };
  }, [loggedIn]);

  const handleLogin = () => {
    // Simple password check (replace with real auth in production)
    if (password === "dopeadmin") setLoggedIn(true);
    else alert("Incorrect password");
  };

  const sendMessage = () => {
    if (input.trim() && socketRef.current) {
      socketRef.current.emit("agent message", input.trim());
      setInput("");
    }
  };

  if (!loggedIn) {
    return (
      <div className="glass rounded-2xl p-5 border border-white/10 flex flex-col items-center">
        <h2 className="text-lg font-semibold mb-4">Admin Login</h2>
        <input
          type="password"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none mb-2"
          placeholder="Admin password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button className="btn w-full" onClick={handleLogin}>Login</button>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-5 border border-white/10 flex flex-col h-[400px]">
      <h2 className="text-lg font-semibold mb-4">Support Chat (Admin)</h2>
      <div className="flex-1 overflow-y-auto mb-2 bg-black/10 rounded p-2">
        {messages.map((msg, i) => (
          <div key={i} className={`mb-2 text-sm ${msg.sender === "agent" ? "text-green-400 text-right" : "text-white/80 text-left"}`}>
            <span className="font-bold">{msg.sender === "agent" ? "You" : "User"}:</span> {msg.message}
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <input
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none text-white"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a reply..."
        />
        <button className="btn" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
