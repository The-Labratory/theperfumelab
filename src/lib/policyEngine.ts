// Centralized RBAC + ABAC Policy Engine
// All permission checks should go through this module

export type AppRole = 'super_admin' | 'admin' | 'team_admin' | 'agent' | 'user' | 'viewer';

export interface PolicyContext {
  userId: string;
  roles: AppRole[];
  teamId?: string;
  resourceOwnerId?: string;
  resourceTeamId?: string;
}

export type Permission =
  | 'system_settings:read' | 'system_settings:write'
  | 'users:read' | 'users:write' | 'users:delete'
  | 'teams:read' | 'teams:write' | 'teams:delete'
  | 'customers:read' | 'customers:write' | 'customers:impersonate'
  | 'agents:read' | 'agents:write'
  | 'audit_logs:read'
  | 'security_events:read'
  | 'billing:read' | 'billing:write'
  | 'domains:read' | 'domains:write'
  | 'apps:read' | 'apps:write'
  | 'deployments:read' | 'deployments:write'
  | 'analytics:read'
  | 'roles:read' | 'roles:write';

// Role-based permission matrix
const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  super_admin: [
    'system_settings:read', 'system_settings:write',
    'users:read', 'users:write', 'users:delete',
    'teams:read', 'teams:write', 'teams:delete',
    'customers:read', 'customers:write', 'customers:impersonate',
    'agents:read', 'agents:write',
    'audit_logs:read', 'security_events:read',
    'billing:read', 'billing:write',
    'domains:read', 'domains:write',
    'apps:read', 'apps:write',
    'deployments:read', 'deployments:write',
    'analytics:read',
    'roles:read', 'roles:write',
  ],
  admin: [
    'users:read', 'teams:read',
    'customers:read', 'customers:write',
    'agents:read', 'agents:write',
    'audit_logs:read',
    'domains:read', 'domains:write',
    'apps:read', 'apps:write',
    'deployments:read', 'deployments:write',
    'analytics:read',
    'roles:read',
  ],
  team_admin: [
    'users:read',
    'customers:read', 'customers:write',
    'agents:read',
    'domains:read', 'domains:write',
    'apps:read', 'apps:write',
    'deployments:read', 'deployments:write',
    'analytics:read',
  ],
  agent: [
    'customers:read',
    'domains:read', 'domains:write',
    'apps:read',
    'deployments:read',
  ],
  user: [
    'domains:read',
    'apps:read',
    'deployments:read',
  ],
  viewer: [
    'domains:read',
    'apps:read',
  ],
};

// System-level permissions only super_admin can have
const SYSTEM_PERMISSIONS: Permission[] = [
  'system_settings:write',
  'billing:write',
  'roles:write',
  'users:delete',
  'customers:impersonate',
  'security_events:read',
];

export function hasPermission(ctx: PolicyContext, permission: Permission): boolean {
  // Super admin bypasses all checks
  if (ctx.roles.includes('super_admin')) return true;

  // Block system-level permissions for non-super-admin
  if (SYSTEM_PERMISSIONS.includes(permission)) return false;

  // RBAC check
  const hasRolePermission = ctx.roles.some(role =>
    ROLE_PERMISSIONS[role]?.includes(permission)
  );
  if (!hasRolePermission) return false;

  // ABAC: team boundary check for non-admin roles
  if (!ctx.roles.includes('admin') && ctx.resourceTeamId && ctx.teamId) {
    if (ctx.resourceTeamId !== ctx.teamId) return false;
  }

  return true;
}

export function isSuperAdmin(roles: AppRole[]): boolean {
  return roles.includes('super_admin');
}

export function getHighestRole(roles: AppRole[]): AppRole {
  const priority: AppRole[] = ['super_admin', 'admin', 'team_admin', 'agent', 'user', 'viewer'];
  return priority.find(r => roles.includes(r)) || 'viewer';
}
