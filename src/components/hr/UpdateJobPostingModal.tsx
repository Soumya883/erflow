"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Edit, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { updateJobPosting, deleteJobPosting } from "@/app/actions/hr";

export function UpdateJobPostingModal({ job, departments }: { job: any, departments: any[] }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      departmentId: formData.get("departmentId") as string,
      location: formData.get("location") as string,
      type: formData.get("type") as string,
      description: formData.get("description") as string,
      requirements: formData.get("requirements") as string,
      status: formData.get("status") as any,
    };

    try {
      const res = await updateJobPosting(job.id, data);
      if (res.error) throw new Error(res.error);
      
      toast.success("Job posting updated successfully");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this job posting?")) return;
    setIsDeleting(true);
    try {
      const res = await deleteJobPosting(job.id);
      if (res.error) throw new Error(res.error);
      toast.success("Job posting deleted");
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
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <div className="px-6 pt-6 pb-4 bg-primary/5 flex justify-between items-start">
          <DialogHeader className="w-full">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold">Edit Job Posting</DialogTitle>
          </DialogHeader>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Job Title</label>
            <Input name="title" required defaultValue={job.title} className="rounded-xl" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <select 
                name="departmentId" 
                required
                defaultValue={job.departmentId}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select 
                name="type" 
                required
                defaultValue={job.type}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input name="location" required defaultValue={job.location} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select 
                name="status" 
                required
                defaultValue={job.status}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="OPEN">Open</option>
                <option value="DRAFT">Draft</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea name="description" required defaultValue={job.description} className="rounded-xl" rows={3} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Requirements</label>
            <Textarea name="requirements" required defaultValue={job.requirements} className="rounded-xl" rows={3} />
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
