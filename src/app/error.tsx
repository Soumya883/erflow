"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Next.js Error Boundary Caught:", error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="max-w-md w-full border border-red-500/20 bg-red-500/10 p-6 rounded-2xl text-center space-y-4 shadow-sm">
        <div className="h-12 w-12 bg-red-500 text-white rounded-xl mx-auto flex items-center justify-center font-bold text-2xl">
          !
        </div>
        <h1 className="text-xl font-bold text-foreground">Something went wrong</h1>
        <p className="text-sm text-red-500 font-mono bg-background p-3 rounded-xl border border-red-500/20 text-left overflow-x-auto whitespace-pre-wrap">
          {error.message || "An unexpected error occurred."}
        </p>
        
        {error.message?.includes("prisma") || error.message?.includes("database") ? (
          <div className="text-sm text-muted-foreground text-left mt-4 space-y-2">
            <p><strong>Database Connection Issue Detected</strong></p>
            <p>This usually means your <code>DATABASE_URL</code> environment variable is missing or incorrect in Vercel.</p>
            <p>Please check your Vercel Dashboard &gt; Settings &gt; Environment Variables.</p>
          </div>
        ) : null}

        <Button onClick={() => reset()} variant="default" className="w-full mt-4">
          Try again
        </Button>
      </div>
    </div>
  );
}
