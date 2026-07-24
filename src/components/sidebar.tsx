"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Kanban, Settings, BarChart3, LogOut, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Employees", href: "/admin/employees", icon: Users },
  { name: "Workflows", href: "/admin/workflows", icon: Kanban },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
  { name: "My Attendance Kiosk", href: "/employee", icon: Clock },
];

import { useEffect, useState } from "react";
import { getMeAction, logoutAction } from "@/app/actions/auth";

export function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRole() {
      const session = await getMeAction();
      if (session) {
        setRole(session.role);
      }
    }
    fetchRole();
  }, []);

  // Customize navigation per role
  const finalNavigation = (() => {
    if (role === "HR") {
      return [
        { name: "Command Center", href: "/hr", icon: LayoutDashboard },
        { name: "Calendar", href: "/calendar", icon: Calendar },
        { name: "Attendance", href: "/attendance", icon: Clock },
        { name: "Employees", href: "/admin/employees", icon: Users },
        { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
        { name: "My Attendance Kiosk", href: "/employee", icon: Clock },
      ];
    }
    // Admin
    return [
      ...navigation,
      { name: "HR Command Center", href: "/hr", icon: Users }
    ];
  })();

  return (
    <div className="flex h-full w-64 flex-col border-r border-white/10 bg-[#070b14] text-white px-3 py-4 shadow-2xl">
      <div className="mb-8 px-4 flex items-center">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mr-3 shadow-lg shadow-primary/20 accent-glow-primary">
          <span className="text-white font-bold">ER</span>
        </div>
        <h2 className="text-lg font-semibold tracking-tight text-white">ERFlow</h2>
      </div>
      <nav className="flex-1 space-y-1">
        {finalNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-accent-foreground" : "text-muted-foreground group-hover:text-accent-foreground"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-4 border-t border-border/50">
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors text-destructive hover:bg-destructive/10"
          >
            <LogOut className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
            Logout
          </button>
        </form>
      </div>
    </div>
  );
}
