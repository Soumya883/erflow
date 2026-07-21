const fs = require('fs');
const path = require('path');

const dirs = ['departments', 'projects', 'attendance', 'leave', 'announcements', 'documents', 'calendar', 'audit', 'settings'];

const content = `import { requireAuth } from "@/lib/rbac";

export default async function Page() {
  await requireAuth();
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
      <h1 className="text-3xl font-bold">Coming Soon</h1>
      <p className="text-muted-foreground">This module is currently under development.</p>
    </div>
  );
}
`;

dirs.forEach(dir => {
  const dirPath = path.join(__dirname, 'src', 'app', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  fs.writeFileSync(path.join(dirPath, 'page.tsx'), content);
});

console.log("Created missing pages.");
