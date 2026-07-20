"use client";

import { useState } from "react";
import { loginAction } from "@/app/actions/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);
    
    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1326] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 mb-6 shadow-lg shadow-primary/20 accent-glow-primary">
            <span className="text-3xl font-bold text-white">S</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Sushvine Private Limited</h1>
          <p className="text-muted-foreground">Sign in to your enterprise workspace</p>
        </div>

        <div className="glass-card obsidian-gradient-border border-none p-8 rounded-2xl shadow-2xl relative">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-muted-foreground">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="name@sushvine.com" 
                  required 
                  className="pl-10 bg-black/20 border-white/10 focus:border-primary/50 text-white h-12 rounded-xl transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-muted-foreground">Password</Label>
                <a href="#" className="text-sm text-primary hover:text-primary/80 transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  className="pl-10 bg-black/20 border-white/10 focus:border-primary/50 text-white h-12 rounded-xl transition-all"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full h-12 bg-primary text-on-primary hover:bg-primary/90 font-semibold rounded-xl text-lg flex items-center justify-center gap-2 transition-all hover:gap-3 accent-glow-primary"
            >
              {loading ? "Authenticating..." : "Sign In"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Secure ERP System by Sushvine Private Limited &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
