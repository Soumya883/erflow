"use client";

import { useState } from "react";
import { clockIn, clockOut } from "@/app/actions/attendance";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function ClockInOutButton({ hasClockedIn, hasClockedOut }: { hasClockedIn: boolean, hasClockedOut: boolean }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async () => {
    setIsLoading(true);
    try {
      if (!hasClockedIn) {
        const result = await clockIn();
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Successfully clocked in for today!");
        }
      } else if (!hasClockedOut) {
        const result = await clockOut();
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Successfully clocked out for today!");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (hasClockedIn && hasClockedOut) {
    return (
      <button disabled className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 p-4 text-sm font-medium text-gray-400 cursor-not-allowed">
        Shift Completed
      </button>
    );
  }

  return (
    <button 
      onClick={handleAction}
      disabled={isLoading}
      className={`flex w-full items-center justify-center gap-2 rounded-xl p-4 text-sm font-medium transition-colors ${
        !hasClockedIn 
          ? "bg-green-100 text-green-700 hover:bg-green-200" 
          : "bg-orange-100 text-orange-700 hover:bg-orange-200"
      }`}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {!isLoading && (!hasClockedIn ? "Clock In" : "Clock Out")}
    </button>
  );
}
