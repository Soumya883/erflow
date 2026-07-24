"use client";

import { useState } from "react";
import { updateExpenseStatus, updateInvoiceStatus } from "@/app/actions/finance";
import { toast } from "sonner";
import { CheckCircle, XCircle, FileText, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";
import { UpdateExpenseModal } from "./UpdateExpenseModal";
import { UpdateInvoiceModal } from "./UpdateInvoiceModal";

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
      {expenses.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border">
          No expenses recorded yet.
        </div>
      ) : (
        expenses.map(expense => (
          <div key={expense.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-all gap-4">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                expense.status === "APPROVED" || expense.status === "PAID" 
                  ? "bg-emerald-100 text-emerald-600" 
                  : expense.status === "REJECTED"
                  ? "bg-red-100 text-red-600"
                  : "bg-amber-100 text-amber-600"
              }`}>
                <ArrowDownRight className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">{expense.title}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <span className="font-medium">{expense.category}</span>
                  <span>•</span>
                  <span>{new Date(expense.date).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{expense.employee.user.name}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
              <div className="text-right">
                <div className="font-bold text-lg">₹{expense.amount.toLocaleString()}</div>
                <div className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">{expense.status}</div>
              </div>
              
              <div className="flex items-center gap-2">
                <UpdateExpenseModal expense={JSON.parse(JSON.stringify(expense))} />
                <select 
                  className="text-sm bg-muted border-none rounded-lg p-2 cursor-pointer font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  value={expense.status}
                  onChange={(e) => handleStatusChange(expense.id, e.target.value)}
                  disabled={loadingId === expense.id}
                >
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approve</option>
                  <option value="PAID">Mark Paid</option>
                  <option value="REJECTED">Reject</option>
                </select>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export function InvoiceList({ invoices, clients }: { invoices: any[], clients: any[] }) {
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
      {invoices.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border">
          No invoices generated yet.
        </div>
      ) : (
        invoices.map(invoice => (
          <div key={invoice.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-all gap-4">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                invoice.status === "PAID" 
                  ? "bg-emerald-100 text-emerald-600" 
                  : invoice.status === "OVERDUE"
                  ? "bg-red-100 text-red-600"
                  : invoice.status === "SENT"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600"
              }`}>
                <ArrowUpRight className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">{invoice.client?.company} <span className="text-muted-foreground font-normal ml-2">#{invoice.invoiceNo}</span></h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Due {new Date(invoice.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
              <div className="text-right">
                <div className="font-bold text-lg">₹{invoice.amount.toLocaleString()}</div>
                <div className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">{invoice.status}</div>
              </div>
              
              <div className="flex items-center gap-2">
                <UpdateInvoiceModal invoice={JSON.parse(JSON.stringify(invoice))} clients={clients} />
                <select 
                  className="text-sm bg-muted border-none rounded-lg p-2 cursor-pointer font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  value={invoice.status}
                  onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                  disabled={loadingId === invoice.id}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="SENT">Mark Sent</option>
                  <option value="PAID">Mark Paid</option>
                  <option value="OVERDUE">Overdue</option>
                  <option value="CANCELLED">Cancel</option>
                </select>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
