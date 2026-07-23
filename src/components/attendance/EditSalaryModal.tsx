"use client";

import { useState } from "react";
import { toast } from "sonner";
import { X, Loader2, IndianRupee } from "lucide-react";
import { updateSalary } from "@/app/actions/attendance";

export function EditSalaryModal({ 
  employeeId,
  employeeName,
  currentSalary,
  isOpen,
  onClose
}: { 
  employeeId: string;
  employeeName: string;
  currentSalary: number;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const salary = parseFloat(formData.get("salary") as string);
      
      if (isNaN(salary) || salary < 0) {
        throw new Error("Please enter a valid salary amount.");
      }

      await updateSalary(employeeId, salary);
      
      toast.success("Base salary updated successfully!");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to update salary");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-card p-8 shadow-2xl border border-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Update Salary</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium mb-1 text-muted-foreground">Employee</label>
            <div className="text-sm font-semibold">{employeeName}</div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Monthly Base Salary</label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input 
                type="number" 
                name="salary" 
                defaultValue={currentSalary}
                min="0"
                step="0.01"
                required
                className="w-full pl-9 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring" 
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-md transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
