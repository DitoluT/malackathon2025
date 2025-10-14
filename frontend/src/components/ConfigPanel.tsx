import { useState, useEffect } from "react";
import { Settings, Plus, Filter, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  filters: Record<string, string[]>;
  title: string;
}

// Datos disponibles para selección
const availableFields = {
  categorical: [
    { value: "diagnostico", label: "Diagnóstico" },
    { value: "edad", label: "Grupo de Edad" },
    { value: "provincia", label: "Provincia" },
    { value: "genero", label: "Género" },
    { value: "severidad", label: "Severidad" },
  ],
  numerical: [
    { value: "pacientes", label: "Número de Pacientes" },
    { value: "duracion", label: "Duración de Estancia (días)" },
    { value: "consultas", label: "Número de Consultas" },
    { value: "costo", label: "Costo Promedio" },
  ]
};

// Opciones de filtro para cada campo
const filterOptions: Record<string, string[]> = {
  diagnostico: ["Depresión", "Ansiedad", "Bipolar", "Esquizofrenia", "Otros"],
  edad: ["18-25", "26-35", "36-45", "46-60", "60+"],
  provincia: ["Madrid", "Barcelona", "Valencia", "Sevilla", "Bilbao"],
  genero: ["Masculino", "Femenino", "Otro"],
  severidad: ["Leve", "Moderada", "Grave", "Muy Grave"],
};

const ConfigPanel = ({ isOpen, onClose, onGenerateChart }: ConfigPanelProps) => {
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("pacientes");
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  // Resetear filtros cuando cambia el eje X
  useEffect(() => {
    if (xAxis) {
      setActiveFilters({});
    }
  }, [xAxis]);

  const toggleFilter = (field: string, value: string) => {
    setActiveFilters(prev => {
      const current = prev[field] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      
      return { ...prev, [field]: updated };
    });
  };

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
      filters: activeFilters,
      title: `${yLabel} por ${xLabel}`,
    };

    onGenerateChart(config);
    
    // Limpiar formulario
    setXAxis("");
    setYAxis("pacientes");
    setChartType("bar");
    setActiveFilters({});
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
          </div>

          {/* Panel de Filtros Dinámico */}
          {xAxis && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                Filtros Disponibles
              </h3>

              {filterOptions[xAxis] && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {availableFields.categorical.find(f => f.value === xAxis)?.label}
                  </Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {filterOptions[xAxis].map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${xAxis}-${option}`}
                          checked={activeFilters[xAxis]?.includes(option) || false}
                          onCheckedChange={() => toggleFilter(xAxis, option)}
                          className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <label
                          htmlFor={`${xAxis}-${option}`}
                          className="text-sm text-foreground cursor-pointer select-none"
                        >
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resumen de filtros activos */}
              {Object.keys(activeFilters).length > 0 && (
                <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-md">
                  {Object.entries(activeFilters).map(([field, values]) => 
                    values.length > 0 && (
                      <div key={field}>
                        <strong>{field}:</strong> {values.length} seleccionado(s)
                      </div>
                    )
                  )}
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
