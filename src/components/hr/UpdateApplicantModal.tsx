"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Edit, User } from "lucide-react";
import { toast } from "sonner";
import { updateApplicant, deleteApplicant } from "@/app/actions/hr";

export function UpdateApplicantModal({ applicant, jobs }: { applicant: any, jobs: any[] }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string || undefined,
      resumeUrl: formData.get("resumeUrl") as string || undefined,
      source: formData.get("source") as string || undefined,
    };

    try {
      const res = await updateApplicant(applicant.id, data);
      if (res.error) throw new Error(res.error);
      
      toast.success("Applicant updated successfully");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this applicant?")) return;
    setIsDeleting(true);
    try {
      const res = await deleteApplicant(applicant.id);
      if (res.error) throw new Error(res.error);
      toast.success("Applicant deleted");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
          <Edit className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <div className="px-6 pt-6 pb-4 bg-primary/5 flex justify-between items-start">
          <DialogHeader className="w-full">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <User className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold">Edit Applicant</DialogTitle>
          </DialogHeader>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name</label>
              <Input name="firstName" required defaultValue={applicant.firstName} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name</label>
              <Input name="lastName" required defaultValue={applicant.lastName} className="rounded-xl" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input name="email" type="email" required defaultValue={applicant.email} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input name="phone" defaultValue={applicant.phone || ""} className="rounded-xl" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Resume Link (Optional)</label>
            <Input name="resumeUrl" type="url" defaultValue={applicant.resumeUrl || ""} className="rounded-xl" placeholder="https://..." />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Source (Optional)</label>
            <Input name="source" defaultValue={applicant.source || ""} className="rounded-xl" placeholder="e.g. LinkedIn, Referral" />
          </div>

          <div className="pt-4 flex justify-between items-center">
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting} className="rounded-xl bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800">
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </Button>
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="rounded-xl">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
