"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Papa from "papaparse";

type MatrixData = any;

export function ExportAttendanceButton({ 
  matrixData, 
  totalDays, 
  month, 
  year 
}: { 
  matrixData?: MatrixData[];
  totalDays?: number;
  month?: number;
  year?: number;
}) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (matrixData && totalDays && month !== undefined && year) {
        // Export the Matrix table (which can be imported later)
        const headers = ["Employee Name", "Department", "Payable Days", "Calculated Salary"];
        for (let i = 1; i <= totalDays; i++) headers.push(`${i}/${month + 1}/${year}`);

        const rows = matrixData.map(emp => {
          const row = [emp.name, emp.department, emp.payableDays.toString(), emp.calculatedSalary.toFixed(2)];
          emp.days.forEach((d: any) => {
            if (d.status === "PRESENT") {
              row.push("P");
            } else if (d.status === "ABSENT") {
              row.push("A");
            } else if (d.status === "LEAVE") {
              row.push("L");
            } else if (d.status === "WEEKEND") {
              row.push("W");
            } else {
              row.push("-");
            }
          });
          return row;
        });

        const csvContent = Papa.unparse([headers, ...rows]);
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `Attendance_Matrix_${year}_${month + 1}.csv`;
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Attendance Matrix downloaded successfully!");
      } else {
        // Fallback to Payroll Summary API
        const now = new Date();
        const response = await fetch(`/api/export/attendance?month=${now.getMonth()}&year=${now.getFullYear()}`);
        if (!response.ok) throw new Error("Failed to export attendance");
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `Attendance_Payroll_Report_${now.getFullYear()}_${now.getMonth() + 1}.csv`;
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Monthly Payroll Report downloaded successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to download attendance sheet");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button 
      onClick={handleExport}
      disabled={isExporting}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      Download Spreadsheet
    </button>
  );
}
