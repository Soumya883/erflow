"use client";

import { useState } from "react";
import { submitLeaveRequest } from "@/app/actions/leave";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";

export function RequestLeaveModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const result = await submitLeaveRequest(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Leave request submitted successfully");
        setIsOpen(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary p-4 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
      >
        Request Leave
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-lg border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Request Leave</h2>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Leave Type</label>
                <select name="type" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="SICK">Sick Leave</option>
                  <option value="VACATION">Vacation</option>
                  <option value="PERSONAL">Personal</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input type="date" name="startDate" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input type="date" name="endDate" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <textarea name="reason" required rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring" />
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
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
