"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { format } from "date-fns";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getHrAttendanceReviewAction, resolveAttendanceDiscrepancyAction } from "@/app/actions/attendance";
import { toast } from "sonner";

export default function HrDashboard() {
  const [flaggedRecords, setFlaggedRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      setLoading(true);
      const records = await getHrAttendanceReviewAction();
      setFlaggedRecords(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      await resolveAttendanceDiscrepancyAction(id);
      toast.success("Record resolved successfully.");
      fetchData(); // Refresh the list
    } catch (err) {
      toast.error("Failed to resolve record.");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b1326] text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            HR Command Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and resolve flagged attendance discrepancies.
          </p>
        </div>

        <Card className="glass-card obsidian-gradient-border border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Requires Review ({flaggedRecords.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading records...</p>
            ) : flaggedRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mb-4 text-secondary" />
                <p>All attendance records are clean.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {flaggedRecords.map((record) => {
                  const emp = record.employee || {};
                  return (
                    <div key={record.id} className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">
                          {emp.firstName || "Unknown"} {emp.lastName || "Employee"}
                        </h3>
                        <div className="text-sm text-muted-foreground mt-1 space-x-4">
                          <span>Date: {record.date ? format(new Date(record.date), "MMM d, yyyy") : "Unknown"}</span>
                          <span>
                            Clock In: {record.clockInTime ? format(new Date(record.clockInTime), "hh:mm a") : "Missing"}
                          </span>
                          <span>Status: <Badge variant="destructive">{record.status || "Unknown"}</Badge></span>
                        </div>
                        <p className="text-sm text-destructive mt-2 bg-destructive/10 px-2 py-1 rounded inline-block">
                          {record.hrNotes || "No notes"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-white/20 hover:bg-white/10"
                          onClick={() => handleResolve(record.id)}
                        >
                          Mark Resolved
                        </Button>
                        <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10" onClick={() => toast("Edit Time coming soon.")}>
                          Edit Time
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
