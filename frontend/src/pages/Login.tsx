import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart3, Lock, User } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulamos un pequeño delay para dar feedback visual
    await new Promise(resolve => setTimeout(resolve, 500));

    const success = login(username, password);

    if (success) {
      toast.success('¡Bienvenido!', {
        description: 'Has iniciado sesión correctamente',
      });
      navigate('/');
    } else {
      setError('Usuario o contraseña incorrectos');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Gauss Insight Dashboard
          </h1>
          <p className="text-muted-foreground">
            Inicia sesión para continuar
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-border shadow-lg">
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder al dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Ingresa tu usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            {/* Demo credentials info */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-xs font-semibold text-foreground mb-3">
                👤 Usuarios de prueba:
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-xs">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Admin</p>
                    <p className="text-muted-foreground">malackathon / malackathon</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      ✓ Acceso completo, puede crear, editar y eliminar
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Usuario</p>
                    <p className="text-muted-foreground">diego / toledo</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      ✓ Puede crear y editar, sin permisos de eliminación
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Demo</p>
                    <p className="text-muted-foreground">demo / demo</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      ✓ Solo lectura, sin permisos de modificación
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2025 Gauss Insight Dashboard. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

export default Login;
