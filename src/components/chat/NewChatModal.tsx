"use client";

import { useState } from "react";
import { createChatRoom } from "@/app/actions/chat";
import { toast } from "sonner";
import { X, Loader2, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export function NewChatModal({ 
  isOpen, 
  onClose,
  employees,
  onRoomCreated
}: { 
  isOpen: boolean;
  onClose: () => void;
  employees: any[];
  onRoomCreated: (roomId: string) => void;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGroup, setIsGroup] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");

  const toggleUser = (id: string) => {
    if (isGroup) {
      if (selectedUsers.includes(id)) {
        setSelectedUsers(selectedUsers.filter(u => u !== id));
      } else {
        setSelectedUsers([...selectedUsers, id]);
      }
    } else {
      setSelectedUsers([id]);
    }
  };

  const handleSubmit = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    if (isGroup && !groupName.trim()) {
      toast.error("Please provide a group name");
      return;
    }

    setIsLoading(true);
    try {
      const roomId = await createChatRoom(selectedUsers, isGroup, groupName);
      toast.success("Chat created!");
      router.refresh();
      onRoomCreated(roomId);
    } catch (err: any) {
      toast.error(err.message || "Failed to create chat");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl border border-border flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-xl font-bold">New Message</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-4 mb-4 shrink-0">
          <button 
            onClick={() => { setIsGroup(false); setSelectedUsers([]); }}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${!isGroup ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            Direct Message
          </button>
          <button 
            onClick={() => { setIsGroup(true); setSelectedUsers([]); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${isGroup ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            <Users className="h-4 w-4" /> Group
          </button>
        </div>

        {isGroup && (
          <div className="mb-4 shrink-0">
            <label className="block text-sm font-medium mb-1">Group Name</label>
            <input 
              type="text" 
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder="e.g. Project Apollo Team"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" 
            />
          </div>
        )}

        <div className="mb-2 text-sm font-semibold text-muted-foreground shrink-0">
          Select Contact{isGroup ? 's' : ''}
        </div>
        
        <div className="flex-1 overflow-y-auto min-h-[200px] border border-border rounded-lg mb-4">
          {employees.map(emp => {
            const isSelected = selectedUsers.includes(emp.id);
            return (
              <button
                key={emp.id}
                onClick={() => toggleUser(emp.id)}
                className={`w-full flex items-center gap-3 p-3 border-b border-border/50 text-left hover:bg-muted/50 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'bg-primary border-primary' : 'border-input'}`}>
                  {isSelected && <div className="w-2 h-2 bg-primary-foreground rounded-full" />}
                </div>
                {emp.avatarUrl ? (
                  <img src={emp.avatarUrl} alt="" className="h-8 w-8 rounded-full bg-muted object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                    {emp.user.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">{emp.user.name}</p>
                  <p className="text-xs text-muted-foreground">{emp.jobTitle || emp.department?.name || "Employee"}</p>
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex justify-end gap-3 shrink-0 pt-2 border-t border-border">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-md transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isLoading || selectedUsers.length === 0 || (isGroup && !groupName.trim())}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isGroup ? "Create Group" : "Start Chat"}
          </button>
        </div>
      </div>
    </div>
  );
}
