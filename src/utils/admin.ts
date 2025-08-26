export const getAdminEmails = (): string[] => {
  const raw = (import.meta as any).env?.VITE_ADMIN_EMAILS || '';
  return String(raw)
    .split(/[,;\s]+/)
    .map((s: string) => s.trim().toLowerCase())
    .filter((s: string) => s.length > 0);
};

export const isAdminEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  const admins = getAdminEmails();
  return admins.includes(String(email).trim().toLowerCase());
};


