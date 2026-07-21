"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (!res?.error) {
        router.push(callbackUrl);
        router.refresh(); // Force refresh to get new session in server components
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
      <div className="p-8">
        <div className="flex justify-center mb-8">
          <div className="bg-primary text-primary-foreground font-bold text-2xl h-12 w-12 rounded-xl flex items-center justify-center shadow-md">
            OF
          </div>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-2">Sign in to your OfficeFlow account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              className="rounded-xl h-11 bg-muted/50 focus:bg-background transition-colors"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a href="#" className="text-xs text-primary hover:underline font-medium">Forgot password?</a>
            </div>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              className="rounded-xl h-11 bg-muted/50 focus:bg-background transition-colors"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium text-center">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-11 rounded-xl font-medium shadow-sm transition-all hover:shadow-md"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-background border-t-transparent animate-spin"></div>
                Signing in...
              </div>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </div>
      <div className="bg-muted/50 p-6 text-center border-t border-border">
        <p className="text-sm text-muted-foreground">
          Demo Admin: admin@sushvine.com / password
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Suspense fallback={<div className="h-96 w-full flex items-center justify-center"><div className="animate-pulse">Loading...</div></div>}>
          <LoginForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
