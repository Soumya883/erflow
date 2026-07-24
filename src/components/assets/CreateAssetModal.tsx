"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, MonitorSmartphone } from "lucide-react";
import { toast } from "sonner";
import { createAsset } from "@/app/actions/assets";

export function CreateAssetModal() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      serialNumber: formData.get("serialNumber") as string,
      category: formData.get("category") as "LAPTOP" | "FURNITURE" | "PERIPHERAL" | "SOFTWARE" | "OTHER",
      value: formData.get("value") ? parseFloat(formData.get("value") as string) : 0,
    };

    try {
      const res = await createAsset(data);
      if (res.error) throw new Error(res.error);
      
      toast.success("Asset created successfully");
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
        <Button className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" />
          Add Asset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <div className="px-6 pt-6 pb-4 bg-primary/5">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <MonitorSmartphone className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold">Add New Asset</DialogTitle>
          </DialogHeader>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Asset Name</label>
            <Input name="name" required placeholder="e.g. MacBook Pro M3" className="rounded-xl" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <select 
              name="category" 
              required
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="LAPTOP">Laptop / Computer</option>
              <option value="PERIPHERAL">Peripheral (Mouse, Keyboard, Monitor)</option>
              <option value="FURNITURE">Office Furniture</option>
              <option value="SOFTWARE">Software License</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Serial Number (Optional)</label>
            <Input name="serialNumber" placeholder="e.g. C02XABCDXYZ" className="rounded-xl" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Estimated Value (₹) (Optional)</label>
            <Input name="value" type="number" min="0" step="0.01" placeholder="e.g. 150000" className="rounded-xl" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Description (Optional)</label>
            <Input name="description" placeholder="Additional details..." className="rounded-xl" />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="rounded-xl">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Asset
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
