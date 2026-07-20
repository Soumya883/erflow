import { Sidebar } from "@/components/sidebar";
import { AddEmployeeModal } from "@/components/add-employee-modal";
import { AttendanceExportButton } from "@/components/attendance-export-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileSpreadsheet, Activity, KanbanSquare, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 bg-[#0b1326] text-white">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, Admin</h1>
            <p className="text-muted-foreground mt-1">
              Here is what's happening with your organization today.
            </p>
          </div>
          <AddEmployeeModal />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="glass-card obsidian-gradient-border border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Manage Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">View, edit, and assign roles to your workforce.</p>
              <Link href="/admin/employees" className="w-full block">
                <Button variant="secondary" className="w-full">Go to Directory</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="glass-card obsidian-gradient-border border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Task Workflows</CardTitle>
              <KanbanSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">Monitor project pipelines and drag-and-drop tasks.</p>
              <Link href="/admin/workflows" className="w-full block">
                <Button variant="secondary" className="w-full">Open Kanban</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="glass-card obsidian-gradient-border border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">System Analytics</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">Review real-time data on employee distribution.</p>
              <Link href="/admin/analytics" className="w-full block">
                <Button variant="secondary" className="w-full">View Analytics</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="glass-card obsidian-gradient-border border-none shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-semibold">Attendance Report</CardTitle>
                  <CardDescription>
                    Download the daily clock-in and clock-out logs.
                  </CardDescription>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <AttendanceExportButton />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
