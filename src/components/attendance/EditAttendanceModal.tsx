"use client";

import { useState } from "react";
import { updateAttendanceRecord } from "@/app/actions/attendance";
import { toast } from "sonner";
import { Loader2, X, Edit2 } from "lucide-react";

export function EditAttendanceModal({ 
  employeeId,
  logId, 
  currentCheckIn, 
  currentCheckOut,
  dateForNewLog,
  isOpen,
  onClose
}: { 
  employeeId: string;
  logId?: string | null; 
  currentCheckIn?: string | null; 
  currentCheckOut?: string | null;
  dateForNewLog?: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"WORKING_DAY" | "LEAVE" | "ABSENT">("WORKING_DAY");

  // Helper to format ISO to datetime-local format
  const formatForInput = (isoString: string | null | undefined) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    // Adjust for local timezone offset for the input
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const checkIn = formData.get("checkIn") as string | null;
      const checkOut = formData.get("checkOut") as string | null;
      
      await updateAttendanceRecord(employeeId, logId || undefined, { 
        checkIn: checkIn ? new Date(checkIn).toISOString() : undefined, 
        checkOut: checkOut ? new Date(checkOut).toISOString() : undefined,
        status
      }, dateForNewLog);
      
      toast.success("Attendance record updated successfully");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to update record");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-2xl border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Edit Attendance</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium mb-1">Status Override</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="WORKING_DAY">Working Day / Present</option>
                  <option value="LEAVE">Mark as Leave</option>
                  <option value="ABSENT">Mark as Absent</option>
                </select>
              </div>

              {status === "WORKING_DAY" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Clock In Time (Optional)</label>
                    <input 
                      type="datetime-local" 
                      name="checkIn" 
                      defaultValue={formatForInput(currentCheckIn)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Clock Out Time (Optional)</label>
                    <input 
                      type="datetime-local" 
                      name="checkOut" 
                      defaultValue={formatForInput(currentCheckOut)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring" 
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={onClose}
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
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
    </>
  );
}
