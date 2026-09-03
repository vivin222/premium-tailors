const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/app/book/page.tsx',
  'src/app/shopkeeper/page.tsx',
  'src/app/shopkeeper/bookings/page.tsx',
  'src/app/shopkeeper/bookings/[id]/page.tsx',
  'src/app/shopkeeper/appointments/page.tsx',
  'src/app/shopkeeper/customers/page.tsx',
  'src/app/shopkeeper/customers/[id]/page.tsx',
  'src/app/track/[id]/page.tsx'
];

filesToUpdate.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let changed = false;
  
  // Add import if not exists
  if (content.includes('new Date(') && !content.includes('parseSafeDate')) {
    const importStmt = `import { parseSafeDate, formatApptDate, formatCreatedDate } from '@/lib/format'\n`;
    
    // Find last import
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const endOfImport = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, endOfImport + 1) + importStmt + content.slice(endOfImport + 1);
    } else {
      content = importStmt + content;
    }
    changed = true;
  }
  
  // Custom manual replacements for specific cases
  
  // book/page.tsx
  if (file.includes('book/page.tsx')) {
    content = content.replace(/new Date\(formData.date\)\.toLocaleDateString\('en-US',\s*\{[^}]+\}\)/g, "formatApptDate(formData.date, 'long')");
    changed = true;
  }

  // shopkeeper/page.tsx
  if (file.includes('shopkeeper/page.tsx')) {
    // Actually no new Date parsing for display here, just string match for today
  }

  // shopkeeper/bookings/page.tsx
  if (file.includes('shopkeeper/bookings/page.tsx')) {
    content = content.replace(/new Date\(b\.appointment_date\)\.toLocaleDateString\(\)/g, "formatApptDate(b.appointment_date)");
    content = content.replace(/new Date\(b\.created_at\)/g, "parseSafeDate(b.created_at)");
    content = content.replace(/new Date\(a\.created_at\)/g, "parseSafeDate(a.created_at)");
    // fix the sorting logic date parsing
    content = content.replace(/new Date\(a\.appointment_date \+ 'T' \+ \(/g, "parseSafeDate(a.appointment_date).setHours(");
    content = content.replace(/new Date\(b\.appointment_date \+ 'T' \+ \(/g, "parseSafeDate(b.appointment_date).setHours(");
    changed = true;
  }

  // shopkeeper/bookings/[id]/page.tsx
  if (file.includes('shopkeeper/bookings/[id]/page.tsx')) {
    content = content.replace(/new Date\(booking\.appointment_date\)\.toLocaleDateString\('en-US',\s*\{[^}]+\}\)/g, "formatApptDate(booking.appointment_date, 'long')");
    content = content.replace(/new Date\(booking\.created_at\)\.toLocaleDateString\(\)/g, "formatCreatedDate(booking.created_at)");
    changed = true;
  }

  // shopkeeper/appointments/page.tsx
  if (file.includes('shopkeeper/appointments/page.tsx')) {
    content = content.replace(/new Date\(b\.appointment_date\)\.toLocaleDateString\('en-US',\s*\{[^}]+\}\)/g, "formatApptDate(b.appointment_date, 'long')");
    content = content.replace(/new Date\(a\.appointment_date\)\.getTime\(\)/g, "parseSafeDate(a.appointment_date).getTime()");
    content = content.replace(/new Date\(b\.appointment_date\)\.getTime\(\)/g, "parseSafeDate(b.appointment_date).getTime()");
    changed = true;
  }

  // shopkeeper/customers/page.tsx
  if (file.includes('shopkeeper/customers/page.tsx')) {
    content = content.replace(/new Date\(c\.latest_booking_date\)\.toLocaleDateString\(\)/g, "formatCreatedDate(c.latest_booking_date)");
    changed = true;
  }

  // shopkeeper/customers/[id]/page.tsx
  if (file.includes('shopkeeper/customers/[id]/page.tsx')) {
    content = content.replace(/new Date\(customer\.created_at\)\.toLocaleDateString\(\)/g, "formatCreatedDate(customer.created_at)");
    content = content.replace(/new Date\(b\.appointment_date\)\.toLocaleDateString\(\)/g, "formatApptDate(b.appointment_date)");
    changed = true;
  }

  // track/[id]/page.tsx
  if (file.includes('track/[id]/page.tsx')) {
    content = content.replace(/new Date\(booking\.appointment_date\)\.toLocaleDateString\('en-US',\s*\{[^}]+\}\)/g, "formatApptDate(booking.appointment_date, 'long')");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(fullPath, content);
    console.log('Fixed dates in', file);
  }
});
