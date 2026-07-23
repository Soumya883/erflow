"use client";

import { useState } from "react";
import { updateSettings } from "@/app/actions/settings";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

export function SettingsForm({ 
  initialSettings 
}: { 
  initialSettings: any 
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        companyName: formData.get("companyName") as string,
        workingHoursStart: formData.get("workingHoursStart") as string,
        workingHoursEnd: formData.get("workingHoursEnd") as string,
      };
      
      await updateSettings(data);
      toast.success("Settings saved successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4 border-b border-border pb-4">General Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Company Name</label>
            <input 
              type="text" 
              name="companyName" 
              defaultValue={initialSettings?.companyName || "OfficeFlow"}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring" 
            />
            <p className="text-xs text-muted-foreground mt-1">This will be displayed in the sidebar and reports.</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4 border-b border-border pb-4">Working Hours</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <input 
              type="time" 
              name="workingHoursStart" 
              defaultValue={initialSettings?.workingHoursStart || "09:00"}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End Time</label>
            <input 
              type="time" 
              name="workingHoursEnd" 
              defaultValue={initialSettings?.workingHoursEnd || "17:00"}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring" 
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">These hours are used to calculate default check-in and check-out times in the attendance matrix.</p>
      </div>

      <div className="flex justify-end pt-2">
        <button 
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
      </div>
    </form>
  );
}
