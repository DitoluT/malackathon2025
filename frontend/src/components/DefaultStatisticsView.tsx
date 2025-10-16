import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity, DollarSign, Users, AlertCircle, Calendar } from 'lucide-react';

const API_BASE_URL = 'http://130.61.189.36:8000/api/v1';

interface Estadisticas {
  media: number | null;
  mediana: number | null;
  moda: number | null;
  desviacion_estandar: number | null;
  varianza: number | null;
  minimo: number | null;
  maximo: number | null;
  rango: number | null;
  q1: number | null;
  q3: number | null;
  iqr: number | null;
  valores_unicos: number;
  total_valores: number;
}

interface TemporalData {
  ano: number;
  mes: number;
  total_ingresos: number;
  estancia_promedio: number;
  coste_promedio: number;
  edad_promedio: number;
  casos_severos: number;
  ingresos_urgentes: number;
  porcentaje_urgentes: number;
  categorias_distintas: number;
}

interface TemporalTrendsResponse {
  success: boolean;
  data: TemporalData[];
  estadisticas_numericas: Record<string, Estadisticas>;
  total_records: number;
}

const DefaultStatisticsView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trendsData, setTrendsData] = useState<TemporalTrendsResponse | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    fetchTemporalTrends();
  }, []);

  const fetchTemporalTrends = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/statistics/temporal-trends`);
      
      if (!response.ok) {
        throw new Error('Error al cargar las estadísticas');
      }

      const data: TemporalTrendsResponse = await response.json();
      setTrendsData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching trends:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error || !trendsData) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error || 'No se pudieron cargar las estadísticas'}
        </AlertDescription>
      </Alert>
    );
  }

  const stats = trendsData.estadisticas_numericas;

  // Preparar datos para gráficas con mes en formato texto
  const chartData = trendsData.data.map(d => ({
    ...d,
    mes_nombre: new Date(2024, d.mes - 1).toLocaleString('es-ES', { month: 'short' }),
    periodo: `${d.mes}/${d.ano}`
  }));

  if (!isVisible) {
    return (
      <div className="flex items-center justify-center py-3 px-4 border border-border rounded-lg bg-card/50">
        <button
          onClick={() => setIsVisible(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium shadow-sm"
        >
          <TrendingUp className="h-3.5 w-3.5" />
          Mostrar Estadísticas Generales
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Estadísticas Generales</h2>
          <p className="text-muted-foreground mt-1">Análisis temporal con estadísticas descriptivas completas</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm">
            <Calendar className="h-4 w-4 mr-1" />
            {trendsData.total_records} períodos analizados
          </Badge>
          <button
            onClick={() => setIsVisible(false)}
            className="px-3 py-1.5 text-sm text-muted-foreground bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
          >
            Ocultar
          </button>
        </div>
      </div>

      {/* Tarjetas de Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Ingresos */}
        <Card className="border-2 border-blue-200 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Ingresos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total_ingresos?.media?.toLocaleString()}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Media por período</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Mediana:</span>
                <span className="font-semibold ml-1 text-gray-900 dark:text-gray-100">{stats.total_ingresos?.mediana}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Rango:</span>
                <span className="font-semibold ml-1 text-gray-900 dark:text-gray-100">{stats.total_ingresos?.rango}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estancia Promedio */}
        <Card className="border-2 border-green-200 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-400 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Estancia Hospitalaria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.estancia_promedio?.media} días</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Promedio general</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Q1:</span>
                <span className="font-semibold ml-1 text-gray-900 dark:text-gray-100">{stats.estancia_promedio?.q1}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Q3:</span>
                <span className="font-semibold ml-1 text-gray-900 dark:text-gray-100">{stats.estancia_promedio?.q3}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coste Promedio */}
        <Card className="border-2 border-amber-200 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Coste Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">€{stats.coste_promedio?.media?.toLocaleString()}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Media por caso</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Mín:</span>
                <span className="font-semibold ml-1 text-gray-900 dark:text-gray-100">€{stats.coste_promedio?.minimo}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Máx:</span>
                <span className="font-semibold ml-1 text-gray-900 dark:text-gray-100">€{stats.coste_promedio?.maximo}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Casos Severos */}
        <Card className="border-2 border-red-200 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Casos Severos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.casos_severos?.media?.toFixed(0)}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Media por período</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Varianza:</span>
                <span className="font-semibold ml-1 text-gray-900 dark:text-gray-100">{stats.casos_severos?.varianza?.toFixed(0)}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Desv.Est:</span>
                <span className="font-semibold ml-1 text-gray-900 dark:text-gray-100">{stats.casos_severos?.desviacion_estandar?.toFixed(1)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencia de Ingresos */}
        <Card className="shadow-sm border hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-foreground">Tendencia de Ingresos Mensuales</CardTitle>
            <CardDescription className="text-muted-foreground">Evolución temporal de ingresos hospitalarios</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes_nombre" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total_ingresos" stroke="#3b82f6" strokeWidth={2} name="Total Ingresos" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Estancia vs Coste */}
        <Card className="shadow-sm border hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-foreground">Estancia y Costes</CardTitle>
            <CardDescription className="text-muted-foreground">Relación entre duración y coste promedio</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes_nombre" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="estancia_promedio" fill="#10b981" name="Estancia (días)" />
                <Bar yAxisId="right" dataKey="coste_promedio" fill="#f59e0b" name="Coste (€)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Casos Severos y Urgentes */}
        <Card className="shadow-sm border hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-foreground">Casos Críticos</CardTitle>
            <CardDescription className="text-muted-foreground">Evolución de casos severos e ingresos urgentes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes_nombre" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="casos_severos" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Casos Severos" />
                <Area type="monotone" dataKey="ingresos_urgentes" stackId="1" stroke="#f97316" fill="#f97316" fillOpacity={0.6} name="Ingresos Urgentes" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Porcentaje de Urgentes */}
        <Card className="shadow-sm border hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-foreground">Porcentaje de Urgencias</CardTitle>
            <CardDescription className="text-muted-foreground">Proporción de ingresos urgentes por período</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes_nombre" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="porcentaje_urgentes" stroke="#8b5cf6" strokeWidth={2} name="% Urgencias" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Estadísticas Descriptivas */}
      <Card className="shadow-sm border hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-foreground">Estadísticas Descriptivas Completas</CardTitle>
          <CardDescription className="text-muted-foreground">Métricas estadísticas detalladas de todas las variables numéricas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold text-foreground">Variable</th>
                  <th className="text-right p-3 font-semibold text-foreground">Media</th>
                  <th className="text-right p-3 font-semibold text-foreground">Mediana</th>
                  <th className="text-right p-3 font-semibold text-foreground">Moda</th>
                  <th className="text-right p-3 font-semibold text-foreground">Desv.Est.</th>
                  <th className="text-right p-3 font-semibold text-foreground">Varianza</th>
                  <th className="text-right p-3 font-semibold text-foreground">IQR</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stats).map(([key, value]) => (
                  <tr key={key} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium text-foreground capitalize">{key.replace(/_/g, ' ')}</td>
                    <td className="p-3 text-right text-muted-foreground">{value.media?.toFixed(2) || 'N/A'}</td>
                    <td className="p-3 text-right text-muted-foreground">{value.mediana?.toFixed(2) || 'N/A'}</td>
                    <td className="p-3 text-right text-muted-foreground">{value.moda?.toFixed(2) || 'N/A'}</td>
                    <td className="p-3 text-right text-muted-foreground">{value.desviacion_estandar?.toFixed(2) || 'N/A'}</td>
                    <td className="p-3 text-right text-muted-foreground">{value.varianza?.toFixed(2) || 'N/A'}</td>
                    <td className="p-3 text-right text-muted-foreground">{value.iqr?.toFixed(2) || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DefaultStatisticsView;
