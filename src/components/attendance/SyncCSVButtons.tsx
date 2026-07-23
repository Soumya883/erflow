"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Loader2, Upload, Download } from "lucide-react";
import Papa from "papaparse";
import { importAttendanceCSV } from "@/app/actions/attendance";
import { ExportAttendanceButton } from "./ExportAttendanceButton";

export function SyncCSVButtons({ 
  matrixData, 
  totalDays, 
  month, 
  year 
}: { 
  matrixData?: any[];
  totalDays?: number;
  month?: number;
  year?: number;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    Papa.parse(file, {
      complete: async (results) => {
        try {
          const rows = results.data as string[][];
          if (rows.length < 2) throw new Error("Spreadsheet is empty");

          const res = await importAttendanceCSV(rows);
          if (res?.error) {
            toast.error(res.error);
          } else {
            toast.success("Spreadsheet data imported successfully!");
            setTimeout(() => window.location.reload(), 1500);
          }
        } catch (err: any) {
          toast.error(err.message || "Failed to parse spreadsheet");
        } finally {
          setIsLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      },
      error: (error) => {
        toast.error(`Error reading file: ${error.message}`);
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <input 
        type="file" 
        accept=".csv" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
      />
      <button 
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-[#0f9d58] text-white text-sm font-medium rounded-xl hover:bg-[#0f9d58]/90 transition-colors shadow-sm disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        Import Edits from CSV
      </button>

      <ExportAttendanceButton 
        matrixData={matrixData} 
        totalDays={totalDays} 
        month={month} 
        year={year} 
      />
    </div>
  );
}
