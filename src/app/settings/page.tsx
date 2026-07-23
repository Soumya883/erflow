import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/settings/SettingsForm";

export default async function SettingsPage() {
  await requireAuth(["ADMIN"]);

  let settings = await prisma.systemSettings.findFirst();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">System Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure global system parameters.
        </p>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  );
}
