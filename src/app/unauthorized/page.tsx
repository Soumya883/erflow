import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
      <div className="p-4 bg-red-100 text-red-600 rounded-full mb-2">
        <ShieldAlert className="h-12 w-12" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">Access Denied</h1>
      <p className="text-muted-foreground max-w-md text-center">
        You do not have permission to view this page. If you believe this is an error, please contact your administrator.
      </p>
      <Link href="/" className="px-4 py-2 mt-4 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
        Return to Dashboard
      </Link>
    </div>
  );
}
