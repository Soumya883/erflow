"use client";

import { formatDistanceToNow } from "date-fns";
import { MessageSquarePlus } from "lucide-react";
import { NewChatModal } from "./NewChatModal";
import { useState } from "react";

export function ChatSidebar({ 
  rooms, 
  activeRoomId, 
  onSelectRoom,
  employees,
  onRoomCreated
}: { 
  rooms: any[], 
  activeRoomId: string | null,
  onSelectRoom: (id: string) => void,
  employees: any[],
  onRoomCreated: (id: string) => void
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-bold text-foreground">Chats</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-full transition-colors"
          title="New Chat"
        >
          <MessageSquarePlus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {rooms.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No chats yet. Start a new conversation!
          </div>
        ) : (
          <div className="flex flex-col">
            {rooms.map(room => {
              const isActive = room.id === activeRoomId;
              const lastMessage = room.latestMessage?.content || (room.isGroup ? "Group created" : "Chat started");
              const timeStr = room.latestMessage ? formatDistanceToNow(new Date(room.latestMessage.createdAt), { addSuffix: true }) : "";

              return (
                <button
                  key={room.id}
                  onClick={() => onSelectRoom(room.id)}
                  className={`flex items-start gap-3 p-4 border-b border-border/50 text-left transition-colors ${
                    isActive ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-muted/50 border-l-4 border-l-transparent"
                  }`}
                >
                  {room.displayAvatar ? (
                    <img src={room.displayAvatar} alt="avatar" className="h-10 w-10 rounded-full object-cover shrink-0 bg-muted" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold shrink-0 text-sm">
                      {room.displayName?.charAt(0).toUpperCase() || (room.isGroup ? "G" : "?")}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-semibold text-sm truncate text-foreground">{room.displayName}</span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{timeStr}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{lastMessage}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <NewChatModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        employees={JSON.parse(JSON.stringify(employees))}
        onRoomCreated={(id) => {
          setIsModalOpen(false);
          onRoomCreated(id);
        }}
      />
    </>
  );
}
