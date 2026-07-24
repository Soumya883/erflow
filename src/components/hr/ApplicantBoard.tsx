"use client";

import { useState } from "react";
import { User, Mail, Phone, ExternalLink, MoreVertical } from "lucide-react";
import { updateApplicantStatus } from "@/app/actions/hr";
import { toast } from "sonner";
import { AddApplicantModal } from "./AddApplicantModal";
import { UpdateApplicantModal } from "./UpdateApplicantModal";

type Applicant = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  resumeUrl: string | null;
  status: string;
};

type Job = {
  id: string;
  title: string;
  applicants: Applicant[];
};

const STAGES = [
  { id: "APPLIED", label: "Applied", color: "bg-gray-100 text-gray-800" },
  { id: "SCREENING", label: "Screening", color: "bg-blue-100 text-blue-800" },
  { id: "INTERVIEW", label: "Interview", color: "bg-purple-100 text-purple-800" },
  { id: "OFFERED", label: "Offered", color: "bg-amber-100 text-amber-800" },
  { id: "HIRED", label: "Hired", color: "bg-emerald-100 text-emerald-800" },
  { id: "REJECTED", label: "Rejected", color: "bg-red-100 text-red-800" },
];

export function ApplicantBoard({ job }: { job: Job }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusChange = async (applicantId: string, newStatus: any) => {
    setLoadingId(applicantId);
    try {
      const res = await updateApplicantStatus(applicantId, newStatus);
      if (res.error) throw new Error(res.error);
      toast.success("Status updated");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className="font-semibold text-lg">{job.title} Applicants</h3>
        <AddApplicantModal jobId={job.id} jobTitle={job.title} />
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
        {STAGES.map(stage => {
          const stageApplicants = job.applicants.filter(a => a.status === stage.id);
          
          return (
            <div key={stage.id} className="min-w-[300px] flex-1 bg-muted/30 rounded-2xl p-4 snap-center shrink-0">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-sm uppercase tracking-wider">{stage.label}</h4>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${stage.color}`}>
                  {stageApplicants.length}
                </span>
              </div>
              
              <div className="space-y-3">
                {stageApplicants.map(applicant => (
                  <div key={applicant.id} className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-all relative group">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-foreground">{applicant.name}</div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <UpdateApplicantModal applicant={applicant} jobs={[]} />
                        <select 
                          className="text-xs bg-muted border-none rounded p-1 cursor-pointer"
                          value={applicant.status}
                          onChange={(e) => handleStatusChange(applicant.id, e.target.value)}
                          disabled={loadingId === applicant.id}
                        >
                          {STAGES.map(s => (
                            <option key={s.id} value={s.id}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 mt-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{applicant.email}</span>
                      </div>
                      {applicant.phone && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{applicant.phone}</span>
                        </div>
                      )}
                      {applicant.resumeUrl && (
                        <a 
                          href={applicant.resumeUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-2 text-xs text-primary hover:underline mt-2 pt-2 border-t border-border"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Resume
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                
                {stageApplicants.length === 0 && (
                  <div className="text-center py-6 border-2 border-dashed border-border rounded-xl">
                    <span className="text-xs text-muted-foreground">No applicants</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
