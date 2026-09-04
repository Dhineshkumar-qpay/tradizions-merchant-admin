import fs from 'fs';
import path from 'path';

const searchPath = 'e:/Millets/Millets-Admin/src/pages';
const replaceStr = '<Loader2 size={32} className="animate-spin" style={{ margin: "0 auto", color: "var(--primary)" }} />';

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('<div className="circular-loader"></div>')) {
        // Replace loader
        content = content.replace(/<div className="circular-loader"><\/div>/g, replaceStr);

        // Add Loader2 to lucide-react import
        const lucideRegex = /import\s+{([^}]*)}\s+from\s+['"]lucide-react['"]/;
        if (lucideRegex.test(content)) {
          content = content.replace(lucideRegex, (match, imports) => {
            if (!imports.includes('Loader2')) {
              return `import { Loader2, ${imports.trim()} } from 'lucide-react'`;
            }
            return match;
          });
        } else {
          // Add import if missing
          content = `import { Loader2 } from 'lucide-react';\n` + content;
        }

        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir(searchPath);
