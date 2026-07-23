"use client";

import { useEffect, useState, useRef } from "react";
import { getMessages, sendMessage } from "@/app/actions/chat";
import { format } from "date-fns";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ChatWindow({ roomId, roomName }: { roomId: string, roomName?: string | null }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await getMessages(roomId);
      setMessages(res.messages);
      setCurrentUserId(res.currentUserId);
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  // Poll for new messages every 3 seconds
  useEffect(() => {
    setIsLoading(true);
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [roomId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    setIsSending(true);
    try {
      await sendMessage(roomId, text);
      setText("");
      // Fetch immediately to show the sent message faster
      await fetchMessages();
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="p-4 border-b border-border bg-card shrink-0 flex items-center justify-between">
        <h3 className="font-bold text-lg">{roomName || "Chat"}</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
            <p>No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.authorId === currentUserId;
            const showHeader = idx === 0 || messages[idx - 1].authorId !== msg.authorId;

            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {showHeader && !isMe && (
                  <div className="text-xs text-muted-foreground mb-1 ml-1">{msg.author.user.name}</div>
                )}
                <div className={`px-4 py-2 rounded-2xl max-w-[75%] break-words ${
                  isMe 
                    ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                    : 'bg-muted text-foreground rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
                <div className={`text-[10px] text-muted-foreground mt-1 ${isMe ? 'mr-1' : 'ml-1'}`}>
                  {format(new Date(msg.createdAt), "HH:mm")}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-card border-t border-border shrink-0">
        <form onSubmit={handleSend} className="flex gap-2">
          <input 
            type="text" 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button 
            type="submit" 
            disabled={!text.trim() || isSending}
            className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors shrink-0 flex items-center justify-center h-10 w-10"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 ml-1" />}
          </button>
        </form>
      </div>
    </div>
  );
}
