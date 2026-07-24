import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { SubmitExpenseModal } from "@/components/finance/SubmitExpenseModal";
import { CreateInvoiceModal } from "@/components/finance/CreateInvoiceModal";
import { ExpenseList, InvoiceList } from "@/components/finance/FinanceLists";
import { Receipt, FileText } from "lucide-react";

export default async function FinancePage() {
  await requireAuth(["ADMIN", "MANAGER"]);

  const expenses = await prisma.expense.findMany({
    include: { employee: { include: { user: true } } },
    orderBy: { createdAt: "desc" }
  });

  const invoices = await prisma.invoice.findMany({
    include: { client: true },
    orderBy: { createdAt: "desc" }
  });

  const clients = await prisma.client.findMany({
    orderBy: { company: "asc" },
    select: { id: true, company: true }
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Finance & Accounting</h1>
          <p className="text-muted-foreground mt-1">
            Manage company expenses and client invoicing.
          </p>
        </div>
        <div className="flex gap-3">
          <SubmitExpenseModal />
          <CreateInvoiceModal clients={clients} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Recent Expenses
          </h2>
          <ExpenseList expenses={expenses} />
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Invoices
          </h2>
          <InvoiceList invoices={invoices} clients={clients} />
        </div>
      </div>
    </div>
  );
}
