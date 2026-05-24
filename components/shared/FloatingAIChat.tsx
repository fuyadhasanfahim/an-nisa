"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconMessageChatbot, 
  IconX, 
  IconSend, 
  IconBrandWhatsapp,
  IconLoader2
} from "@tabler/icons-react";

type Message = {
  id: string;
  role: "user" | "model";
  content: string;
};

export function FloatingAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckingPing, setIsCheckingPing] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "model", content: "Hello! I'm your An-Nisa shopping assistant. How can I help you today?" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [wantsHuman, setWantsHuman] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const whatsappNumber = process.env.NEXT_PUBLIC_PHONE_NUMBER || "+8801877910384";
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`;

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleOpenChat = async () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    const cachedPing = sessionStorage.getItem("ai_ping_ok");
    
    if (cachedPing === "true") {
      setIsOpen(true);
      return;
    } else if (cachedPing === "false") {
      window.open(whatsappUrl, "_blank");
      return;
    }

    setIsCheckingPing(true);
    try {
      const res = await fetch("/api/ai/ping");
      const data = await res.json();
      
      if (data.ok) {
        sessionStorage.setItem("ai_ping_ok", "true");
        setIsOpen(true);
      } else {
        // Fallback directly to WhatsApp
        sessionStorage.setItem("ai_ping_ok", "false");
        window.open(whatsappUrl, "_blank");
      }
    } catch (e) {
      console.error("Ping error:", e);
      window.open(whatsappUrl, "_blank");
    } finally {
      setIsCheckingPing(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const newUserMsg = inputValue.trim();
    const newMessages: Message[] = [
      ...messages,
      { id: Date.now().toString(), role: "user", content: newUserMsg }
    ];
    
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      // Send previous history (excluding the very first greeting if we want, or just pass all)
      const historyToPass = messages.filter(m => m.id !== "1").map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyToPass,
          userMessage: newUserMsg
        })
      });

      const data = await res.json();
      
      if (data.wantsHuman) {
        setWantsHuman(true);
      }
      
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: "model", content: data.reply || "Something went wrong." }
      ]);
      
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: "model", content: "I'm having trouble connecting. You can talk to a real person instead!" }
      ]);
      setWantsHuman(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleOpenChat}
          disabled={isCheckingPing}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-black text-white shadow-soft hover:scale-105 transition-transform active:scale-95 relative"
        >
          {isCheckingPing ? (
            <IconLoader2 className="h-6 w-6 animate-spin" />
          ) : isOpen ? (
            <IconX className="h-6 w-6" />
          ) : (
            <IconMessageChatbot className="h-7 w-7" />
          )}
        </button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 flex h-[500px] max-h-[calc(100vh-8rem)] w-80 flex-col overflow-hidden rounded-2xl bg-white shadow-soft border border-black/5 sm:w-96"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-brand-black px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <IconMessageChatbot className="h-5 w-5 text-brand-pink" />
                <span className="font-semibold text-sm">An-Nisa Assistant</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 hover:bg-white/10 transition-colors"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-cream/30">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                      msg.role === "user" 
                        ? "bg-brand-black text-white rounded-br-sm" 
                        : "bg-[#fcc4c8]/20 border border-[#fcc4c8]/40 text-brand-black rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm bg-[#fcc4c8]/20 border border-[#fcc4c8]/40 text-brand-black rounded-bl-sm flex gap-1.5 items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-black/40 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-black/40 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-black/40 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              )}
              
              {/* WhatsApp Fallback Button (shows if wantsHuman is true) */}
              {wantsHuman && (
                <div className="flex justify-center pt-2">
                  <a 
                    href={whatsappUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#20bd5a] transition-colors"
                  >
                    <IconBrandWhatsapp className="h-5 w-5" />
                    আমাদের সাথে সরাসরি কথা বলুন
                  </a>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-black/5 bg-white p-3">
              <form 
                onSubmit={handleSendMessage}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask about products, orders..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 rounded-xl border border-black/10 bg-brand-lightgray/50 px-3.5 py-2 text-sm text-brand-black focus:border-[#fcc4c8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcc4c8]/20 transition-all disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-black text-white transition-colors hover:bg-black active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                >
                  <IconSend className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
