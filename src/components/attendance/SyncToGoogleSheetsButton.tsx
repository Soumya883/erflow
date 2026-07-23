"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { syncToGoogleSheets, pullFromGoogleSheets } from "@/app/actions/attendance";

type MatrixData = any;

export function SyncToGoogleSheetsButton({ matrixData, totalDays, month, year }: { matrixData: MatrixData[], totalDays: number, month: number, year: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("https://script.google.com/macros/s/AKfycbw0lMJZAP2qWp3JUTqIl--oUUjIc__AYsjPPI6w9TnnrukpK6k7cb_A4iAhNMppiU141g/exec");
  const [syncDirection, setSyncDirection] = useState<"PULL" | "PUSH">("PULL");

  const handleSync = async () => {
    if (!webhookUrl) return toast.error("Please enter the Webhook URL");
    setIsLoading(true);

    try {
      if (syncDirection === "PULL") {
        await pullFromGoogleSheets(webhookUrl);
        toast.success("Successfully pulled data from Google Sheets! Refreshing...");
        setIsOpen(false);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const headers = ["Employee Name", "Department", "Payable Days", "Calculated Salary"];
        for (let i = 1; i <= totalDays; i++) headers.push(`${i}/${month + 1}/${year}`);

        const rows = matrixData.map(emp => {
          const row = [emp.name, emp.department, emp.payableDays.toString(), emp.calculatedSalary.toFixed(2)];
          emp.days.forEach((d: any) => {
            if (d.status === "PRESENT") {
              let timeStr = "P";
              if (d.checkIn && d.checkOut) {
                const inStr = new Date(d.checkIn).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
                const outStr = new Date(d.checkOut).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
                timeStr = `P (${inStr} - ${outStr})`;
              }
              row.push(timeStr);
            } else if (d.status === "ABSENT") row.push("A");
            else if (d.status === "LEAVE") row.push("L");
            else if (d.status === "WEEKEND") row.push("W");
            else row.push("-");
          });
          return row;
        });

        await syncToGoogleSheets(webhookUrl, { headers, rows });
        toast.success("Successfully pushed data to Google Sheets!");
        setIsOpen(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to sync data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-[#0f9d58] text-white text-sm font-medium rounded-xl hover:bg-[#0f9d58]/90 transition-colors shadow-sm"
      >
        <RefreshCw className="h-4 w-4" />
        Sync Google Sheets
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Google Sheets Sync</DialogTitle>
            <DialogDescription>
              Keep your ERP and Google Sheet perfectly in sync.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="webhook" className="text-sm font-medium">Webhook URL</label>
              <input 
                id="webhook"
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="syncDirection" className="text-sm font-medium">Sync Direction</label>
              <select
                id="syncDirection"
                value={syncDirection}
                onChange={(e) => setSyncDirection(e.target.value as "PULL" | "PUSH")}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="PULL">Pull from Google Sheets to ERP</option>
                <option value="PUSH">Push from ERP to Google Sheets</option>
              </select>
              <p className="text-[11px] text-muted-foreground mt-1">
                {syncDirection === "PULL" 
                  ? "Fetches edits made directly in the Google Sheet and applies them to the ERP."
                  : "Overwrites the Google Sheet with the current data in the ERP."}
              </p>
            </div>

            <button 
              onClick={handleSync}
              disabled={isLoading}
              className="mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {syncDirection === "PULL" ? "Pull Data Now" : "Push Data Now"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
