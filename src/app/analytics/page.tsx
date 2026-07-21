import { requireAuth } from "@/lib/rbac";

export default async function AnalyticsPage() {
  // Only ADMIN and MANAGER can access Analytics
  await requireAuth(["ADMIN", "MANAGER"]);

  return (
    <div className="space-y-6 flex flex-col h-[80vh]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Company-wide insights and reporting.
        </p>
      </div>

      <div className="flex-1 rounded-2xl border border-border bg-card p-6 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="rounded-full bg-primary/10 p-4 mb-4">
          <svg
            className=" h-8 w-8 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2 text-foreground">Analytics Dashboard Coming Soon</h2>
        <p className="text-muted-foreground max-w-md">
          We are currently connecting the Recharts engine to the new database models.
          Soon, you'll see beautiful visualizations of company growth, task completion rates, and attendance trends here.
        </p>
      </div>
    </div>
  );
}
