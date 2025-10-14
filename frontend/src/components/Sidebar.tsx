import { useState } from "react";
import { Filter, Calendar, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>([]);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState("todos");

  const ageGroups = [
    "18-25 años",
    "26-35 años",
    "36-45 años",
    "46-60 años",
    "60+ años"
  ];

  const diagnoses = [
    { value: "todos", label: "Todos los diagnósticos" },
    { value: "depresion", label: "Depresión" },
    { value: "ansiedad", label: "Ansiedad" },
    { value: "bipolar", label: "Trastorno Bipolar" },
    { value: "otros", label: "Otros" }
  ];

  const toggleAgeGroup = (age: string) => {
    setSelectedAgeGroups(prev =>
      prev.includes(age)
        ? prev.filter(a => a !== age)
        : [...prev, age]
    );
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
              <Filter className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Filtros</h2>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 hover:bg-muted rounded-md gauss-transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Rango de Fechas
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 gauss-transition"
                />
                <span className="text-xs text-muted-foreground mt-1 block">Desde</span>
              </div>
              <div>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 gauss-transition"
                />
                <span className="text-xs text-muted-foreground mt-1 block">Hasta</span>
              </div>
            </div>
          </div>

          {/* Diagnosis Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Diagnóstico</Label>
            <div className="relative">
              <select
                value={selectedDiagnosis}
                onChange={(e) => setSelectedDiagnosis(e.target.value)}
                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 gauss-transition cursor-pointer"
              >
                {diagnoses.map((diagnosis) => (
                  <option key={diagnosis.value} value={diagnosis.value}>
                    {diagnosis.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Age Group Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Grupo de Edad</Label>
            <div className="space-y-2">
              {ageGroups.map((age) => (
                <div key={age} className="flex items-center space-x-2">
                  <Checkbox
                    id={age}
                    checked={selectedAgeGroups.includes(age)}
                    onCheckedChange={() => toggleAgeGroup(age)}
                    className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label
                    htmlFor={age}
                    className="text-sm text-foreground cursor-pointer select-none"
                  >
                    {age}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <Button 
            className="w-full gauss-gradient hover:opacity-90 gauss-transition font-medium gauss-glow"
          >
            Aplicar Filtros
          </Button>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSelectedAgeGroups([]);
              setSelectedDiagnosis("todos");
            }}
            className="w-full text-sm text-muted-foreground hover:text-foreground gauss-transition text-center"
          >
            Limpiar filtros
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
