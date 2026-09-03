export function parseSafeDate(dateInput: any): Date {
  if (!dateInput) return new Date();
  
  if (typeof dateInput === 'string') {
    // Exact YYYY-MM-DD match (e.g., appointment_date)
    // We split and parse in local timezone to avoid UTC shift
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      const [y, m, d] = dateInput.split('-');
      return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    }
    
    // SQLite timestamp (YYYY-MM-DD HH:MM:SS) usually UTC
    // Safari does not support spaces in date strings.
    if (dateInput.includes(' ') && !dateInput.includes('T')) {
      const isoStr = dateInput.replace(' ', 'T') + 'Z';
      const d = new Date(isoStr);
      if (!isNaN(d.getTime())) return d;
    }
  }
  
  // Fallback for standard ISO strings or timestamps
  const d = new Date(dateInput);
  return isNaN(d.getTime()) ? new Date() : d;
}

export function formatApptDate(dateInput: any, format: 'short' | 'long' = 'short') {
  const d = parseSafeDate(dateInput);
  if (format === 'long') {
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
  return d.toLocaleDateString('en-US');
}

export function formatCreatedDate(dateInput: any) {
  const d = parseSafeDate(dateInput);
  return d.toLocaleDateString('en-US');
}
