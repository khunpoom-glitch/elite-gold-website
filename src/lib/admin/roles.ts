export const adminRoles = ["admin", "super_admin"] as const;

export type AdminRole = (typeof adminRoles)[number];

export type AdminUser = {
  createdAt: string;
  email: string;
  id: string;
  isActive: boolean;
  role: AdminRole;
  userId: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function isAdminRole(value: unknown): value is AdminRole {
  return typeof value === "string" && adminRoles.includes(value as AdminRole);
}

export function canManageAdmins(role: AdminRole | null) {
  return role === "super_admin";
}

export function parseAdminUser(row: unknown): AdminUser | null {
  if (!isRecord(row) || !isAdminRole(row.role)) {
    return null;
  }

  return {
    createdAt: getString(row.created_at),
    email: getString(row.email).trim().toLowerCase(),
    id: getString(row.id),
    isActive: row.is_active === true,
    role: row.role,
    userId: getString(row.user_id),
  };
}
