import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sparkles, BarChart3, Brain, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import MarkdownRenderer from '@/components/MarkdownRenderer';

const API_BASE_URL = 'http://130.61.189.36:8000/api/v1';

interface Statistics {
  total_records: number;
  unique_categories: number;
  metrics?: {
    mean: number;
    median: number;
    std_dev: number;
    min: number;
    max: number;
    range: number;
  };
}

interface AIAnalysisResult {
  success: boolean;
  statistics: Statistics;
  ai_insight: string;
  data_sample: Array<Record<string, any>>;
  query_executed: string;
  rows_analyzed: number;
}

interface QueryTemplate {
  name: string;
  description: string;
  query: string;
  category: string;
}

const QUERY_TEMPLATES: QueryTemplate[] = [
  {
    name: 'Distribución por Categoría de Diagnóstico',
    description: 'Analiza la distribución de diagnósticos por categoría principal',
    query: `SELECT CATEGORIA as categoria, COUNT(*) as total 
FROM SALUD_MENTAL_FEATURED 
WHERE CATEGORIA IS NOT NULL 
GROUP BY CATEGORIA 
ORDER BY total DESC`,
    category: 'diagnostico'
  },
  {
    name: 'Análisis por Rango de Edad',
    description: 'Agrupa pacientes por rangos de edad y analiza patrones',
    query: `SELECT 
  CASE 
    WHEN EDAD BETWEEN 0 AND 17 THEN '0-17 años'
    WHEN EDAD BETWEEN 18 AND 25 THEN '18-25 años'
    WHEN EDAD BETWEEN 26 AND 35 THEN '26-35 años'
    WHEN EDAD BETWEEN 36 AND 45 THEN '36-45 años'
    WHEN EDAD BETWEEN 46 AND 55 THEN '46-55 años'
    WHEN EDAD BETWEEN 56 AND 65 THEN '56-65 años'
    ELSE '65+ años'
  END as rango_edad,
  COUNT(*) as total,
  ROUND(AVG(ESTANCIA_DIAS), 2) as estancia_promedio
FROM SALUD_MENTAL_FEATURED
WHERE EDAD IS NOT NULL
GROUP BY CASE 
  WHEN EDAD BETWEEN 0 AND 17 THEN '0-17 años'
  WHEN EDAD BETWEEN 18 AND 25 THEN '18-25 años'
  WHEN EDAD BETWEEN 26 AND 35 THEN '26-35 años'
  WHEN EDAD BETWEEN 36 AND 45 THEN '36-45 años'
  WHEN EDAD BETWEEN 46 AND 55 THEN '46-55 años'
  WHEN EDAD BETWEEN 56 AND 65 THEN '56-65 años'
  ELSE '65+ años'
END`,
    category: 'demografia'
  },
  {
    name: 'Distribución por Género',
    description: 'Analiza la distribución por género y diagnósticos principales',
    query: `SELECT 
  SEXO as genero, 
  COUNT(*) as total,
  ROUND(AVG(EDAD), 1) as edad_promedio
FROM SALUD_MENTAL_FEATURED 
WHERE SEXO IS NOT NULL 
GROUP BY SEXO`,
    category: 'demografia'
  },
  {
    name: 'Análisis por Comunidad Autónoma',
    description: 'Analiza casos por comunidad autónoma y patrones regionales',
    query: `SELECT COMUNIDAD_AUTONOMA as comunidad, 
  COUNT(*) as total,
  ROUND(AVG(ESTANCIA_DIAS), 2) as estancia_promedio,
  ROUND(AVG(COSTE_APR), 2) as coste_promedio
FROM SALUD_MENTAL_FEATURED 
WHERE COMUNIDAD_AUTONOMA IS NOT NULL 
GROUP BY COMUNIDAD_AUTONOMA 
ORDER BY total DESC`,
    category: 'geografico'
  },
  {
    name: 'Análisis de Duración de Estancia',
    description: 'Analiza la duración de estancia hospitalaria y costes asociados',
    query: `SELECT 
  CASE 
    WHEN ESTANCIA_DIAS <= 7 THEN '1-7 días'
    WHEN ESTANCIA_DIAS BETWEEN 8 AND 14 THEN '8-14 días'
    WHEN ESTANCIA_DIAS BETWEEN 15 AND 30 THEN '15-30 días'
    WHEN ESTANCIA_DIAS BETWEEN 31 AND 60 THEN '31-60 días'
    ELSE 'Más de 60 días'
  END as duracion,
  COUNT(*) as total_casos,
  ROUND(AVG(ESTANCIA_DIAS), 2) as promedio_dias,
  ROUND(AVG(COSTE_APR), 2) as coste_promedio
FROM SALUD_MENTAL_FEATURED
WHERE ESTANCIA_DIAS IS NOT NULL
GROUP BY CASE 
  WHEN ESTANCIA_DIAS <= 7 THEN '1-7 días'
  WHEN ESTANCIA_DIAS BETWEEN 8 AND 14 THEN '8-14 días'
  WHEN ESTANCIA_DIAS BETWEEN 15 AND 30 THEN '15-30 días'
  WHEN ESTANCIA_DIAS BETWEEN 31 AND 60 THEN '31-60 días'
  ELSE 'Más de 60 días'
END`,
    category: 'clinico'
  },
  {
    name: 'Análisis de Larga Estancia',
    description: 'Identifica patrones en pacientes con estancia prolongada',
    query: `SELECT 
  CASE 
    WHEN LARGA_ESTANCIA = 1 THEN 'Larga Estancia'
    ELSE 'Estancia Normal'
  END as tipo_estancia,
  COUNT(*) as total,
  ROUND(AVG(ESTANCIA_DIAS), 2) as dias_promedio,
  ROUND(AVG(COSTE_APR), 2) as coste_promedio
FROM SALUD_MENTAL_FEATURED
WHERE LARGA_ESTANCIA IS NOT NULL
GROUP BY LARGA_ESTANCIA
ORDER BY total DESC`,
    category: 'clinico'
  },
  {
    name: 'Análisis de Costes por Categoría',
    description: 'Analiza costes y recursos por categoría de diagnóstico',
    query: `SELECT 
  CATEGORIA as categoria,
  COUNT(*) as casos,
  ROUND(AVG(COSTE_APR), 2) as coste_promedio,
  ROUND(MIN(COSTE_APR), 2) as coste_minimo,
  ROUND(MAX(COSTE_APR), 2) as coste_maximo,
  ROUND(AVG(ESTANCIA_DIAS), 2) as estancia_promedio
FROM SALUD_MENTAL_FEATURED
WHERE CATEGORIA IS NOT NULL AND COSTE_APR IS NOT NULL
GROUP BY CATEGORIA
ORDER BY coste_promedio DESC`,
    category: 'recursos'
  },
  {
    name: 'Análisis por Servicio Hospitalario',
    description: 'Compara servicios hospitalarios y su eficiencia',
    query: `SELECT 
  SERVICIO as servicio,
  COUNT(*) as total_pacientes,
  ROUND(AVG(ESTANCIA_DIAS), 2) as estancia_promedio,
  ROUND(AVG(COSTE_APR), 2) as coste_promedio
FROM SALUD_MENTAL_FEATURED
WHERE SERVICIO IS NOT NULL
GROUP BY SERVICIO
ORDER BY total_pacientes DESC`,
    category: 'recursos'
  },
  {
    name: 'Análisis de Severidad y Mortalidad',
    description: 'Analiza niveles de severidad y riesgo de mortalidad',
    query: `SELECT 
  NIVEL_SEVERIDAD_APR as nivel_severidad,
  RIESGO_MORTALIDAD_APR as riesgo_mortalidad,
  COUNT(*) as casos,
  ROUND(AVG(ESTANCIA_DIAS), 2) as estancia_promedio,
  ROUND(AVG(COSTE_APR), 2) as coste_promedio
FROM SALUD_MENTAL_FEATURED
WHERE NIVEL_SEVERIDAD_APR IS NOT NULL 
  AND RIESGO_MORTALIDAD_APR IS NOT NULL
GROUP BY NIVEL_SEVERIDAD_APR, RIESGO_MORTALIDAD_APR
ORDER BY nivel_severidad DESC, riesgo_mortalidad DESC`,
    category: 'clinico'
  },
  {
    name: 'Tendencia Mensual de Ingresos',
    description: 'Analiza patrones temporales y predice tendencias futuras',
    query: `SELECT 
  EXTRACT(YEAR FROM FECHA_INGRESO) as ano,
  MES_INGRESO as mes,
  COUNT(*) as total_ingresos,
  ROUND(AVG(ESTANCIA_DIAS), 2) as estancia_promedio,
  ROUND(AVG(COSTE_APR), 2) as coste_promedio,
  ROUND(AVG(EDAD), 1) as edad_promedio,
  COUNT(CASE WHEN NIVEL_SEVERIDAD_APR IN (3, 4) THEN 1 END) as casos_severos,
  COUNT(CASE WHEN CIRCUNSTANCIA_CONTACTO = 1 THEN 1 END) as ingresos_urgentes,
  ROUND(COUNT(CASE WHEN CIRCUNSTANCIA_CONTACTO = 1 THEN 1 END) * 100.0 / COUNT(*), 1) as porcentaje_urgentes,
  COUNT(DISTINCT CATEGORIA) as categorias_distintas
FROM SALUD_MENTAL_FEATURED
WHERE MES_INGRESO IS NOT NULL 
  AND FECHA_INGRESO IS NOT NULL
GROUP BY EXTRACT(YEAR FROM FECHA_INGRESO), MES_INGRESO
ORDER BY 
  EXTRACT(YEAR FROM FECHA_INGRESO),
  MES_INGRESO`,
    category: 'temporal'
  }
];

const AIAnalysisPanel: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customQuery, setCustomQuery] = useState<string>('');
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);

  const handleTemplateChange = (templateName: string) => {
    setSelectedTemplate(templateName);
    const template = QUERY_TEMPLATES.find(t => t.name === templateName);
    if (template) {
      setCustomQuery(template.query);
    }
  };

  const handleAnalyze = async () => {
    if (!customQuery.trim()) {
      toast({
        title: "Query requerida",
        description: "Por favor selecciona una plantilla o escribe una query personalizada",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/ai/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: customQuery,
          user_question: userQuestion || null,
          limit: 100
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al realizar el análisis');
      }

      const data: AIAnalysisResult = await response.json();
      setResult(data);

      toast({
        title: "Análisis completado",
        description: "El análisis con IA se ha completado exitosamente",
      });

    } catch (error) {
      console.error('Error analyzing:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al realizar el análisis",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Panel de Configuración */}
      <Card className="border-2 border-purple-200 bg-white dark:bg-gray-900 shadow-sm">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-purple-50 dark:bg-purple-950/20">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-700 dark:text-purple-400" />
            <CardTitle className="text-gray-900 dark:text-gray-100">Análisis con IA Premium</CardTitle>
          </div>
          <CardDescription className="text-gray-700 dark:text-gray-300 font-medium">
            Genera insights avanzados combinando análisis estadístico y procesamiento con Gemini AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {/* Template Selector */}
          <div className="space-y-2">
            <Label htmlFor="template" className="text-gray-900 dark:text-gray-100 font-semibold">Plantilla de Consulta</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger id="template">
                <SelectValue placeholder="Selecciona una plantilla..." />
              </SelectTrigger>
              <SelectContent>
                {QUERY_TEMPLATES.map((template) => (
                  <SelectItem key={template.name} value={template.name}>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                      <span>{template.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTemplate && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {QUERY_TEMPLATES.find(t => t.name === selectedTemplate)?.description}
              </p>
            )}
          </div>

          {/* Custom Query */}
          <div className="space-y-2">
            <Label htmlFor="query" className="text-gray-900 dark:text-gray-100 font-semibold">Query SQL Personalizada</Label>
            <Textarea
              id="query"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder="SELECT ... FROM SALUD_MENTAL_FEATURED WHERE ..."
              className="font-mono text-sm min-h-[120px]"
            />
          </div>

          {/* User Question */}
          <div className="space-y-2">
            <Label htmlFor="question" className="text-gray-900 dark:text-gray-100 font-semibold">Pregunta Específica para la IA (opcional)</Label>
            <Textarea
              id="question"
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              placeholder={
                selectedTemplate === 'Tendencia Mensual de Ingresos'
                  ? "Ejemplo: ¿Cómo se comportarán los ingresos en los próximos 6 meses? ¿Qué meses requieren más recursos?"
                  : "¿Qué patrones específicos quieres identificar? ¿Qué recomendaciones necesitas?"
              }
              className="min-h-[80px]"
            />
            {selectedTemplate === 'Tendencia Mensual de Ingresos' && (
              <Alert className="mt-2 border-amber-300 bg-amber-50 dark:bg-amber-950/20">
                <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-xs text-amber-800 dark:text-amber-200">
                  💡 <strong>Análisis Predictivo Activado:</strong> Esta consulta incluye datos temporales multi-año. 
                  Gemini analizará tendencias históricas para proyectar comportamientos futuros.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Analyze Button */}
          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || !customQuery.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analizando con IA...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analizar con IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Empirical Statistics */}
          <Card className="border-2 border-blue-200 bg-white dark:bg-gray-900 shadow-sm">
            <CardHeader className="bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Datos Empíricos</CardTitle>
                <Badge variant="secondary" className="ml-auto">
                  Estadísticas Calculadas
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Registros</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {result.statistics.total_records}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Categorías Únicas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {result.statistics.unique_categories}
                  </p>
                </div>
                {result.statistics.metrics && (
                  <>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Media</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {result.statistics.metrics.mean}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Mediana</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {result.statistics.metrics.median}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {result.statistics.metrics && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Desv. Estándar</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{result.statistics.metrics.std_dev}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Mínimo</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{result.statistics.metrics.min}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Máximo</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{result.statistics.metrics.max}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Rango</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{result.statistics.metrics.range}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="border-2 border-purple-200 bg-white dark:bg-gray-900 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <CardTitle className="text-lg font-bold">Insights Generados por IA</CardTitle>
                <Badge className="ml-auto bg-white/20 text-white border-white/30 hover:bg-white/30">
                  Powered by Gemini
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg p-6">
                <MarkdownRenderer content={result.ai_insight} className="text-sm" />
              </div>
            </CardContent>
          </Card>

          {/* Query Info */}
          <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
            <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-sm flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Información de la Consulta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm pt-4">
              <div>
                <span className="text-gray-700 dark:text-gray-300 font-medium">Registros analizados:</span>{' '}
                <span className="font-bold text-gray-900 dark:text-gray-100">{result.rows_analyzed}</span>
              </div>
              <div>
                <span className="text-gray-700 dark:text-gray-300 font-medium">Query ejecutada:</span>
                <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-xs overflow-x-auto font-mono text-gray-900 dark:text-gray-100">
                  {result.query_executed}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AIAnalysisPanel;
