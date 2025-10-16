import { useState, useEffect } from "react";
import { Menu, BarChart3, Database, CheckCircle2, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import ConfigPanel, { ChartConfig } from "@/components/ConfigPanel";
import DynamicChartCard from "@/components/DynamicChartCardNew";
import AIAnalysisPanel from "@/components/AIAnalysisPanel";
import DefaultStatisticsView from "@/components/DefaultStatisticsView";
import { usePermissions } from "@/hooks/use-permissions";
import { toast } from "sonner";
import { checkHealth } from "@/lib/api-service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

          {/* Main Content with Tabs */}
          <Tabs defaultValue="canvas" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="canvas" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Canvas Dinámico
              </TabsTrigger>
              <TabsTrigger value="ai-analysis" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Análisis con IA
              </TabsTrigger>
            </TabsList>

            {/* Canvas Tab */}
            <TabsContent value="canvas" className="space-y-6">
              {/* Estadísticas por defecto - Siempre visible */}
              <DefaultStatisticsView />

              {/* Divider entre estadísticas y canvas personalizado */}
              {charts.length > 0 && (
                <>
                  <div className="border-t border-border my-8"></div>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <BarChart3 className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-bold text-foreground">Canvas Personalizado</h2>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {charts.length} gráfico(s) personalizado(s)
                    </p>
                  </div>
                </>
              )}

              {/* Canvas Area para gráficos personalizados */}
              {charts.length > 0 && (
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
              {apiConnected && (
                <div className="mt-8 p-4 bg-card/50 border border-border rounded-lg">
                  <p className="text-xs text-muted-foreground text-center">
                    💡 <strong>Tip:</strong> Los datos estadísticos se cargan automáticamente desde la base de datos Oracle.
                    Puedes generar gráficos personalizados desde el panel lateral.
                  </p>
                </div>
              )}

              {/* API Connection Warning */}
              {!apiConnected && apiConnected !== null && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-xs text-red-700 dark:text-red-300">
                    ⚠️ No se pudo conectar con el backend. Verifica que el servidor esté corriendo en http://130.61.189.36:8000
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
            </TabsContent>

            {/* AI Analysis Tab */}
            <TabsContent value="ai-analysis" className="space-y-6">
              <AIAnalysisPanel />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Index;
