import { useState, useEffect } from "react";
import { Trash2, RefreshCw, Download, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartConfig } from "./ConfigPanel";
import { executeQueryWithTextFilters, CustomQueryResponse } from "@/lib/api-service";
import { usePermissions } from "@/hooks/use-permissions";
import { toast } from "sonner";

interface DynamicChartCardProps {
  config: ChartConfig;
  onDelete: (id: string) => void;
}

const COLORS = [
  "#8b5cf6", // purple
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#8b5cf6", // purple again
];

const DynamicChartCard = ({ config, onDelete }: DynamicChartCardProps) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { canDelete } = usePermissions();

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    console.group("🔍 [DynamicChartCard] Iniciando carga de datos");
    console.log("📊 Configuración del gráfico:", {
      id: config.id,
      xAxis: config.xAxis,
      yAxis: config.yAxis,
      chartType: config.chartType,
      aggregation: config.aggregation,
      textFilter: config.textFilter,
      title: config.title,
    });

    try {
      console.log("📡 Llamando a executeQueryWithTextFilters...");
      const response: CustomQueryResponse = await executeQueryWithTextFilters(
        config.xAxis,
        config.yAxis,
        config.aggregation,
        config.textFilter,
        config.limit
      );

      console.log("✅ Respuesta de la API:", {
        success: response.success,
        recordCount: response.data?.length || 0,
        executionTime: response.execution_time_ms,
        query: response.query_executed,
      });

      if (response.success && response.data.length > 0) {
        console.log("📊 Datos recibidos (primeros 5):", response.data.slice(0, 5));
        
        // Transform data for recharts
        // Oracle devuelve las columnas en MAYÚSCULAS (CATEGORY, VALUE)
        const transformedData = response.data.map((row) => {
          // Probar ambas variantes: mayúsculas y minúsculas
          const categoryValue = row.CATEGORY || row.category || "Sin categoría";
          const valueNumber = row.VALUE || row.value || 0;
          
          return {
            name: String(categoryValue),
            value: Number(valueNumber),
          };
        });

        console.log("🔄 Datos transformados (primeros 5):", transformedData.slice(0, 5));
        setData(transformedData);
        console.log("✅ Datos cargados correctamente");
      } else {
        console.warn("⚠️ No se encontraron datos:", {
          success: response.success,
          dataLength: response.data?.length,
          message: response.message,
        });
        setError("No se encontraron datos con los filtros aplicados");
        setData([]);
      }
    } catch (err: any) {
      console.error("❌ Error al cargar datos del gráfico:", err);
      console.error("📋 Detalles del error:", {
        message: err.message,
        stack: err.stack,
        config: config,
      });
      setError(err.message || "Error al cargar los datos");
      setData([]);
      toast.error("Error al cargar datos", {
        description: err.message || "No se pudo conectar con el servidor",
      });
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  useEffect(() => {
    fetchData();
  }, [config]);

  const handleDelete = () => {
    if (!canDelete()) {
      toast.error("Permiso denegado", {
        description: "No tienes permisos para eliminar gráficos",
      });
      return;
    }
    onDelete(config.id);
  };

  const handleDownload = () => {
    // Export data as JSON
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${config.title.replace(/\s+/g, "_")}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Datos exportados", {
      description: "Los datos se han descargado en formato JSON",
    });
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Cargando datos...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <div className="text-red-500 mb-2">⚠️</div>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button
              onClick={fetchData}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
          </div>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="h-80 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            No hay datos para mostrar
          </p>
        </div>
      );
    }

    // Limit data points for pie charts
    const displayData = config.chartType === "pie" ? data.slice(0, 10) : data;

    switch (config.chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="name"
                stroke="#888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f1f1f",
                  border: "1px solid #333",
                  borderRadius: "8px",
                }}
                formatter={(value: any) => [value.toLocaleString(), "Valor"]}
              />
              <Legend />
              <Bar
                dataKey="value"
                fill={COLORS[0]}
                radius={[8, 8, 0, 0]}
                name={config.title}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="name"
                stroke="#888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f1f1f",
                  border: "1px solid #333",
                  borderRadius: "8px",
                }}
                formatter={(value: any) => [value.toLocaleString(), "Valor"]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke={COLORS[0]}
                strokeWidth={2}
                dot={{ fill: COLORS[0], r: 4 }}
                name={config.title}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={displayData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) =>
                  `${entry.name}: ${((entry.percent || 0) * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {displayData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f1f1f",
                  border: "1px solid #333",
                  borderRadius: "8px",
                }}
                formatter={(value: any) => [value.toLocaleString(), "Valor"]}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Tipo de gráfico no soportado</div>;
    }
  };

  return (
    <Card className="p-6 bg-card border-border gauss-card-hover">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {config.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {loading
              ? "Cargando..."
              : `${data.length} registro${data.length !== 1 ? "s" : ""}`}
          </p>
          {config.textFilter && (
            <p className="text-xs text-primary mt-1">
              🔍 Filtro: "{config.textFilter}"
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={fetchData}
            disabled={loading}
            className="hover:bg-muted"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDownload}
            disabled={loading || data.length === 0}
            className="hover:bg-muted"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            className="hover:bg-red-500/10 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-4">{renderChart()}</div>

      {/* Footer Info */}
      {!loading && !error && data.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Agregación: <strong>{config.aggregation}</strong>
            </span>
            <span>
              Actualizado: <strong>{new Date().toLocaleTimeString()}</strong>
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default DynamicChartCard;
