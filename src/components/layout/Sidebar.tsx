"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  CalendarDays,
  BarChart3,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Employees", href: "/employees", icon: Users },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Leave", href: "/leave", icon: CalendarDays },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r border-border bg-sidebar px-4 py-6 sm:flex h-full">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
          OF
        </div>
        <span className="text-xl font-semibold tracking-tight text-sidebar-foreground">
          OfficeFlow
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <Button variant="ghost" className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground">
          <LogOut className="h-5 w-5" />
          Log Out
        </Button>
      </div>
    </aside>
  );
}
