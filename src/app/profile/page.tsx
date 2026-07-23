import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { User, Mail, Briefcase, Building, Calendar, DollarSign, Edit } from "lucide-react";
import Link from "next/link";

export default async function ProfilePage() {
  const user = await requireAuth();

  const profile = await prisma.employeeProfile.findUnique({
    where: { userId: user.id },
    include: {
      department: true,
      user: true,
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
        </div>
      </div>
    </div>
  );
}
