import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  const isUser = (): boolean => {
    return user?.role === 'user';
  };

  const isDemo = (): boolean => {
    return user?.role === 'demo';
  };

  const canEdit = (): boolean => {
    // Ejemplo: solo admin y user pueden editar, demo solo puede ver
    return user?.role === 'admin' || user?.role === 'user';
  };

  const canDelete = (): boolean => {
    // Ejemplo: solo admin puede eliminar
    return user?.role === 'admin';
  };

  const canExport = (): boolean => {
    // Solo admin puede exportar datos
    return user?.role === 'admin';
  };

  return {
    hasRole,
    isAdmin,
    isUser,
    isDemo,
    canEdit,
    canDelete,
    canExport,
    userRole: user?.role,
  };
};
