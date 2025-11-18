import { useMemo } from 'react';

type Permission = 
  | 'dashboard.view'
  | 'users.view'
  | 'users.create'
  | 'users.viewDetails'
  | 'users.edit'
  | 'users.delete'
  | 'users.disable'
  | 'events.view'
  | 'events.create'
  | 'events.viewTeams'
  | 'events.edit'
  | 'events.delete'
  | 'events.createBusiness'
  | 'events.addMembers'
  | 'events.editBusiness'
  | 'events.deleteBusiness'
  | 'transactions.view'
  | 'reports.view'
  | 'reports.generate'
  | 'reports.download'
  | 'reports.delete'
  | 'centralWallet.view'
  | 'centralWallet.viewNetworkStatus'
  | 'centralWallet.viewSettlements'
  | 'centralWallet.viewWithdrawals'
  | 'centralWallet.approve'
  | 'audit.view'
  | 'profile.view'
  | 'settings.view';

type UserRole = 'super_admin' | 'admin' | 'usuario';

interface PermissionsMatrix {
  [key: string]: {
    super_admin: boolean;
    admin: boolean;
  };
}

const PERMISSIONS_MATRIX: PermissionsMatrix = {
  'dashboard.view': { super_admin: true, admin: true },
  'users.view': { super_admin: true, admin: true },
  'users.create': { super_admin: true, admin: true },
  'users.viewDetails': { super_admin: true, admin: true },
  'users.edit': { super_admin: true, admin: true },
  'users.delete': { super_admin: true, admin: false },
  'users.disable': { super_admin: true, admin: false },
  'events.view': { super_admin: true, admin: true },
  'events.create': { super_admin: true, admin: true },
  'events.viewTeams': { super_admin: true, admin: true },
  'events.edit': { super_admin: true, admin: true },
  'events.delete': { super_admin: true, admin: false },
  'events.createBusiness': { super_admin: true, admin: true },
  'events.addMembers': { super_admin: true, admin: true },
  'events.editBusiness': { super_admin: true, admin: true },
  'events.deleteBusiness': { super_admin: true, admin: false },
  'transactions.view': { super_admin: true, admin: true },
  'reports.view': { super_admin: true, admin: true },
  'reports.generate': { super_admin: true, admin: true },
  'reports.download': { super_admin: true, admin: true },
  'reports.delete': { super_admin: true, admin: false },
  'centralWallet.view': { super_admin: true, admin: true },
  'centralWallet.viewNetworkStatus': { super_admin: true, admin: true },
  'centralWallet.viewSettlements': { super_admin: true, admin: true },
  'centralWallet.viewWithdrawals': { super_admin: true, admin: true },
  'centralWallet.approve': { super_admin: true, admin: false },
  'audit.view': { super_admin: true, admin: false },
  'profile.view': { super_admin: true, admin: true },
  'settings.view': { super_admin: true, admin: false }
};

/**
 * Hook para verificar permisos basado en el rol del usuario
 */
export function usePermissions() {
  const userRole = useMemo(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      const user = JSON.parse(userStr);
      // Normalizar el rol (puede venir como 'role', 'role_name', etc.)
      const role = user.role || user.role_name || user.role_id;
      if (!role) return null;
      // Normalizar a formato estándar
      const normalizedRole = role.toLowerCase().replace(/\s+/g, '_');
      if (normalizedRole === 'super_admin' || normalizedRole === 'superadmin') {
        return 'super_admin' as UserRole;
      }
      if (normalizedRole === 'admin' || normalizedRole === 'administrador') {
        return 'admin' as UserRole;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  /**
   * Verifica si el usuario tiene un permiso específico
   */
  const hasPermission = (permission: Permission): boolean => {
    if (!userRole) return false;
    // Los usuarios normales no tienen permisos de admin
    if (userRole === 'usuario') return false;
    const permissionConfig = PERMISSIONS_MATRIX[permission];
    if (!permissionConfig) return false;
    return permissionConfig[userRole as 'super_admin' | 'admin'] || false;
  };

  /**
   * Verifica si el usuario es super admin
   */
  const isSuperAdmin = (): boolean => {
    return userRole === 'super_admin';
  };

  /**
   * Verifica si el usuario es admin (incluye super admin)
   */
  const isAdmin = (): boolean => {
    return userRole === 'admin' || userRole === 'super_admin';
  };

  return {
    userRole,
    hasPermission,
    isSuperAdmin,
    isAdmin
  };
}

