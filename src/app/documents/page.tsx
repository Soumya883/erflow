import { requireAuth } from "@/lib/rbac";

export default async function Page() {
  await requireAuth();
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
      <h1 className="text-3xl font-bold">Coming Soon</h1>
      <p className="text-muted-foreground">This module is currently under development.</p>
    </div>
  );
}
