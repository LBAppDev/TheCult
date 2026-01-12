import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@shared/schema";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatBoxProps {
  messages: ChatMessage[];
  onSend: (msg: string) => void;
  currentPlayerName: string;
}

export function ChatBox({ messages, onSend, currentPlayerName }: ChatBoxProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[300px] bg-black/20 rounded-xl border border-white/10 overflow-hidden">
      <div className="flex items-center px-4 py-2 border-b border-white/5 bg-secondary/30">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Encrypted Channel</span>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic opacity-50">
            No messages yet. Start the conspiracy...
          </div>
        )}
        
        {messages.map((msg) => {
          const isMe = msg.sender === currentPlayerName;
          
          if (msg.isSystem) {
            return (
              <div key={msg.id} className="text-center my-2">
                <span className="text-[10px] bg-white/5 px-2 py-1 rounded-full text-muted-foreground border border-white/5">
                  {msg.message}
                </span>
              </div>
            );
          }

          return (
            <div key={msg.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
              <span className="text-[10px] text-muted-foreground mb-0.5 px-1">{msg.sender}</span>
              <div className={cn(
                "px-3 py-2 rounded-lg max-w-[85%] text-sm break-words",
                isMe 
                  ? "bg-primary text-primary-foreground rounded-tr-none" 
                  : "bg-secondary text-secondary-foreground rounded-tl-none border border-white/5"
              )}>
                {msg.message}
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="p-2 bg-secondary/30 border-t border-white/5 flex gap-2">
        <input
          className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/50"
          placeholder="Whisper something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
