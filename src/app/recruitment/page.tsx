import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { UpdateJobPostingModal } from "@/components/hr/UpdateJobPostingModal";
import { CreateJobModal } from "@/components/hr/CreateJobModal";
import { ApplicantBoard } from "@/components/hr/ApplicantBoard";
import { Briefcase, MapPin } from "lucide-react";

export default async function RecruitmentPage() {
  await requireAuth(["ADMIN", "MANAGER"]);

  const jobs = await prisma.jobPosting.findMany({
    include: {
      department: true,
      applicants: {
        orderBy: { createdAt: "desc" }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Recruitment & ATS</h1>
          <p className="text-muted-foreground mt-1">
            Manage job postings and track applicants through the hiring pipeline.
          </p>
        </div>
        <CreateJobModal departments={departments} />
      </div>

      <div className="space-y-8">
        {jobs.map((job) => (
          <div key={job.id} className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border bg-secondary/20">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{job.title}</h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    {job.department && (
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="h-4 w-4" />
                        {job.department.name}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </div>
                    <div className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-medium text-xs">
                      {job.type}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <UpdateJobPostingModal job={job} departments={departments} />
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${job.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                    {job.isActive ? 'ACTIVE' : 'CLOSED'}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground whitespace-pre-wrap">{job.description}</p>
            </div>
            
            <div className="p-6 bg-card">
              <ApplicantBoard job={job} />
            </div>
          </div>
        ))}

        {jobs.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-2xl">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground">No Active Job Postings</h3>
            <p className="text-muted-foreground mt-1 mb-4">Create your first job posting to start tracking applicants.</p>
            <CreateJobModal departments={departments} />
          </div>
        )}
      </div>
    </div>
  );
}
