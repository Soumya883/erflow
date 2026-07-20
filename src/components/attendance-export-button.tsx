"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import Papa from "papaparse";
import { getAttendanceReportAction } from "@/app/actions/attendance";

export function AttendanceExportButton() {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const data = await getAttendanceReportAction();
      
      if (!data || data.length === 0) {
        toast.info("No attendance records found to export.");
        return;
      }

      // Convert JSON to CSV using papaparse
      const csv = Papa.unparse(data);
      
      // Create a Blob and trigger a download
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      link.setAttribute("href", url);
      link.setAttribute("download", `Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Attendance Report downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while generating the report.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" onClick={handleDownload} disabled={loading}>
      <Download className="mr-2 h-4 w-4" />
      {loading ? "Generating..." : "Download Attendance Report"}
    </Button>
  );
}
