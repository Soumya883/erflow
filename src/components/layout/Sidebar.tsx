"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Network,
  FolderKanban,
  CheckSquare,
  Clock,
  CalendarDays,
  Megaphone,
  Files,
  CalendarRange,
  BarChart3,
  History,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navGroups = [
  {
    label: "Core",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Directory", href: "/directory", icon: Users },
      { name: "Departments", href: "/departments", icon: Network },
    ]
  },
  {
    label: "Work",
    items: [
      { name: "Projects", href: "/projects", icon: FolderKanban },
      { name: "Tasks", href: "/tasks", icon: CheckSquare },
      { name: "Calendar", href: "/calendar", icon: CalendarRange },
    ]
  },
  {
    label: "HR & People",
    items: [
      { name: "Attendance", href: "/attendance", icon: Clock },
      { name: "Leave", href: "/leave", icon: CalendarDays },
      { name: "Announcements", href: "/announcements", icon: Megaphone },
      { name: "Documents", href: "/documents", icon: Files },
    ]
  },
  {
    label: "Admin",
    items: [
      { name: "Analytics", href: "/analytics", icon: BarChart3 },
      { name: "Audit Log", href: "/audit", icon: History },
      { name: "Settings", href: "/settings", icon: Settings },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r border-border bg-sidebar px-4 py-6 sm:flex h-full overflow-y-auto">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold shadow-sm">
          OF
        </div>
        <span className="text-xl font-semibold tracking-tight text-sidebar-foreground">
          OfficeFlow
        </span>
      </div>

      <nav className="flex-1 space-y-6">
        {navGroups.map((group, groupIndex) => (
          <div key={group.label}>
            <h4 className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </h4>
            <div className="space-y-1">
              {group.items.map((item, index) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"));
                const Icon = item.icon;
                
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (groupIndex * 0.1) + (index * 0.05), duration: 0.2 }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-sidebar-accent text-primary shadow-sm"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      )}
                    >
                      <Icon className={cn("h-4 w-4 flex-shrink-0 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-foreground")} />
                      {item.name}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-8 border-t border-border pt-4">
        <Button variant="ghost" className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground rounded-xl">
          <LogOut className="h-4 w-4 text-muted-foreground" />
          Log Out
        </Button>
      </div>
    </aside>
  );
}
