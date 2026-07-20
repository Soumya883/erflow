"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings2, Shield, Bell, User, Paintbrush, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getMeAction } from "@/app/actions/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Tab = "profile" | "security" | "notifications" | "appearance";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const session = await getMeAction();
        setUser(session);
      } catch (e) {
        toast.error("Failed to load user data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 bg-transparent relative">
        {/* Ambient glow in background */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-white">
                <div className="p-2 bg-primary/20 rounded-xl">
                  <Settings2 className="h-7 w-7 text-primary" />
                </div>
                Settings
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your account settings and ERFlow preferences.
              </p>
            </div>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 accent-glow-primary">
              Save Changes
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 space-y-2">
              <nav className="flex flex-col space-y-2">
                {[
                  { id: "profile", label: "Profile", icon: User },
                  { id: "security", label: "Security", icon: Shield },
                  { id: "notifications", label: "Notifications", icon: Bell },
                  { id: "appearance", label: "Appearance", icon: Paintbrush },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <Button
                      key={tab.id}
                      variant={isActive ? "secondary" : "ghost"}
                      onClick={() => setActiveTab(tab.id as Tab)}
                      className={cn(
                        "justify-start gap-3 rounded-xl transition-all duration-300",
                        isActive ? "bg-primary/20 text-primary hover:bg-primary/30" : "text-muted-foreground hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <tab.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                      {tab.label}
                    </Button>
                  );
                })}
              </nav>
            </div>
            
            <div className="col-span-1 md:col-span-3 space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="relative">
                  {activeTab === "profile" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards space-y-6">
                      <Card className="glass-card obsidian-gradient-border border-none shadow-xl">
                        <CardHeader className="border-b border-white/5 bg-black/10">
                          <CardTitle className="text-white">Profile</CardTitle>
                          <CardDescription className="text-muted-foreground">
                            This is how others will see you on the platform.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-muted-foreground">Display Name</Label>
                            <Input id="name" defaultValue={`${user?.firstName || ""} ${user?.lastName || ""}`.trim()} className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary/50" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-muted-foreground">Email Address</Label>
                            <Input id="email" type="email" defaultValue={user?.email || ""} disabled className="bg-black/20 border-white/5 text-muted-foreground rounded-xl opacity-70" />
                            <p className="text-xs text-muted-foreground">
                              Your email is locked and managed by your organization.
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="role" className="text-muted-foreground">System Role</Label>
                            <Select defaultValue={user?.role || "EMPLOYEE"}>
                              <SelectTrigger disabled className="bg-black/20 border-white/5 text-muted-foreground rounded-xl opacity-70">
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ADMIN">Administrator</SelectItem>
                                <SelectItem value="HR">HR Manager</SelectItem>
                                <SelectItem value="EMPLOYEE">Employee</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="glass-card obsidian-gradient-border border-none shadow-xl">
                        <CardHeader className="border-b border-white/5 bg-black/10">
                          <CardTitle className="text-white">Organization Settings</CardTitle>
                          <CardDescription className="text-muted-foreground">
                            Configure the global defaults for the ERFlow operating system.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                          <div className="space-y-2">
                            <Label htmlFor="orgName" className="text-muted-foreground">Organization Name</Label>
                            <Input id="orgName" defaultValue="Sushvine Private Limited" className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary/50" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="timezone" className="text-muted-foreground">Default Timezone</Label>
                            <Select defaultValue="ist">
                              <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary/50">
                                <SelectValue placeholder="Select timezone" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ist">Asia/Kolkata (IST)</SelectItem>
                                <SelectItem value="utc">UTC (Coordinated Universal Time)</SelectItem>
                                <SelectItem value="est">America/New_York (EST)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {activeTab === "security" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards space-y-6">
                      <Card className="glass-card obsidian-gradient-border border-none shadow-xl">
                        <CardHeader className="border-b border-white/5 bg-black/10">
                          <CardTitle className="text-white">Security Settings</CardTitle>
                          <CardDescription className="text-muted-foreground">
                            Update your password and manage two-factor authentication.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                          <div className="space-y-2">
                            <Label htmlFor="current-password" className="text-muted-foreground">Current Password</Label>
                            <Input id="current-password" type="password" className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary/50" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-password" className="text-muted-foreground">New Password</Label>
                            <Input id="new-password" type="password" className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary/50" />
                          </div>
                          <div className="pt-2">
                            <Button variant="secondary" className="bg-white/10 text-white hover:bg-white/20 rounded-xl">
                              Update Password
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {activeTab === "notifications" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards space-y-6">
                      <Card className="glass-card obsidian-gradient-border border-none shadow-xl">
                        <CardHeader className="border-b border-white/5 bg-black/10">
                          <CardTitle className="text-white">Notification Preferences</CardTitle>
                          <CardDescription className="text-muted-foreground">
                            Choose what you get notified about and how.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                           <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5">
                             <div className="space-y-0.5">
                               <Label className="text-base text-white">Email Alerts</Label>
                               <p className="text-sm text-muted-foreground">Receive daily attendance reports via email.</p>
                             </div>
                             <div className="h-6 w-11 rounded-full bg-primary relative cursor-pointer shadow-lg shadow-primary/20">
                               <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white transition-transform" />
                             </div>
                           </div>
                           <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5">
                             <div className="space-y-0.5">
                               <Label className="text-base text-white">System Announcements</Label>
                               <p className="text-sm text-muted-foreground">Get notified about new features and updates.</p>
                             </div>
                             <div className="h-6 w-11 rounded-full bg-primary relative cursor-pointer shadow-lg shadow-primary/20">
                               <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white transition-transform" />
                             </div>
                           </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {activeTab === "appearance" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards space-y-6">
                      <Card className="glass-card obsidian-gradient-border border-none shadow-xl">
                        <CardHeader className="border-b border-white/5 bg-black/10">
                          <CardTitle className="text-white">Appearance</CardTitle>
                          <CardDescription className="text-muted-foreground">
                            Customize the look and feel of your ERFlow dashboard.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                          <div className="space-y-2">
                            <Label className="text-muted-foreground">Theme Preference</Label>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="border-2 border-primary bg-primary/10 rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer">
                                <div className="h-12 w-full rounded-md bg-[#0b1326] border border-white/10 flex items-center justify-center shadow-lg">
                                  <div className="h-4 w-4 rounded-full bg-primary" />
                                </div>
                                <span className="text-white font-medium">Obsidian Dark (Active)</span>
                              </div>
                              <div className="border border-white/10 bg-white/5 rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
                                <div className="h-12 w-full rounded-md bg-white border border-gray-200 flex items-center justify-center">
                                  <div className="h-4 w-4 rounded-full bg-gray-400" />
                                </div>
                                <span className="text-white font-medium">Light Mode</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
