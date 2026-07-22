"use client";

import { useState } from "react";
import { createDocument } from "@/app/actions/documents";
import { toast } from "sonner";
import { Loader2, X, Upload } from "lucide-react";

export function CreateDocumentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      await createDocument(formData);
      toast.success("Document added successfully");
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to add document");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Upload className="h-4 w-4" />
        Add Document Link
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-lg border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add Document</h2>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Document Name</label>
                <input type="text" name="name" required placeholder="Employee Handbook" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Document URL</label>
                <input type="url" name="fileUrl" required placeholder="https://docs.google.com/..." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring" />
                <p className="text-xs text-muted-foreground mt-1">Provide a link to the document (e.g. Google Drive, Notion, etc.)</p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Add Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
