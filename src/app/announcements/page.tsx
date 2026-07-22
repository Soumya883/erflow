import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { CreateAnnouncementModal } from "@/components/announcements/CreateAnnouncementModal";
import { formatDistanceToNow } from "date-fns";

export default async function AnnouncementsPage() {
  const user = await requireAuth();

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        include: { user: true }
      }
    }
  });

  const canCreate = user.role === "ADMIN" || user.role === "MANAGER";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Announcements</h1>
          <p className="text-muted-foreground mt-1">
            Company news, updates, and important information.
          </p>
        </div>
        {canCreate && <CreateAnnouncementModal />}
      </div>

      {announcements.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[40vh] border border-border rounded-2xl bg-card">
          <p className="text-muted-foreground">No announcements have been published yet.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {announcements.map(announcement => (
            <div key={announcement.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">{announcement.title}</h2>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
                </span>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none mb-6 whitespace-pre-wrap">
                {announcement.content}
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-border mt-4">
                {announcement.author.avatarUrl ? (
                  <img src={announcement.author.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {announcement.author.user.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">{announcement.author.user.name}</p>
                  <p className="text-xs text-muted-foreground">{announcement.author.jobTitle || 'HR Team'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
