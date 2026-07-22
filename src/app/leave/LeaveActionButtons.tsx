"use client";

import { useState } from "react";
import { updateLeaveStatus } from "@/app/actions/leave";
import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";

export function LeaveActionButtons({ requestId }: { requestId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (status: "APPROVED" | "REJECTED") => {
    setIsLoading(true);
    try {
      await updateLeaveStatus(requestId, status);
      toast.success(`Leave request ${status.toLowerCase()}`);
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mx-auto" />;
  }

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={() => handleAction("APPROVED")}
        className="p-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-md transition-colors"
        title="Approve"
      >
        <Check className="h-4 w-4" />
      </button>
      <button 
        onClick={() => handleAction("REJECTED")}
        className="p-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-colors"
        title="Reject"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
