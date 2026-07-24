const fs = require('fs');
const path = require('path');

const targetProps = [
  'document={',
  'department={',
  'posting={',
  'applicant={',
  'review={',
  'goal={',
  'project={',
  'task={',
  'expense={',
  'invoice={',
  'client={',
  'lead={',
  'asset={',
  'initialTasks={',
  'projects={',
  'employees={',
  'events={'
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    for (const prop of targetProps) {
      if (lines[i].includes(prop) && !lines[i].includes('JSON.parse(JSON.stringify(')) {
        // We only replace if the prop is followed by a simple variable name, like document={doc}
        // e.g. <UpdateDocumentModal document={doc} />
        const regex = new RegExp(`(${prop})([a-zA-Z0-9_]+)(})`, 'g');
        if (regex.test(lines[i])) {
          lines[i] = lines[i].replace(regex, `$1JSON.parse(JSON.stringify($2))$3`);
          changed = true;
        }
      }
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log('Fixed', filePath);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

walkDir(path.join(__dirname, 'src', 'app'));
walkDir(path.join(__dirname, 'src', 'components'));
console.log('Done');
