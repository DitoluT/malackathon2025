/**
 * EJEMPLO DE USO DEL SISTEMA DE AUTENTICACIÓN Y PERMISOS
 * 
 * Este archivo contiene ejemplos de cómo usar el sistema de autenticación
 * en diferentes escenarios comunes.
 */

import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// ============================================================================
// EJEMPLO 1: Mostrar/Ocultar elementos según el rol
// ============================================================================

export function ConditionalRenderExample() {
  const { user } = useAuth();
  const { isAdmin, isUser, isDemo, canEdit } = usePermissions();

  return (
    <div>
      {/* Mostrar solo para admin */}
      {isAdmin() && (
        <div>
          <h2>Panel de Administración</h2>
          <p>Solo visible para administradores</p>
        </div>
      )}

      {/* Mostrar para admin y usuarios */}
      {canEdit() && (
        <Button>Editar Contenido</Button>
      )}

      {/* Mostrar para todos */}
      <p>Bienvenido, {user?.displayName}</p>

      {/* Mostrar mensaje especial para demo */}
      {isDemo() && (
        <div className="bg-yellow-100 p-4 rounded">
          ⚠️ Estás en modo demo con permisos limitados
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EJEMPLO 2: Validar permisos antes de ejecutar una acción
// ============================================================================

export function ActionWithPermissionCheck() {
  const { canDelete } = usePermissions();

  const handleDelete = (itemId: string) => {
    // Verificar permisos antes de ejecutar
    if (!canDelete()) {
      toast.error('Permiso denegado', {
        description: 'Solo los administradores pueden eliminar elementos',
      });
      return;
    }

    // Proceder con la eliminación
    console.log(`Eliminando item: ${itemId}`);
    toast.success('Elemento eliminado correctamente');
  };

  return (
    <Button 
      onClick={() => handleDelete('123')}
      disabled={!canDelete()}
    >
      Eliminar
    </Button>
  );
}

// ============================================================================
// EJEMPLO 3: Verificar múltiples roles
// ============================================================================

export function MultiRoleCheck() {
  const { hasRole } = usePermissions();

  const handleAdminOrUserAction = () => {
    if (!hasRole(['admin', 'user'])) {
      toast.error('Acceso denegado');
      return;
    }

    // Acción permitida para admin y user
    console.log('Ejecutando acción...');
  };

  return (
    <Button onClick={handleAdminOrUserAction}>
      Acción Especial
    </Button>
  );
}

// ============================================================================
// EJEMPLO 4: Hook personalizado para lógica específica de negocio
// ============================================================================

export function useChartPermissions() {
  const { userRole } = usePermissions();

  const maxChartsAllowed = () => {
    switch (userRole) {
      case 'admin':
        return Infinity; // Sin límite
      case 'user':
        return 10;
      case 'demo':
        return 3;
      default:
        return 0;
    }
  };

  const canUseAdvancedFilters = () => {
    return userRole === 'admin' || userRole === 'user';
  };

  const canExportData = () => {
    return userRole === 'admin';
  };

  return {
    maxChartsAllowed: maxChartsAllowed(),
    canUseAdvancedFilters: canUseAdvancedFilters(),
    canExportData: canExportData(),
  };
}

// ============================================================================
// EJEMPLO 5: Componente con diferentes vistas según el rol
// ============================================================================

export function RoleBasedDashboard() {
  const { isAdmin, isUser, isDemo } = usePermissions();

  if (isAdmin()) {
    return <AdminDashboard />;
  }

  if (isUser()) {
    return <UserDashboard />;
  }

  if (isDemo()) {
    return <DemoDashboard />;
  }

  return <div>No autorizado</div>;
}

function AdminDashboard() {
  return (
    <div>
      <h1>Panel de Administración</h1>
      <p>Acceso completo a todas las funcionalidades</p>
      {/* Todas las opciones disponibles */}
    </div>
  );
}

function UserDashboard() {
  return (
    <div>
      <h1>Panel de Usuario</h1>
      <p>Funcionalidades principales disponibles</p>
      {/* Opciones limitadas */}
    </div>
  );
}

function DemoDashboard() {
  return (
    <div>
      <h1>Panel Demo</h1>
      <p>Vista de solo lectura</p>
      {/* Solo visualización */}
    </div>
  );
}

// ============================================================================
// EJEMPLO 6: Proteger una ruta personalizada
// ============================================================================

/*
En App.tsx o en tu router:

import ProtectedRoute from '@/components/ProtectedRoute';

<Route
  path="/admin"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminPanel />
    </ProtectedRoute>
  }
/>

<Route
  path="/dashboard"
  element={
    <ProtectedRoute allowedRoles={['admin', 'user']}>
      <Dashboard />
    </ProtectedRoute>
  }
/>
*/

// ============================================================================
// EJEMPLO 7: Obtener información del usuario actual
// ============================================================================

export function UserInfo() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>No autenticado</div>;
  }

  return (
    <div className="p-4 border rounded">
      <h3>Información del Usuario</h3>
      <p><strong>Nombre:</strong> {user?.displayName}</p>
      <p><strong>Usuario:</strong> @{user?.username}</p>
      <p><strong>Rol:</strong> {user?.role}</p>
      <Button onClick={logout}>Cerrar Sesión</Button>
    </div>
  );
}

// ============================================================================
// EJEMPLO 8: Validación en formularios según permisos
// ============================================================================

export function FormWithPermissions() {
  const { canEdit } = usePermissions();

  const handleSubmit = (data: any) => {
    if (!canEdit()) {
      toast.error('No tienes permisos para modificar datos');
      return;
    }

    // Procesar formulario
    console.log('Guardando:', data);
    toast.success('Datos guardados correctamente');
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit({/* datos */});
    }}>
      <input 
        type="text" 
        placeholder="Campo de texto"
        disabled={!canEdit()}
      />
      <Button 
        type="submit" 
        disabled={!canEdit()}
      >
        Guardar
      </Button>
    </form>
  );
}

// ============================================================================
// NOTAS IMPORTANTES:
// ============================================================================

/*
1. SIEMPRE valida permisos tanto en el frontend como en el backend
   - El frontend es para UX (mostrar/ocultar elementos)
   - El backend es para seguridad real

2. Usa toast.error() para notificar permisos denegados de forma amigable

3. Desactiva (disabled) botones y campos cuando no hay permisos
   en lugar de solo ocultarlos, para mejor UX

4. Los permisos se pueden personalizar en:
   - src/hooks/use-permissions.ts

5. Para añadir nuevos roles:
   - Actualiza src/types/auth.ts
   - Actualiza src/contexts/AuthContext.tsx
   - Actualiza src/hooks/use-permissions.ts

6. La sesión se guarda en localStorage:
   - Persiste al recargar la página
   - Se elimina al cerrar sesión
   - Para producción, usa tokens JWT

7. Testing de roles:
   - Prueba con cada usuario (admin, user, demo)
   - Verifica que los permisos funcionen correctamente
   - Asegúrate de que los mensajes de error sean claros
*/
