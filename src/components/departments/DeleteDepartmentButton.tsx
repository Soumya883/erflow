"use client";

import { useState } from "react";
import { deleteDepartment } from "@/app/actions/departments";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

export function DeleteDepartmentButton({ id, name, disabled }: { id: string, name: string, disabled: boolean }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete the ${name} department?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteDepartment(id);
      toast.success("Department deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete department");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={disabled || isLoading}
      title={disabled ? "Cannot delete department with employees" : "Delete department"}
      className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  );
}
