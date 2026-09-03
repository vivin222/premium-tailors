const fs = require('fs');
let c = fs.readFileSync('src/app/track/[id]/page.tsx','utf8');
c = c.replace(/\\`/g, '`');
fs.writeFileSync('src/app/track/[id]/page.tsx', c);
