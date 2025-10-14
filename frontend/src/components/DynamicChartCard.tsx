import { Trash2, Info, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartConfig } from "./ConfigPanel";
import { usePermissions } from "@/hooks/use-permissions";
import { toast } from "sonner";

interface DynamicChartCardProps {
  config: ChartConfig;
  onDelete: (id: string) => void;
}

// Generar datos simulados basados en la configuración
const generateMockData = (config: ChartConfig) => {
  const { xAxis, yAxis, filters } = config;
  
  // Determinar categorías para el eje X
  let categories: string[] = [];
  
  switch (xAxis) {
    case "diagnostico":
      categories = filters.diagnostico?.length > 0 
        ? filters.diagnostico 
        : ["Depresión", "Ansiedad", "Bipolar", "Esquizofrenia", "Otros"];
      break;
    case "edad":
      categories = filters.edad?.length > 0 
        ? filters.edad 
        : ["18-25", "26-35", "36-45", "46-60", "60+"];
      break;
    case "provincia":
      categories = filters.provincia?.length > 0 
        ? filters.provincia 
        : ["Madrid", "Barcelona", "Valencia", "Sevilla", "Bilbao"];
      break;
    case "genero":
      categories = filters.genero?.length > 0 
        ? filters.genero 
        : ["Masculino", "Femenino", "Otro"];
      break;
    case "severidad":
      categories = filters.severidad?.length > 0 
        ? filters.severidad 
        : ["Leve", "Moderada", "Grave", "Muy Grave"];
      break;
    default:
      categories = ["Cat A", "Cat B", "Cat C", "Cat D"];
  }

  // Generar valores aleatorios basados en el eje Y
  return categories.map(cat => {
    let value = 0;
    switch (yAxis) {
      case "pacientes":
        value = Math.floor(Math.random() * 100) + 20;
        break;
      case "duracion":
        value = Math.floor(Math.random() * 30) + 5;
        break;
      case "consultas":
        value = Math.floor(Math.random() * 50) + 10;
        break;
      case "costo":
        value = Math.floor(Math.random() * 5000) + 1000;
        break;
      default:
        value = Math.floor(Math.random() * 100);
    }

    return {
      name: cat,
      value: value,
      color: `hsl(${Math.random() * 360}, 66%, 58%)`,
    };
  });
};

const COLORS = [
  "#4fd1c5",
  "#48bb78",
  "#ed8936",
  "#667eea",
  "#f56565",
  "#ecc94b",
];

const DynamicChartCard = ({ config, onDelete }: DynamicChartCardProps) => {
  const data = generateMockData(config);
  const { isAdmin } = usePermissions();

  // Función para exportar datos a CSV
  const exportToCSV = () => {
    if (!isAdmin()) {
      toast.error("Permiso denegado", {
        description: "Solo los administradores pueden exportar datos",
      });
      return;
    }

    try {
      // Preparar datos para CSV
      const headers = ["Categoría", "Valor"];
      const csvContent = [
        headers.join(","),
        ...data.map(row => `"${row.name}",${row.value}`)
      ].join("\n");

      // Crear blob y descargar
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `${config.title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Datos exportados", {
        description: `${config.title} se ha descargado como CSV`,
      });
    } catch (error) {
      toast.error("Error al exportar", {
        description: "No se pudo generar el archivo CSV",
      });
    }
  };

  const renderChart = () => {
    switch (config.chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 18% 20%)" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(210 15% 60%)"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="hsl(210 15% 60%)"
                style={{ fontSize: '12px' }}
              />
              <RechartsTooltip 
                contentStyle={{
                  backgroundColor: 'hsl(210 18% 13%)',
                  border: '1px solid hsl(210 18% 20%)',
                  borderRadius: '8px',
                  color: 'hsl(210 20% 91%)'
                }}
              />
              <Bar 
                dataKey="value" 
                fill="hsl(172 66% 58%)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 18% 20%)" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(210 15% 60%)"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="hsl(210 15% 60%)"
                style={{ fontSize: '12px' }}
              />
              <RechartsTooltip 
                contentStyle={{
                  backgroundColor: 'hsl(210 18% 13%)',
                  border: '1px solid hsl(210 18% 20%)',
                  borderRadius: '8px',
                  color: 'hsl(210 20% 91%)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(172 66% 58%)" 
                strokeWidth={3}
                dot={{ fill: 'hsl(172 66% 58%)', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.name}: ${entry.value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip 
                contentStyle={{
                  backgroundColor: 'hsl(210 18% 13%)',
                  border: '1px solid hsl(210 18% 20%)',
                  borderRadius: '8px',
                  color: 'hsl(210 20% 91%)'
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 gauss-shadow hover:gauss-glow gauss-transition animate-fade-in group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">{config.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Tipo: {config.chartType === "bar" ? "Barras" : config.chartType === "line" ? "Líneas" : "Circular"}
            {Object.keys(config.filters).length > 0 && (
              <span className="ml-2">
                • {Object.values(config.filters).flat().length} filtro(s) aplicado(s)
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1 hover:bg-muted rounded-md gauss-transition">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm max-w-xs">
                  Gráfico generado con {data.length} categoría(s) de datos simulados
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {isAdmin() && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={exportToCSV}
                    className="opacity-0 group-hover:opacity-100 gauss-transition hover:bg-primary/10 hover:text-primary"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">Exportar datos a CSV</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(config.id)}
            className="opacity-0 group-hover:opacity-100 gauss-transition hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="w-full h-[300px]">
        {renderChart()}
      </div>
    </div>
  );
};

export default DynamicChartCard;
