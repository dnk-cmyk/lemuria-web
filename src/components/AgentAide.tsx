import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, Zap, Minimize2, Play } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
// @ts-ignore
import chibiLemur from "../assets/chibi_lemur.jpg";

interface Message {
  sender: "user" | "maki";
  text: string;
  time: string;
}

export default function AgentAide() {
  const [isOpen, setIsOpen] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "maki",
      text: "Salama e! 🐒✨ Je suis Maki, ton conseiller Chibi 3D en vidéos virales de Madagascar ! Je suis un as pour capter l'attention de l'audience locale et internationale en moins de 3 secondes.",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    },
    {
      sender: "maki",
      text: "Besoin d'un Hook en béton pour ton storyboard ? Ou des conseils pour choisir le meilleur ratio et style ? Pose-moi tes questions, je suis là pour propulser tes Shorts et TikTok !",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const userMsg: Message = {
      sender: "user",
      text: messageInput,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    const promptToSend = messageInput;
    setMessageInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptToSend,
          history: messages.map((m) => ({
            sender: m.sender,
            text: m.text
          }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        const makiMsg: Message = {
          sender: "maki",
          text: data.text,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages((prev) => [...prev, makiMsg]);
      } else {
        throw new Error("Chat response failed");
      }
    } catch (error) {
      console.error("Chat error:", error);
      const makiErrorMsg: Message = {
        sender: "maki",
        text: "Maki a glissé sur une branche de baobab ! 🐒🍂 Peux-tu réessayer dans un instant ?",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, makiErrorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setMessageInput(question);
  };

  return (
    <div id="agent-aide-wrapper" className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {/* Floating Bubble Icon */}
        {!isOpen && (
          <motion.button
            id="maki-floating-bubble"
            onClick={() => setIsOpen(true)}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 30 }}
            whileHover={{ scale: 1.08 }}
            className="relative flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 shadow-2xl shadow-blue-500/40 border-2 border-amber-400 cursor-pointer overflow-hidden group"
          >
            {/* Mascot Avatar Background */}
            <img 
              src={chibiLemur} 
              alt="Maki Mascot" 
              className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-110"
              onError={(e) => {
                // If local image fails to load, fallback gracefully
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=150&q=80";
              }}
            />
            {/* Pulsing ring indicator */}
            <span className="absolute bottom-1 right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border border-white"></span>
            </span>
            {/* Speech tooltip indicator */}
            <div className="absolute -top-10 right-0 bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md">
              Aide Maki 🐒
            </div>
          </motion.button>
        )}

        {/* Floating Chat Container */}
        {isOpen && (
          <motion.div
            id="maki-chat-panel"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="w-[360px] sm:w-[380px] h-[520px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
          >
            {/* Chat Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative h-11 w-11 rounded-2xl bg-blue-500/10 border border-amber-400/40 overflow-hidden">
                  <img 
                    src={chibiLemur} 
                    alt="Maki Avatar" 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=150&q=80";
                    }}
                  />
                  <span className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 rounded-full border border-slate-950" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-1">
                    <span>Maki</span>
                    <span className="text-[9px] font-mono font-black text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                      Coach 3D
                    </span>
                  </h3>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    En ligne • Expert Shorts Viraux
                  </span>
                </div>
              </div>
              
              <button
                id="close-maki-chat-btn"
                onClick={() => setIsOpen(false)}
                className="rounded-xl p-1.5 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                title="Masquer Maki"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-900/60 custom-scrollbar">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} items-end gap-2`}
                >
                  {msg.sender === "maki" && (
                    <div className="h-7 w-7 rounded-full overflow-hidden flex-shrink-0 border border-amber-400/30">
                      <img 
                        src={chibiLemur} 
                        alt="Maki" 
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=150&q=80";
                        }}
                      />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-slate-800 text-slate-100 rounded-bl-none border border-slate-750"
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                    <span className="text-[8px] text-slate-400 block text-right mt-1.5 font-mono">{msg.time}</span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start items-end gap-2">
                  <div className="h-7 w-7 rounded-full overflow-hidden flex-shrink-0 border border-amber-400/30">
                    <img src={chibiLemur} alt="Maki" className="h-full w-full object-cover" />
                  </div>
                  <div className="bg-slate-800 border border-slate-750 text-slate-400 rounded-2xl rounded-bl-none px-4 py-3 text-xs flex items-center gap-2">
                    <span className="flex gap-1">
                      <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                    <span className="text-[10px] italic font-medium">Maki rédige une idée virale...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggested Questions Prompts */}
            <div className="px-4 py-2 bg-slate-950 border-t border-slate-850 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
              <button
                onClick={() => handleSuggestedQuestion("Donne-moi 3 idées de hooks viraux")}
                className="text-[10px] bg-slate-900 border border-slate-800 rounded-full px-3 py-1 text-slate-300 hover:border-amber-400 transition-colors"
              >
                🔥 Hooks Viraux
              </button>
              <button
                onClick={() => handleSuggestedQuestion("Quel style d'image choisir pour un short ?")}
                className="text-[10px] bg-slate-900 border border-slate-800 rounded-full px-3 py-1 text-slate-300 hover:border-amber-400 transition-colors"
              >
                🎨 Conseils Styles
              </button>
              <button
                onClick={() => handleSuggestedQuestion("Idée de vidéo sur la nature de Madagascar")}
                className="text-[10px] bg-slate-900 border border-slate-800 rounded-full px-3 py-1 text-slate-300 hover:border-amber-400 transition-colors"
              >
                🌴 Sujet Madagascar
              </button>
            </div>

            {/* Chat Form Input */}
            <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-850 flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Écrivez à Maki..."
                className="flex-1 rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white p-2.5 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
