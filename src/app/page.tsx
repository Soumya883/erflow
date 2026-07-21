export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the OfficeFlow ERP system.
        </p>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Placeholder Metric</h3>
            <div className="mt-2 text-2xl font-bold">---</div>
          </div>
        ))}
      </div>
    </div>
  );
}
