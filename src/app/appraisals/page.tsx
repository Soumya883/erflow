import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { CreateReviewModal } from "@/components/hr/CreateReviewModal";
import { TrendingUp, User, Calendar } from "lucide-react";
import Link from "next/link";

export default async function AppraisalsPage() {
  await requireAuth(["ADMIN", "MANAGER"]);

  const reviews = await prisma.performanceReview.findMany({
    include: {
      employee: { include: { user: true } },
      reviewer: { include: { user: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const employees = await prisma.employeeProfile.findMany({
    include: { user: true },
    orderBy: { user: { name: "asc" } }
  });
  
  const employeeOptions = employees.map(emp => ({ id: emp.id, name: emp.user.name }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Performance Appraisals</h1>
          <p className="text-muted-foreground mt-1">
            Conduct and track employee performance reviews.
          </p>
        </div>
        <CreateReviewModal employees={employeeOptions} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col sm:flex-row gap-6 transition-all hover:shadow-md">
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{review.employee.user.name}</h3>
                    <p className="text-sm text-muted-foreground">{review.reviewPeriod}</p>
                  </div>
                </div>
                
                <div className="flex gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-5 h-5 ${i < review.rating ? 'fill-current' : 'text-muted-foreground/30 fill-current'}`} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-xl text-sm whitespace-pre-wrap">
                {review.comments}
              </div>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Reviewed by {review.reviewer.user.name}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-2xl">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground">No Reviews Found</h3>
            <p className="text-muted-foreground mt-1 mb-4">Start by conducting your first performance review.</p>
            <CreateReviewModal employees={employeeOptions} />
          </div>
        )}
      </div>
    </div>
  );
}
