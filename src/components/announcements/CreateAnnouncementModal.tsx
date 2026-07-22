"use client";

import { useState } from "react";
import { createAnnouncement } from "@/app/actions/announcements";
import { toast } from "sonner";
import { Loader2, X, Plus } from "lucide-react";

export function CreateAnnouncementModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      await createAnnouncement(formData);
      toast.success("Announcement published successfully");
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to publish announcement");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Plus className="h-4 w-4" />
        New Announcement
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-lg border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Create Announcement</h2>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input type="text" name="title" required placeholder="Important Update" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea name="content" required rows={6} placeholder="Type your announcement here..." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
