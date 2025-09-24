export const getAdminEmails = (): string[] => {
  const raw = (import.meta as any).env?.VITE_ADMIN_EMAILS || '';
  const envEmails = String(raw)
    .split(/[,;\s]+/)
    .map((s: string) => s.trim().toLowerCase())
    .filter((s: string) => s.length > 0);
  
  // Add default admin email if not already included
  const defaultAdmin = 'interel.3@gmail.com';
  if (!envEmails.includes(defaultAdmin)) {
    envEmails.push(defaultAdmin);
  }
  
  return envEmails;
};

export const isAdminEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  const admins = getAdminEmails();
  return admins.includes(String(email).trim().toLowerCase());
};


