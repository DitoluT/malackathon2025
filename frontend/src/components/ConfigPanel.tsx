import { useState, useEffect } from "react";
import { Settings, Plus, Filter, X, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateChart: (config: ChartConfig) => void;
}

export interface ChartConfig {
  id: string;
  xAxis: string;
  yAxis: string;
  chartType: "bar" | "line" | "pie";
  textFilter: string;
  aggregation: "COUNT" | "AVG" | "SUM" | "MIN" | "MAX";
  limit: number;
  title: string;
}

// Campos disponibles desde la base de datos real (SALUD_MENTAL_FEATURED)
const availableFields = {
  categorical: [
    { value: "categoria", label: "Categoría de Diagnóstico" },
    { value: "diagnostico", label: "Diagnóstico Principal" },
    { value: "comunidad", label: "Comunidad Autónoma" },
    { value: "servicio", label: "Servicio Hospitalario" },
    { value: "sexo", label: "Sexo" },
    { value: "procedencia", label: "Procedencia del Ingreso" },
    { value: "tipo_alta", label: "Tipo de Alta" },
    { value: "circunstancia_contacto", label: "Circunstancia de Contacto" },
    { value: "reingreso", label: "Reingreso" },
    { value: "mes_ingreso", label: "Mes de Ingreso" },
    { value: "pais_nacimiento", label: "País de Nacimiento" },
    { value: "ccaa_residencia", label: "CCAA de Residencia" },
    { value: "tipo_gdr_ap", label: "Tipo GDR AP" },
    { value: "tipo_gdr_apr", label: "Tipo GDR APR" },
    { value: "nivel_severidad_apr", label: "Nivel de Severidad APR" },
    { value: "riesgo_mortalidad_apr", label: "Riesgo de Mortalidad APR" },
    { value: "ingreso_uci", label: "Ingreso en UCI" },
  ],
  numerical: [
    { value: "count", label: "Número de Casos (Conteo)" },
    { value: "estancia", label: "Estancia Hospitalaria (Días)" },
    { value: "edad", label: "Edad del Paciente" },
    { value: "coste", label: "Coste APR" },
    { value: "dias_uci", label: "Días en UCI" },
    { value: "edad_ingreso", label: "Edad en el Ingreso" },
  ]
};

const ConfigPanel = ({ isOpen, onClose, onGenerateChart }: ConfigPanelProps) => {
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("count");
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");
  const [textFilter, setTextFilter] = useState("");
  const [aggregation, setAggregation] = useState<"COUNT" | "AVG" | "SUM" | "MIN" | "MAX">("COUNT");
  const [limit, setLimit] = useState(50);

  // Resetear filtros cuando cambia el eje X
  useEffect(() => {
    if (xAxis) {
      setTextFilter("");
    }
  }, [xAxis]);

  // Ajustar agregación según el eje Y
  useEffect(() => {
    if (yAxis === "count") {
      setAggregation("COUNT");
    } else {
      setAggregation("AVG");
    }
  }, [yAxis]);

  const handleGenerate = () => {
    if (!xAxis || !yAxis) {
      return;
    }

    const xLabel = [...availableFields.categorical, ...availableFields.numerical]
      .find(f => f.value === xAxis)?.label || xAxis;
    const yLabel = [...availableFields.categorical, ...availableFields.numerical]
      .find(f => f.value === yAxis)?.label || yAxis;

    const config: ChartConfig = {
      id: Date.now().toString(),
      xAxis,
      yAxis,
      chartType,
      textFilter: textFilter.trim(),
      aggregation,
      limit,
      title: `${yLabel} por ${xLabel}${textFilter ? ` (filtrado)` : ''}`,
    };

    onGenerateChart(config);
    
    // Limpiar formulario
    setXAxis("");
    setYAxis("count");
    setChartType("bar");
    setTextFilter("");
    setAggregation("COUNT");
    setLimit(50);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-80 
          bg-card border-r border-border z-40
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-y-auto
        `}
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Configuración</h2>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 hover:bg-muted rounded-md gauss-transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Selección de Datos */}
          <div className="space-y-4 pb-6 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              Selección de Datos
            </h3>

            {/* Eje X */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Eje X (Categorías)</Label>
              <div className="relative">
                <select
                  value={xAxis}
                  onChange={(e) => setXAxis(e.target.value)}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 gauss-transition cursor-pointer"
                >
                  <option value="">Seleccionar campo...</option>
                  {availableFields.categorical.map((field) => (
                    <option key={field.value} value={field.value}>
                      {field.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Eje Y */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Eje Y (Valores)</Label>
              <div className="relative">
                <select
                  value={yAxis}
                  onChange={(e) => setYAxis(e.target.value)}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 gauss-transition cursor-pointer"
                >
                  {availableFields.numerical.map((field) => (
                    <option key={field.value} value={field.value}>
                      {field.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Tipo de Gráfico */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tipo de Gráfico</Label>
              <RadioGroup value={chartType} onValueChange={(value: any) => setChartType(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bar" id="bar" />
                  <Label htmlFor="bar" className="text-sm cursor-pointer">Barras</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="line" id="line" />
                  <Label htmlFor="line" className="text-sm cursor-pointer">Líneas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pie" id="pie" />
                  <Label htmlFor="pie" className="text-sm cursor-pointer">Circular</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Agregación (solo si no es COUNT) */}
            {yAxis !== "count" && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tipo de Agregación</Label>
                <div className="relative">
                  <select
                    value={aggregation}
                    onChange={(e) => setAggregation(e.target.value as any)}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 gauss-transition cursor-pointer"
                  >
                    <option value="AVG">Promedio</option>
                    <option value="SUM">Suma</option>
                    <option value="MIN">Mínimo</option>
                    <option value="MAX">Máximo</option>
                    <option value="COUNT">Contar</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            )}

            {/* Límite de Resultados */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Límite de Resultados</Label>
              <div className="relative">
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 gauss-transition cursor-pointer"
                >
                  <option value={10}>10 resultados</option>
                  <option value={20}>20 resultados</option>
                  <option value={50}>50 resultados (recomendado)</option>
                  <option value={100}>100 resultados</option>
                  <option value={200}>200 resultados</option>
                  <option value={500}>500 resultados</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              <p className="text-xs text-muted-foreground">
                💡 Número máximo de categorías a mostrar en el gráfico
              </p>
            </div>
          </div>

          {/* Panel de Filtros con Texto */}
          {xAxis && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                Filtro de Búsqueda
              </h3>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Buscar en {availableFields.categorical.find(f => f.value === xAxis)?.label || xAxis}
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Ej: Depresión, Madrid, etc..."
                    value={textFilter}
                    onChange={(e) => setTextFilter(e.target.value)}
                    className="pl-10 bg-muted border-border focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 Escribe texto para filtrar los resultados. Deja vacío para ver todos los datos.
                </p>
              </div>

              {/* Resumen de filtro activo */}
              {textFilter.trim() && (
                <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-md border border-border">
                  <strong>Filtro activo:</strong> Mostrando resultados que contengan "{textFilter}"
                </div>
              )}
            </div>
          )}

          {/* Botón Generar */}
          <Button 
            onClick={handleGenerate}
            disabled={!xAxis || !yAxis}
            className="w-full gauss-gradient hover:opacity-90 gauss-transition font-medium gauss-glow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Generar Gráfico
          </Button>
        </div>
      </aside>
    </>
  );
};

export default ConfigPanel;
