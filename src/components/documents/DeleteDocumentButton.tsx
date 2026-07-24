"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteDocument } from "@/app/actions/documents";

export function DeleteDocumentButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this document?`)) return;
    
    setIsDeleting(true);
    try {
      await deleteDocument(id);
      toast.success("Document deleted");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleDelete}
      disabled={isDeleting}
      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
    >
      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
