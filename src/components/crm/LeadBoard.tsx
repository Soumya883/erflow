"use client";

import { useState } from "react";
import { updateLeadStatus } from "@/app/actions/crm";
import { toast } from "sonner";
import { UpdateLeadModal } from "./UpdateLeadModal";

type Lead = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string | null;
  value: number | null;
  status: string;
};

const STAGES = [
  { id: "NEW", label: "New Lead", color: "bg-gray-100 text-gray-800 border-gray-200" },
  { id: "CONTACTED", label: "Contacted", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { id: "QUALIFIED", label: "Qualified", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { id: "PROPOSAL", label: "Proposal Sent", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { id: "WON", label: "Won", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { id: "LOST", label: "Lost", color: "bg-red-100 text-red-800 border-red-200" },
];

export function LeadBoard({ leads }: { leads: Lead[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusChange = async (leadId: string, newStatus: any) => {
    setLoadingId(leadId);
    try {
      const res = await updateLeadStatus(leadId, newStatus);
      if (res.error) throw new Error(res.error);
      toast.success("Lead status updated");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
      {STAGES.map(stage => {
        const stageLeads = leads.filter(l => l.status === stage.id);
        const stageValue = stageLeads.reduce((acc, lead) => acc + (lead.value || 0), 0);
        
        return (
          <div key={stage.id} className={`min-w-[300px] flex-1 rounded-2xl p-4 snap-center shrink-0 border-2 ${stage.color.split(" ")[2]} bg-muted/10`}>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-sm uppercase tracking-wider">{stage.label}</h4>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stage.color}`}>
                {stageLeads.length}
              </span>
            </div>
            
            {stageValue > 0 && (
              <div className="text-xs font-bold text-muted-foreground mb-3 text-right">
                ₹{stageValue.toLocaleString()}
              </div>
            )}
            
            <div className="space-y-3">
              {stageLeads.map(lead => (
                <div key={lead.id} className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-all relative group">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-foreground pr-10">{lead.company}</div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <UpdateLeadModal lead={lead} />
                      <select 
                        className="text-xs bg-muted border-none rounded p-1 cursor-pointer"
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        disabled={loadingId === lead.id}
                      >
                        {STAGES.map(s => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 mt-2">
                    <div className="text-sm font-medium">{lead.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{lead.email}</div>
                    {lead.value && (
                      <div className="text-xs font-bold text-primary mt-2 pt-2 border-t border-border">
                        ₹{lead.value.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {stageLeads.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-border/50 rounded-xl">
                  <span className="text-xs text-muted-foreground">No leads in stage</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
