"use client";

import { useState, useEffect } from "react";
import { ChatSidebar } from "./ChatSidebar";
import { ChatWindow } from "./ChatWindow";
import { getRooms } from "@/app/actions/chat";
import { Loader2 } from "lucide-react";

export function ChatLayout({ 
  initialRooms,
  employees 
}: { 
  initialRooms: any[],
  employees: any[]
}) {
  const [activeRoomId, setActiveRoomId] = useState<string | null>(
    initialRooms.length > 0 ? initialRooms[0].id : null
  );

  const [rooms, setRooms] = useState(initialRooms);

  // Poll for room updates (new messages, new groups)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const updatedRooms = await getRooms();
        setRooms(updatedRooms);
      } catch (err) {
        console.error("Failed to poll rooms");
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Also sync if initialRooms changes from a server action / router.refresh
  useEffect(() => {
    setRooms(initialRooms);
  }, [initialRooms]);

  const activeRoom = rooms.find(r => r.id === activeRoomId);
  const isWaitingForRoom = activeRoomId !== null && !activeRoom;

  return (
    <div className="flex h-full w-full">
      <div className="w-80 shrink-0 border-r border-border h-full flex flex-col bg-muted/10">
        <ChatSidebar 
          rooms={rooms} 
          activeRoomId={activeRoomId} 
          onSelectRoom={setActiveRoomId}
          employees={JSON.parse(JSON.stringify(employees))}
          onRoomCreated={async (newRoomId) => {
            setActiveRoomId(newRoomId);
            // Instantly fetch the new room list so the UI updates without waiting for polling
            const updatedRooms = await getRooms();
            setRooms(updatedRooms);
          }}
        />
      </div>
      <div className="flex-1 h-full flex flex-col min-w-0 bg-background/50">
        {activeRoom ? (
          <ChatWindow roomId={activeRoom.id} roomName={activeRoom.displayName} />
        ) : isWaitingForRoom ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
            <p>Loading conversation...</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            <p>Select a conversation or start a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}
