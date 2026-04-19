"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { ChatMessage } from "../components/forms/ChatMessage";

type Message = {
  id: string;
  sender: "user" | "support";
  content: string;
};

export default function SupportPage() {
  const socketRef = useRef<Socket | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "support",
      content: "Xin chào, chúng tôi có thể giúp gì cho bạn?",
    },
  ]);

  const [input, setInput] = useState("");

  useEffect(() => {
    const socket = io("http://localhost:4000");
    socketRef.current = socket;

    socket.on("message", (msg: any) => {
      console.log("FROM SERVER:", msg);

      setMessages((prev) => [
        ...prev,
        {
          id: msg.id?.toString() || Date.now().toString(),
          sender: msg.sender,
          content: msg.text,
        },
      ]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;
    if (!socketRef.current) return;

    socketRef.current.emit("message", input);

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: "user",
        content: input,
      },
    ]);

    setInput("");
  };

  return (
    <main className="min-h-screen py-2 flex items-start justify-center">
      <div className="w-full max-w-3xl h-[500px] flex flex-col bg-white border shadow-lg rounded-lg">

        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">Live Support Chat</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
        </div>

        <div className="p-3 border-t flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 border rounded px-3 py-2 text-sm"
            placeholder="Type message..."
          />

          <button
            onClick={sendMessage}
            className="bg-black text-white px-4 rounded text-sm"
          >
            Send
          </button>
        </div>

      </div>
    </main>
  );
}