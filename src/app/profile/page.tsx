import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { User, Mail, Briefcase, Building, Calendar, DollarSign, Edit, Target, TrendingUp } from "lucide-react";
import Link from "next/link";
import { CreateGoalModal } from "@/components/hr/CreateGoalModal";
import { UpdateGoalModal } from "@/components/hr/UpdateGoalModal";
import { EditGoalModal } from "@/components/hr/EditGoalModal";

export default async function ProfilePage() {
  const user = await requireAuth();

  const profile = await prisma.employeeProfile.findUnique({
    where: { userId: user.id },
    include: {
      department: true,
      user: true,
      assetAssignments: {
        where: { returnedDate: null },
        include: { asset: true }
      },
      goals: {
        orderBy: { createdAt: "desc" }
      },
      performanceReviews: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
        <h1 className="text-3xl font-bold">Profile Not Found</h1>
        <p className="text-muted-foreground">Your employee profile has not been fully set up.</p>
      </div>
    );
  }

  const joinDate = new Date(profile.joinDate).toLocaleDateString("en-IN", {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your personal information.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <User className="h-12 w-12" />
            </div>
            <h2 className="text-xl font-bold">{profile.user.name}</h2>
            <p className="text-sm text-muted-foreground">{profile.position}</p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              {profile.user.role}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border bg-secondary/30 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Personal Details</h3>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                    <Mail className="h-4 w-4" /> Email Address
                  </dt>
                  <dd className="text-sm text-foreground font-medium">{profile.user.email}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                    <Building className="h-4 w-4" /> Department
                  </dt>
                  <dd className="text-sm text-foreground font-medium">{profile.department?.name || "N/A"}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4" /> Join Date
                  </dt>
                  <dd className="text-sm text-foreground font-medium">{joinDate}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4" /> Base Salary
                  </dt>
                  <dd className="text-sm text-foreground font-medium">
                    {profile.salary ? `₹${profile.salary.toLocaleString('en-IN')}` : "Not Disclosed"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border bg-secondary/30 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Assigned Assets</h3>
            </div>
            <div className="p-0">
              {profile.assetAssignments.length > 0 ? (
                <ul className="divide-y divide-border">
                  {profile.assetAssignments.map(assignment => (
                    <li key={assignment.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="font-medium text-foreground">{assignment.asset.name}</div>
                        <div className="text-sm text-muted-foreground mt-0.5">
                          Assigned: {new Date(assignment.assignedDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                        {assignment.asset.category}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  <p>No assets currently assigned.</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border bg-secondary/30 flex justify-between items-center">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                My Goals
              </h3>
              <CreateGoalModal employeeId={profile.id} />
            </div>
            <div className="p-0">
              {profile.goals.length > 0 ? (
                <ul className="divide-y divide-border">
                  {profile.goals.map(goal => (
                    <li key={goal.id} className="p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                          <div className="font-medium text-foreground text-lg">{goal.title}</div>
                          {goal.description && <div className="text-sm text-muted-foreground mt-1">{goal.description}</div>}
                          {goal.dueDate && (
                            <div className="text-xs text-muted-foreground mt-2">
                              Due: {new Date(goal.dueDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            goal.status === "COMPLETED" ? "bg-emerald-100 text-emerald-800" :
                            goal.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-800" :
                            goal.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {goal.status.replace("_", " ")}
                          </span>
                          <EditGoalModal goal={JSON.parse(JSON.stringify(goal))} />
                          <UpdateGoalModal 
                            goalId={goal.id} 
                            currentProgress={goal.progress} 
                            currentStatus={goal.status} 
                            goalTitle={goal.title}
                          />
                        </div>
                      </div>
                      
                      <div className="w-full bg-secondary rounded-full h-2.5 mt-2">
                        <div 
                          className={`h-2.5 rounded-full ${goal.progress === 100 ? 'bg-emerald-500' : 'bg-primary'}`} 
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-right text-xs font-medium text-muted-foreground">{goal.progress}% Completed</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  <p>No goals set currently.</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border bg-secondary/30 flex justify-between items-center">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Performance Appraisals
              </h3>
            </div>
            <div className="p-0">
              {profile.performanceReviews.length > 0 ? (
                <ul className="divide-y divide-border">
                  {profile.performanceReviews.map(review => (
                    <li key={review.id} className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold">{review.reviewPeriod}</span>
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-muted-foreground/30 fill-current'}`} viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{review.comments}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  <p>No performance reviews available yet.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
