import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/use-permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, User, Eye, CheckCircle2, XCircle } from 'lucide-react';

/**
 * Componente de demostración que muestra las capacidades
 * de cada rol de usuario visualmente
 */
const RoleCapabilitiesDemo = () => {
  const { user } = useAuth();
  const { isAdmin, isUser, isDemo, canEdit, canDelete, canExport } = usePermissions();

  const capabilities = [
    {
      name: 'Ver gráficos',
      admin: true,
      user: true,
      demo: true,
    },
    {
      name: 'Crear gráficos',
      admin: true,
      user: true,
      demo: false,
    },
    {
      name: 'Editar gráficos',
      admin: true,
      user: true,
      demo: false,
    },
    {
      name: 'Eliminar gráficos',
      admin: true,
      user: false,
      demo: false,
    },
    {
      name: 'Exportar datos',
      admin: true,
      user: false,
      demo: false,
    },
    {
      name: 'Configurar filtros avanzados',
      admin: true,
      user: true,
      demo: false,
    },
    {
      name: 'Acceso a panel de administración',
      admin: true,
      user: false,
      demo: false,
    },
    {
      name: 'Gestionar usuarios',
      admin: true,
      user: false,
      demo: false,
    },
  ];

  const getRoleInfo = () => {
    if (isAdmin()) {
      return {
        icon: <Shield className="h-6 w-6" />,
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        title: 'Administrador',
        description: 'Acceso completo a todas las funcionalidades del sistema',
      };
    } else if (isUser()) {
      return {
        icon: <User className="h-6 w-6" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-500/10',
        title: 'Usuario',
        description: 'Permisos para crear y gestionar contenido',
      };
    } else if (isDemo()) {
      return {
        icon: <Eye className="h-6 w-6" />,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-500/10',
        title: 'Demo',
        description: 'Acceso de solo lectura para explorar el sistema',
      };
    }
    return null;
  };

  const roleInfo = getRoleInfo();
  if (!roleInfo) return null;

  const getCurrentRoleCapabilities = () => {
    if (isAdmin()) return capabilities.map(c => c.admin);
    if (isUser()) return capabilities.map(c => c.user);
    if (isDemo()) return capabilities.map(c => c.demo);
    return [];
  };

  const currentCapabilities = getCurrentRoleCapabilities();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full ${roleInfo.bgColor}`}>
            <div className={roleInfo.color}>
              {roleInfo.icon}
            </div>
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              {roleInfo.title}
              <Badge variant="outline">@{user?.username}</Badge>
            </CardTitle>
            <CardDescription>{roleInfo.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">
            Capacidades de tu rol:
          </h4>
          <div className="space-y-2">
            {capabilities.map((capability, index) => (
              <div
                key={capability.name}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  currentCapabilities[index]
                    ? 'bg-green-500/5 border-green-500/20'
                    : 'bg-red-500/5 border-red-500/20'
                }`}
              >
                <span className="text-sm font-medium">{capability.name}</span>
                {currentCapabilities[index] ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground mb-3">
              Comparación de roles:
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Funcionalidad</th>
                    <th className="text-center p-2 font-medium">
                      <Shield className="h-4 w-4 mx-auto" />
                      <span className="text-xs">Admin</span>
                    </th>
                    <th className="text-center p-2 font-medium">
                      <User className="h-4 w-4 mx-auto" />
                      <span className="text-xs">User</span>
                    </th>
                    <th className="text-center p-2 font-medium">
                      <Eye className="h-4 w-4 mx-auto" />
                      <span className="text-xs">Demo</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {capabilities.map((capability) => (
                    <tr key={capability.name} className="border-b last:border-0">
                      <td className="p-2 text-xs">{capability.name}</td>
                      <td className="text-center p-2">
                        {capability.admin ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                        )}
                      </td>
                      <td className="text-center p-2">
                        {capability.user ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                        )}
                      </td>
                      <td className="text-center p-2">
                        {capability.demo ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleCapabilitiesDemo;
