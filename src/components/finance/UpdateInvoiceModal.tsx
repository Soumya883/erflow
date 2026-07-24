"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Edit, FileText } from "lucide-react";
import { toast } from "sonner";
import { updateInvoice, deleteInvoice } from "@/app/actions/finance";

export function UpdateInvoiceModal({ invoice, clients }: { invoice: any, clients: any[] }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      clientId: formData.get("clientId") as string,
      invoiceNo: formData.get("invoiceNo") as string,
      amount: parseFloat(formData.get("amount") as string),
      issueDate: new Date(formData.get("issueDate") as string),
      dueDate: new Date(formData.get("dueDate") as string),
      notes: formData.get("notes") as string || undefined,
    };

    try {
      const res = await updateInvoice(invoice.id, data);
      if (res.error) throw new Error(res.error);
      
      toast.success("Invoice updated successfully");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    setIsDeleting(true);
    try {
      const res = await deleteInvoice(invoice.id);
      if (res.error) throw new Error(res.error);
      toast.success("Invoice deleted");
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
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold">Edit Invoice</DialogTitle>
          </DialogHeader>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Client</label>
            <select 
              name="clientId" 
              required
              defaultValue={invoice.clientId}
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="" disabled>Select Client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.company}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Invoice Number</label>
              <Input name="invoiceNo" required defaultValue={invoice.invoiceNo} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (₹)</label>
              <Input name="amount" type="number" step="0.01" required defaultValue={invoice.amount} className="rounded-xl" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Issue Date</label>
              <Input name="issueDate" type="date" required defaultValue={new Date(invoice.issueDate).toISOString().split('T')[0]} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Due Date</label>
              <Input name="dueDate" type="date" required defaultValue={new Date(invoice.dueDate).toISOString().split('T')[0]} className="rounded-xl" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes / Terms</label>
            <Textarea name="notes" defaultValue={invoice.notes || ""} className="rounded-xl" />
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
