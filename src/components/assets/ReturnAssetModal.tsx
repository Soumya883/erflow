"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowDownToLine, Package } from "lucide-react";
import { toast } from "sonner";
import { returnAsset } from "@/app/actions/assets";

export function ReturnAssetModal({ 
  assignmentId, 
  assetName 
}: { 
  assignmentId: string;
  assetName: string;
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const notes = formData.get("notes") as string;

    try {
      const res = await returnAsset(assignmentId, notes);
      if (res.error) throw new Error(res.error);
      
      toast.success("Asset returned successfully");
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
        <Button variant="outline" size="sm" className="gap-2 rounded-lg text-amber-600 border-amber-200 hover:bg-amber-50">
          <ArrowDownToLine className="h-4 w-4" />
          Mark Returned
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <div className="px-6 pt-6 pb-4 bg-amber-50">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Package className="h-6 w-6 text-amber-600" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold text-amber-900">Return {assetName}</DialogTitle>
          </DialogHeader>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Return Notes / Condition</label>
            <Input name="notes" placeholder="Condition upon return (e.g. Scratched screen)..." className="rounded-xl" />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Return
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
