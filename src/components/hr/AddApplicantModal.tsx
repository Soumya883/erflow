"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { addApplicant } from "@/app/actions/hr";

export function AddApplicantModal({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      jobId,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string || undefined,
      resumeUrl: formData.get("resumeUrl") as string || undefined,
      notes: formData.get("notes") as string || undefined,
    };

    try {
      const res = await addApplicant(data);
      if (res.error) throw new Error(res.error);
      
      toast.success("Applicant added successfully");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" />
          Add Applicant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <div className="px-6 pt-6 pb-4 bg-primary/5">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold">Add Applicant</DialogTitle>
            <p className="text-center text-sm text-muted-foreground mt-1">For {jobTitle}</p>
          </DialogHeader>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Candidate Name</label>
            <Input name="name" required placeholder="e.g. John Doe" className="rounded-xl" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <Input name="email" type="email" required placeholder="john@example.com" className="rounded-xl" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number (Optional)</label>
            <Input name="phone" placeholder="+1 234 567 890" className="rounded-xl" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Resume / Portfolio URL (Optional)</label>
            <Input name="resumeUrl" type="url" placeholder="https://linkedin.com/in/..." className="rounded-xl" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Initial Notes</label>
            <Textarea name="notes" placeholder="Where did they apply from?" className="rounded-xl" />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="rounded-xl">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Candidate
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
