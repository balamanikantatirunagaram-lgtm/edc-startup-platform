const fs = require('fs');

let schema = fs.readFileSync('schema.sql', 'utf8');
const lines = schema.split('\n');

const out = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // match CREATE POLICY "name" ON table
  const match = line.match(/^CREATE POLICY "([^"]+)" ON ([\w\.]+)/i);
  if (match) {
    const policyName = match[1];
    const tableName = match[2];
    
    // Check if the previous line is already a DROP POLICY for this name
    const prevLine = out[out.length - 1] || "";
    if (!prevLine.includes(`DROP POLICY IF EXISTS "${policyName}" ON ${tableName};`)) {
      out.push(`DROP POLICY IF EXISTS "${policyName}" ON ${tableName};`);
    }
  }
  
  // also check multi-line CREATE POLICY without ON table on the same line?
  // Our grep showed some like: CREATE POLICY "Students can register for events"
  // Let's handle them:
  const match2 = line.match(/^CREATE POLICY "([^"]+)"\s*$/i);
  if (match2) {
    const policyName = match2[1];
    // the ON table part is on the next line
    const nextLine = lines[i+1];
    const onMatch = nextLine.match(/^\s*ON ([\w\.]+)/i);
    if (onMatch) {
      const tableName = onMatch[1];
      const prevLine = out[out.length - 1] || "";
      if (!prevLine.includes(`DROP POLICY IF EXISTS "${policyName}" ON ${tableName};`)) {
        out.push(`DROP POLICY IF EXISTS "${policyName}" ON ${tableName};`);
      }
    }
  }
  
  out.push(line);
}

fs.writeFileSync('/Users/balaaa/.gemini/antigravity-cli/brain/9fcd6370-2e26-423e-bc49-09f40fcf73f6/final_schema_pure.sql', out.join('\n'));
