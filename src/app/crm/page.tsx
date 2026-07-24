import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { AddLeadModal } from "@/components/crm/AddLeadModal";
import { AddClientModal } from "@/components/crm/AddClientModal";
import { UpdateClientModal } from "@/components/crm/UpdateClientModal";
import { LeadBoard } from "@/components/crm/LeadBoard";
import { Users, Building, Mail, MapPin } from "lucide-react";

export default async function CRMPage() {
  await requireAuth(["ADMIN", "MANAGER"]);

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" }
  });

  const clients = await prisma.client.findMany({
    include: {
      invoices: true
    },
    orderBy: { name: "asc" }
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">CRM & Clients</h1>
          <p className="text-muted-foreground mt-1">
            Manage your sales pipeline and client relationships.
          </p>
        </div>
        <div className="flex gap-3">
          <AddLeadModal />
          <AddClientModal />
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Sales Pipeline
          </h2>
          <LeadBoard leads={leads} />
        </div>

        <div className="pt-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Client Database
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map(client => (
              <div key={client.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all relative group">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <UpdateClientModal client={client} />
                </div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold pr-8">{client.company}</h3>
                    <p className="text-sm font-medium text-muted-foreground">{client.name}</p>
                  </div>
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    {client.company.charAt(0)}
                  </div>
                </div>
                
                <div className="space-y-2 mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  {client.address && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{client.address}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Invoices</span>
                  <span className="font-bold">{client.invoices.length}</span>
                </div>
              </div>
            ))}
            
            {clients.length === 0 && (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-2xl">
                <Building className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-foreground">No Clients Yet</h3>
                <p className="text-muted-foreground mt-1 mb-4">Convert a lead or add a client manually.</p>
                <AddClientModal />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
