"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { getDailyAttendanceAction, getAttendanceReportAction } from "@/app/actions/attendance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Download, Users, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";

export default function HrAttendanceMaster() {
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getDailyAttendanceAction();
        setDailyData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleDownloadReport = async () => {
    try {
      const report = await getAttendanceReportAction();
      if (!report.length) {
        toast("No attendance records found.");
        return;
      }
      
      const headers = Object.keys(report[0]).join(",");
      const csv = [
        headers,
        ...report.map(row => Object.values(row).map(v => `"${v}"`).join(","))
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance_report_${format(new Date(), "yyyy-MM-dd")}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Report downloaded.");
    } catch (err) {
      toast.error("Failed to generate report.");
      console.error(err);
    }
  };

  const totalEmployees = dailyData.length;
  const presentCount = dailyData.filter(e => e.status === "PRESENT" || e.status === "LATE").length;
  const absentCount = dailyData.filter(e => e.status === "ABSENT").length;

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b1326] text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              Attendance Master
            </h1>
            <p className="text-muted-foreground mt-1">
              Daily attendance tracking and reporting for all employees.
            </p>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleDownloadReport}
          >
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
        </div>

        {/* Metrics Row */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="glass-card obsidian-gradient-border border-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{loading ? "-" : totalEmployees}</div>
            </CardContent>
          </Card>
          <Card className="glass-card obsidian-gradient-border border-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Present Today</CardTitle>
              <UserCheck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{loading ? "-" : presentCount}</div>
            </CardContent>
          </Card>
          <Card className="glass-card obsidian-gradient-border border-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Absent Today</CardTitle>
              <UserX className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{loading ? "-" : absentCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Master Table */}
        <Card className="glass-card border-white/10 shadow-lg">
          <CardHeader>
            <CardTitle>Today's Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground py-8 text-center">Loading directory...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3 font-medium">Employee</th>
                      <th className="px-4 py-3 font-medium">Role / Dept</th>
                      <th className="px-4 py-3 font-medium text-center">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Clock In</th>
                      <th className="px-4 py-3 font-medium text-right">Clock Out</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {dailyData.map((emp) => (
                      <tr key={emp.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-4 font-semibold text-white">
                          {emp.name}
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {emp.designation}<br />
                          <span className="text-xs">{emp.department}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Badge 
                            variant={emp.status === "PRESENT" ? "default" : emp.status === "LATE" ? "secondary" : "destructive"}
                          >
                            {emp.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-right text-muted-foreground tabular-nums">
                          {emp.clockInTime ? format(new Date(emp.clockInTime), "hh:mm a") : "-"}
                        </td>
                        <td className="px-4 py-4 text-right text-muted-foreground tabular-nums">
                          {emp.clockOutTime ? format(new Date(emp.clockOutTime), "hh:mm a") : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
