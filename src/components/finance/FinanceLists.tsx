"use client";

import { useState } from "react";
import { updateExpenseStatus, updateInvoiceStatus } from "@/app/actions/finance";
import { toast } from "sonner";
import { Receipt, FileText } from "lucide-react";

export function ExpenseList({ expenses }: { expenses: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, status: any) => {
    setLoadingId(id);
    try {
      const res = await updateExpenseStatus(id, status);
      if (res.error) throw new Error(res.error);
      toast.success("Expense status updated");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {expenses.map(exp => (
        <div key={exp.id} className="p-4 rounded-xl border border-border bg-card flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold">{exp.title}</div>
              <div className="text-sm text-muted-foreground">{exp.employee.user.name} • {new Date(exp.date).toLocaleDateString()}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-lg font-bold">₹{exp.amount.toLocaleString()}</div>
            <select 
              className={`text-xs font-bold rounded-full px-3 py-1 cursor-pointer border-none ${
                exp.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                exp.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                exp.status === 'PAID' ? 'bg-blue-100 text-blue-800' :
                'bg-amber-100 text-amber-800'
              }`}
              value={exp.status}
              onChange={(e) => handleStatusChange(exp.id, e.target.value)}
              disabled={loadingId === exp.id}
            >
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="PAID">PAID</option>
            </select>
          </div>
        </div>
      ))}
      {expenses.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-xl">
          No expenses recorded.
        </div>
      )}
    </div>
  );
}

export function InvoiceList({ invoices }: { invoices: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, status: any) => {
    setLoadingId(id);
    try {
      const res = await updateInvoiceStatus(id, status);
      if (res.error) throw new Error(res.error);
      toast.success("Invoice status updated");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {invoices.map(inv => (
        <div key={inv.id} className="p-4 rounded-xl border border-border bg-card flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold">{inv.invoiceNo} • {inv.client.company}</div>
              <div className="text-sm text-muted-foreground">Due: {new Date(inv.dueDate).toLocaleDateString()}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-lg font-bold">₹{inv.amount.toLocaleString()}</div>
            <select 
              className={`text-xs font-bold rounded-full px-3 py-1 cursor-pointer border-none ${
                inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                inv.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                inv.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                inv.status === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
                'bg-amber-100 text-amber-800'
              }`}
              value={inv.status}
              onChange={(e) => handleStatusChange(inv.id, e.target.value)}
              disabled={loadingId === inv.id}
            >
              <option value="DRAFT">DRAFT</option>
              <option value="SENT">SENT</option>
              <option value="PAID">PAID</option>
              <option value="OVERDUE">OVERDUE</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>
      ))}
      {invoices.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-xl">
          No invoices recorded.
        </div>
      )}
    </div>
  );
}
