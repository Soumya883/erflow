"use client";

import React, { useRef, useState } from "react";
import { EditAttendanceModal } from "./EditAttendanceModal";
import { EditSalaryModal } from "./EditSalaryModal";

type DayStatus = "PRESENT" | "ABSENT" | "LEAVE" | "WEEKEND" | "PENDING";

type MatrixData = {
  id: string;
  name: string;
  department: string;
  baseSalary: number;
  payableDays: number;
  calculatedSalary: number;
  days: {
    day: number;
    status: DayStatus;
    checkIn: string | null;
    checkOut: string | null;
    logId: string | null;
    employeeId: string;
  }[];
};

export function AttendanceMatrix({ 
  matrixData, 
  totalDays, 
  month, 
  year 
}: { 
  matrixData: MatrixData[]; 
  totalDays: number;
  month: number;
  year: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [editingCell, setEditingCell] = useState<{
    employeeId: string;
    logId: string | null;
    currentCheckIn: string | null;
    currentCheckOut: string | null;
    dateForNewLog: string;
  } | null>(null);
  
  const [editingSalary, setEditingSalary] = useState<{
    employeeId: string;
    employeeName: string;
    currentSalary: number;
  } | null>(null);
  
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  const getStatusColor = (status: DayStatus) => {
    switch (status) {
      case "PRESENT": return "bg-green-100 text-green-700 border-green-200";
      case "ABSENT": return "bg-red-100 text-red-700 border-red-200";
      case "LEAVE": return "bg-blue-100 text-blue-700 border-blue-200";
      case "WEEKEND": return "bg-secondary/50 text-muted-foreground border-transparent";
      default: return "bg-transparent text-muted-foreground border-transparent";
    }
  };

  const getStatusLabel = (status: DayStatus) => {
    switch (status) {
      case "PRESENT": return "P";
      case "ABSENT": return "A";
      case "LEAVE": return "L";
      case "WEEKEND": return "W";
      default: return "-";
    }
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      
      {/* Scrollable Matrix */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-card"
        style={{ cursor: 'grab' }}
        onMouseDown={(e) => {
          if (!containerRef.current) return;
          const ele = containerRef.current;
          let pos = { left: ele.scrollLeft, top: ele.scrollTop, x: e.clientX, y: e.clientY };
          
          const mouseMoveHandler = (e: MouseEvent) => {
            const dx = e.clientX - pos.x;
            const dy = e.clientY - pos.y;
            ele.scrollTop = pos.top - dy;
            ele.scrollLeft = pos.left - dx;
          };
          const mouseUpHandler = () => {
            ele.style.cursor = 'grab';
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
          };
          
          document.addEventListener('mousemove', mouseMoveHandler);
          document.addEventListener('mouseup', mouseUpHandler);
          ele.style.cursor = 'grabbing';
        }}
      >
        <table className="w-full text-xs text-left border-collapse select-none">
          <thead className="sticky top-0 z-20 bg-secondary/95 backdrop-blur shadow-sm">
            <tr>
              <th className="sticky left-0 z-30 bg-secondary/95 px-4 py-3 font-semibold border-b border-r border-border min-w-[200px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                Employee
              </th>
              <th className="px-4 py-3 font-semibold border-b border-r border-border min-w-[120px] text-center bg-blue-50/50 text-blue-800">
                Payable Days
              </th>
              <th className="px-4 py-3 font-semibold border-b border-r border-border min-w-[140px] text-center bg-green-50/50 text-green-800">
                Calculated Salary
              </th>
              {daysArray.map(day => (
                <th key={day} className="px-2 py-3 font-semibold border-b border-r border-border min-w-[100px] text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase text-muted-foreground">
                      {new Date(year, month, day).toLocaleDateString(undefined, { weekday: 'short' })}
                    </span>
                    <span className="text-sm">{day}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {matrixData.map(emp => (
              <tr key={emp.id} className="hover:bg-muted/30 transition-colors group">
                <td className="sticky left-0 z-10 bg-card group-hover:bg-muted/50 px-4 py-3 border-r border-border font-medium shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  <div className="flex flex-col">
                    <span className="text-sm">{emp.name}</span>
                    <span className="text-[10px] text-muted-foreground">{emp.department}</span>
                  </div>
                </td>
                
                <td className="px-4 py-3 border-r border-border text-center bg-blue-50/20 font-medium">
                  {emp.payableDays} / {totalDays}
                </td>
                
                <td className="px-4 py-3 border-r border-border text-center bg-green-50/20 font-medium group relative">
                  <div className="flex flex-col items-center gap-1 text-green-700">
                    <span>₹{emp.calculatedSalary.toFixed(2)}</span>
                    <button 
                      onClick={() => setEditingSalary({
                        employeeId: emp.id,
                        employeeName: emp.name,
                        currentSalary: emp.baseSalary
                      })}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full hover:bg-green-200"
                    >
                      Base: ₹{emp.baseSalary}
                    </button>
                  </div>
                </td>

                {emp.days.map((dayData, idx) => (
                  <td key={idx} className="p-1 border-r border-border text-center relative group/cell">
                    <div className="flex flex-col items-center justify-center min-h-[60px] p-1">
                      <div className={`flex items-center justify-center h-6 w-6 rounded-md font-bold mb-1 border ${getStatusColor(dayData.status)}`}>
                        {getStatusLabel(dayData.status)}
                      </div>
                      
                      {dayData.status === "PRESENT" && (
                        <div className="flex flex-col items-center text-[9px] leading-tight text-muted-foreground">
                          <span className="text-green-600 font-medium" title="Check In">
                            {dayData.checkIn ? new Date(dayData.checkIn).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }) : "--:--"}
                          </span>
                          <span className="text-red-500 font-medium" title="Check Out">
                            {dayData.checkOut ? new Date(dayData.checkOut).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }) : "--:--"}
                          </span>
                        </div>
                      )}
                      
                      {dayData.status !== "PRESENT" && dayData.status !== "WEEKEND" && (
                        <div className="h-[18px]"></div>
                      )}

                      {/* Edit Button overlay on hover */}
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover/cell:opacity-100 flex items-center justify-center transition-opacity rounded-sm">
                        <button 
                          onClick={() => setEditingCell({
                            employeeId: dayData.employeeId,
                            logId: dayData.logId,
                            currentCheckIn: dayData.checkIn,
                            currentCheckOut: dayData.checkOut,
                            dateForNewLog: new Date(Date.UTC(year, month, dayData.day, 0, 0, 0)).toISOString()
                          })}
                          className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                          Edit
                        </button>
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EditAttendanceModal 
        isOpen={editingCell !== null}
        onClose={() => setEditingCell(null)}
        employeeId={editingCell?.employeeId || ""}
        logId={editingCell?.logId}
        currentCheckIn={editingCell?.currentCheckIn}
        currentCheckOut={editingCell?.currentCheckOut}
        dateForNewLog={editingCell?.dateForNewLog}
      />

      <EditSalaryModal 
        isOpen={editingSalary !== null}
        onClose={() => setEditingSalary(null)}
        employeeId={editingSalary?.employeeId || ""}
        employeeName={editingSalary?.employeeName || ""}
        currentSalary={editingSalary?.currentSalary || 0}
      />
    </div>
  );
}
