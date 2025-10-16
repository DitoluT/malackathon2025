import { useState, useEffect } from "react";
import { Menu, BarChart3, Database, CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import ConfigPanel, { ChartConfig } from "@/components/ConfigPanel";
import DynamicChartCard from "@/components/DynamicChartCardNew";
import { usePermissions } from "@/hooks/use-permissions";
import { toast } from "sonner";
import { checkHealth } from "@/lib/api-service";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [totalRecords, setTotalRecords] = useState<number | null>(null);
  const { canEdit, canDelete, isDemo } = usePermissions();

  // Check API connection on mount
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const health = await checkHealth();
        setApiConnected(health.status === "healthy" && health.database === "connected");
        setTotalRecords(health.total_registros || null);
        
        if (health.status === "healthy") {
          toast.success("Conectado a la API", {
            description: `Base de datos conectada. ${health.total_registros?.toLocaleString() || 0} registros disponibles`,
          });
        }
      } catch (error) {
        console.error("API health check failed:", error);
        setApiConnected(false);
        toast.error("Error de conexión", {
          description: "No se pudo conectar con el backend. Verifica que esté corriendo.",
        });
      }
    };

    checkApiHealth();
  }, []);

  const handleGenerateChart = (config: ChartConfig) => {
    if (!canEdit()) {
      toast.error("Permiso denegado", {
        description: "Los usuarios demo no pueden crear gráficos",
      });
      return;
    }

    setCharts(prev => [...prev, config]);
    toast.success("Gráfico generado", {
      description: `${config.title} se ha añadido al canvas`,
    });
  };

  const handleDeleteChart = (id: string) => {
    if (!canDelete()) {
      toast.error("Permiso denegado", {
        description: "Solo los administradores pueden eliminar gráficos",
      });
      return;
    }

    setCharts(prev => prev.filter(chart => chart.id !== id));
    toast.info("Gráfico eliminado", {
      description: "El gráfico ha sido eliminado del canvas",
    });
  };

  return (
    <div className="min-h-screen bg-background w-full">
      <Header />
      
      <div className="flex pt-16">
        <ConfigPanel 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          onGenerateChart={handleGenerateChart}
        />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden mb-6 p-2 bg-card border border-border rounded-md hover:bg-muted gauss-transition"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Canvas Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Canvas de Visualización</h2>
              </div>
              
              {/* API Status Indicator */}
              <div className="flex items-center gap-2 text-xs">
                {apiConnected === null ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                    <span>Verificando API...</span>
                  </div>
                ) : apiConnected ? (
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium">API Conectada</span>
                    {totalRecords !== null && (
                      <span className="text-muted-foreground">
                        ({totalRecords.toLocaleString()} registros)
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-500">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span>API Desconectada</span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {charts.length === 0 
                ? "Configura y genera tus gráficos desde el panel lateral" 
                : `${charts.length} gráfico(s) activo(s)`
              }
            </p>
          </div>

          {/* Canvas Area */}
          {charts.length === 0 ? (
            <div className="flex items-center justify-center min-h-[60vh] border-2 border-dashed border-border rounded-lg">
              <div className="text-center max-w-md px-4">
                <div className="mb-4 inline-flex p-4 rounded-full bg-primary/10">
                  <BarChart3 className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Canvas Vacío
                </h3>
                <p className="text-muted-foreground mb-6">
                  Comienza seleccionando los campos de datos y configurando tus filtros en el panel lateral.
                  Luego haz clic en "Generar Gráfico" para visualizar tus datos.
                </p>
                <div className="inline-flex items-center gap-2 text-sm text-primary">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  Listo para crear tu primera visualización
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {charts.map((chart) => (
                <DynamicChartCard
                  key={chart.id}
                  config={chart}
                  onDelete={handleDeleteChart}
                />
              ))}
            </div>
          )}

          {/* Info Footer */}
          {charts.length > 0 && apiConnected && (
            <div className="mt-8 p-4 bg-card/50 border border-border rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                💡 <strong>Tip:</strong> Los datos se cargan desde la base de datos Oracle en tiempo real.
                Usa el filtro de texto para buscar valores específicos.
              </p>
            </div>
          )}

          {/* API Connection Warning */}
          {!apiConnected && apiConnected !== null && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-xs text-red-600 dark:text-red-400 text-center">
                ⚠️ No se pudo conectar con el backend. Asegúrate de que el servidor esté corriendo en http://130.61.189.36:8000
              </p>
            </div>
          )}

          {/* Demo user notice */}
          {isDemo() && (
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-xs text-yellow-600 dark:text-yellow-400 text-center">
                ⚠️ Estás usando una cuenta demo con permisos limitados (solo lectura)
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
