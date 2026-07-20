"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  getMyTodayAttendanceAction, 
  markPresentAction, 
  logoutForDayAction,
  getAttendanceHistoryAction
} from "@/app/actions/attendance";
import { getEmployeeByIdAction } from "@/app/actions/employee";
import { getMeAction, logoutAction } from "@/app/actions/auth";
import { toast } from "sonner";
import { Clock, LogOut, CalendarDays, MapPin, Mail, Phone, Briefcase, User, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function EmployeeDashboard() {
  const [record, setRecord] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const session = await getMeAction();
      if (!session) return;
      
      setEmployeeId(session.employeeId);
      
      const [todayRecord, pastHistory, userProfile] = await Promise.all([
        getMyTodayAttendanceAction(session.employeeId),
        getAttendanceHistoryAction(session.employeeId),
        getEmployeeByIdAction(session.employeeId)
      ]);
      
      if (!userProfile) {
        // If the database was reset but the browser cookie remains, clear the session
        await logoutAction();
        return;
      }

      setRecord(todayRecord);
      setHistory(pastHistory);
      setProfile(userProfile);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkPresent = async () => {
    try {
      if (!employeeId) return;
      setActionLoading(true);
      await markPresentAction(employeeId);
      toast.success("Successfully marked present!");
      await fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to mark present.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (!record?.id) return;
      setActionLoading(true);
      await logoutForDayAction(record.id);
      toast.success("Successfully clocked out for the day.");
      await fetchData();
    } catch (error: any) {
      toast.error("Failed to clock out.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0b1326] flex items-center justify-center text-white">Loading your workspace...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0b1326] text-white p-6 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Header */}
      <header className="flex items-center justify-between mb-8 z-10 relative">
        <div>
          <h1 className="text-3xl font-bold">My Workspace</h1>
          <p className="text-muted-foreground">{format(new Date(), "EEEE, MMMM do, yyyy")}</p>
        </div>
        <form action={logoutAction}>
          <Button type="submit" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </form>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 z-10 relative">
        {/* LEFT COLUMN: Profile Identity Card */}
        <div className="space-y-6">
          <Card className="glass-card obsidian-gradient-border border-none shadow-2xl overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-primary/40 to-blue-600/40 w-full" />
            <CardContent className="pt-0 relative px-6 pb-6">
              <div className="flex justify-center -mt-12 mb-4">
                <div className="w-24 h-24 rounded-full border-4 border-[#0b1326] overflow-hidden bg-muted flex items-center justify-center shadow-xl">
                  {profile?.photoUrl ? (
                    <img src={profile.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>
              </div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">{profile?.firstName} {profile?.lastName}</h2>
                <p className="text-primary font-medium">{profile?.designation || "Employee"}</p>
                <div className="mt-2 inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-mono text-muted-foreground">
                  {profile?.employeeIdentifier || "ID Pending"}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <p className="text-muted-foreground text-xs uppercase tracking-wider">Email</p>
                    <p>{profile?.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <p className="text-muted-foreground text-xs uppercase tracking-wider">Phone</p>
                    <p>{profile?.phoneNumber || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <p className="text-muted-foreground text-xs uppercase tracking-wider">Department</p>
                    <p>{profile?.department || "Unassigned"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CalendarDays className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <p className="text-muted-foreground text-xs uppercase tracking-wider">Joined</p>
                    <p>{profile?.joiningDate ? format(new Date(profile.joiningDate), "MMM do, yyyy") : "Unknown"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <p className="text-muted-foreground text-xs uppercase tracking-wider">Address</p>
                    <p>{profile?.address || "Not provided"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Actions & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Action Card */}
          <Card className="glass-card obsidian-gradient-border border-none shadow-2xl">
            <CardHeader className="pb-4 border-b border-white/5">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Today's Action
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-8">
              {!record ? (
                <div className="text-center max-w-sm w-full">
                  <div className="mb-6 text-muted-foreground">
                    You haven't clocked in today. Your shift starts at {profile?.shiftStartTime || "09:00"}.
                  </div>
                  <Button 
                    size="lg" 
                    className="w-full h-14 text-lg font-bold bg-primary text-on-primary hover:bg-primary/90 accent-glow-primary"
                    onClick={handleMarkPresent}
                    disabled={actionLoading}
                  >
                    Clock In
                  </Button>
                </div>
              ) : !record.clockOutTime ? (
                <div className="text-center max-w-sm w-full">
                  <div className="mb-2 text-primary font-bold text-lg flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> Active Shift
                  </div>
                  <div className="mb-6 text-muted-foreground">
                    Clocked in at {format(new Date(record.clockInTime), "hh:mm a")}
                  </div>
                  <Button 
                    size="lg" 
                    variant="destructive"
                    className="w-full h-14 text-lg font-bold shadow-lg shadow-destructive/20 hover:shadow-destructive/40 transition-all"
                    onClick={handleLogout}
                    disabled={actionLoading}
                  >
                    End Shift (Clock Out)
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-secondary font-bold text-2xl mb-2 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-6 h-6" /> Shift Complete
                  </div>
                  <div className="flex items-center justify-center gap-8 mt-6">
                    <div>
                      <p className="text-muted-foreground text-sm uppercase tracking-wider mb-1">Clock In</p>
                      <p className="text-xl font-medium">{format(new Date(record.clockInTime), "hh:mm a")}</p>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div>
                      <p className="text-muted-foreground text-sm uppercase tracking-wider mb-1">Clock Out</p>
                      <p className="text-xl font-medium">{format(new Date(record.clockOutTime), "hh:mm a")}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* History Table */}
          <Card className="glass-card obsidian-gradient-border border-none shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-black/20">
              <CardTitle>Attendance History (Last 30 Days)</CardTitle>
              <CardDescription>A record of your recent shifts and status.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-medium">Date</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Clock In</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Clock Out</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.length === 0 ? (
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No history found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    history.map((h) => (
                      <TableRow key={h.id} className="border-white/10 hover:bg-white/5 transition-colors">
                        <TableCell className="font-medium">
                          {format(new Date(h.date), "MMM do, yyyy")}
                        </TableCell>
                        <TableCell>
                          {h.clockInTime ? format(new Date(h.clockInTime), "hh:mm a") : "-"}
                        </TableCell>
                        <TableCell>
                          {h.clockOutTime ? format(new Date(h.clockOutTime), "hh:mm a") : "-"}
                        </TableCell>
                        <TableCell>
                          {h.status === "PRESENT" ? (
                            <Badge variant="outline" className="border-green-500/50 text-green-400 bg-green-500/10">Present</Badge>
                          ) : h.status === "LATE" ? (
                            <Badge variant="outline" className="border-amber-500/50 text-amber-400 bg-amber-500/10 flex items-center gap-1 w-fit">
                              <AlertCircle className="w-3 h-3" /> Late
                            </Badge>
                          ) : h.status === "ABSENT" ? (
                            <Badge variant="outline" className="border-red-500/50 text-red-400 bg-red-500/10">Absent</Badge>
                          ) : (
                            <Badge variant="outline" className="border-blue-500/50 text-blue-400 bg-blue-500/10">Half Day</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
