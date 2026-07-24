"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Edit, CheckSquare } from "lucide-react";
import { toast } from "sonner";
import { updateTask, deleteTask } from "@/app/actions/work";

export function UpdateTaskModal({ task, projects, users, isManager }: { task: any, projects: any[], users: any[], isManager: boolean }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string || undefined,
      priority: formData.get("priority") as string,
      status: formData.get("status") as string,
      projectId: formData.get("projectId") as string || undefined,
      assigneeId: formData.get("assigneeId") as string || undefined,
      dueDate: formData.get("dueDate") ? new Date(formData.get("dueDate") as string) : undefined,
    };

    try {
      const res = await updateTask(task.id, data);
      if (res.error) throw new Error(res.error);
      
      toast.success("Task updated successfully");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    setIsDeleting(true);
    try {
      const res = await deleteTask(task.id);
      if (res.error) throw new Error(res.error);
      toast.success("Task deleted");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Only managers can edit tasks fully
  if (!isManager) return null;

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
              <CheckSquare className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold">Edit Task</DialogTitle>
          </DialogHeader>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Task Title</label>
            <Input name="title" required defaultValue={task.title} className="rounded-xl" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Description (Optional)</label>
            <Textarea name="description" defaultValue={task.description || ""} className="rounded-xl" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project (Optional)</label>
              <select 
                name="projectId" 
                defaultValue={task.projectId || ""}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">None</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Assignee (Optional)</label>
              <select 
                name="assigneeId" 
                defaultValue={task.assigneeId || ""}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.user.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <select 
                name="priority" 
                required
                defaultValue={task.priority}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select 
                name="status" 
                required
                defaultValue={task.status}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Due Date (Optional)</label>
            <Input name="dueDate" type="date" defaultValue={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ""} className="rounded-xl" />
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
