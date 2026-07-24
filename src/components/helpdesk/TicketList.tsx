"use client";

import { useState } from "react";
import { updateTicket } from "@/app/actions/helpdesk";
import { toast } from "sonner";
import { LifeBuoy, Clock, User } from "lucide-react";

export function TicketList({ tickets, employees, isAdmin }: { tickets: any[], employees: any[], isAdmin: boolean }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, status: any) => {
    setLoadingId(id);
    try {
      const res = await updateTicket(id, { status });
      if (res.error) throw new Error(res.error);
      toast.success("Ticket status updated");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleAssigneeChange = async (id: string, assigneeId: any) => {
    setLoadingId(id);
    try {
      const res = await updateTicket(id, { assigneeId: assigneeId || null });
      if (res.error) throw new Error(res.error);
      toast.success("Ticket assigned");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {tickets.map(ticket => (
        <div key={ticket.id} className="p-6 rounded-2xl border border-border bg-card shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-all">
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full tracking-wider ${
                    ticket.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                    ticket.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                    ticket.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {ticket.priority} PRIORITY
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">{ticket.category}</span>
                </div>
                <h3 className="font-bold text-lg">{ticket.title}</h3>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ticket.description}</p>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                Submitted by {ticket.author.user.name}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {new Date(ticket.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          {isAdmin ? (
            <div className="flex flex-col gap-3 min-w-[200px] border-l border-border pl-6">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <select 
                  className={`flex h-9 w-full text-xs font-bold rounded-xl px-3 py-1 cursor-pointer border-none ${
                    ticket.status === 'OPEN' ? 'bg-amber-100 text-amber-800' :
                    ticket.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                    ticket.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-gray-100 text-gray-800'
                  }`}
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                  disabled={loadingId === ticket.id}
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Assigned To</label>
                <select 
                  className="flex h-9 w-full text-xs rounded-xl border border-input bg-background px-3 py-1 cursor-pointer"
                  value={ticket.assigneeId || ""}
                  onChange={(e) => handleAssigneeChange(ticket.id, e.target.value)}
                  disabled={loadingId === ticket.id}
                >
                  <option value="">Unassigned</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.user.name}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-between items-end min-w-[150px] border-l border-border pl-6">
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                ticket.status === 'OPEN' ? 'bg-amber-100 text-amber-800' :
                ticket.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                ticket.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {ticket.status.replace("_", " ")}
              </span>
              
              <div className="text-xs text-muted-foreground mt-4 text-right">
                {ticket.assignee ? `Assigned to: ${ticket.assignee.user.name}` : 'Unassigned'}
              </div>
            </div>
          )}
        </div>
      ))}
      
      {tickets.length === 0 && (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-2xl flex flex-col items-center">
          <LifeBuoy className="h-10 w-10 mb-3 opacity-20" />
          No tickets found.
        </div>
      )}
    </div>
  );
}
