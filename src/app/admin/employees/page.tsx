import { Sidebar } from "@/components/sidebar";
import { EmployeeDirectory } from "@/components/employee-directory";
import { AddEmployeeModal } from "@/components/add-employee-modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EmployeesPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 bg-muted/20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
            <p className="text-muted-foreground mt-1">
              Manage your workforce, assign roles, and track departments.
            </p>
          </div>
          <AddEmployeeModal />
        </div>

        <div className="grid gap-6">
          <Card className="glass-card obsidian-gradient-border border-none shadow-xl">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-6 border-b border-white/5 bg-black/10">
              <div className="space-y-1">
                <CardTitle className="text-xl font-semibold flex items-center gap-2 text-white">
                  <Users className="h-5 w-5 text-primary" />
                  Employee Directory
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  A complete list of all registered personnel in ERFlow.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search employees..."
                    className="w-full bg-white/5 border-white/10 text-white pl-8 focus:border-primary/50 transition-all rounded-xl"
                  />
                </div>
                <Button variant="outline" size="icon" className="border-white/10 hover:bg-white/5 rounded-xl">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* The existing data table component which we will wrap in a nice container */}
              <div className="p-6">
                <EmployeeDirectory />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
