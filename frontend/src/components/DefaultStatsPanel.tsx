import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, Users, DollarSign, Activity, AlertCircle, Loader2 } from 'lucide-react';

const API_BASE_URL = 'http://130.61.189.36:8000/api/v1';

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

interface Estadistica {
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
  valores_nulos: number;
  valores_unicos: number;
  total_valores: number;
}

interface TemporalTrendsResponse {
  success: boolean;
  data: TemporalData[];
  estadisticas_numericas: {
    [key: string]: Estadistica;
  };
  total_records: number;
}

const DefaultStatsPanel: React.FC = () => {
  const [data, setData] = useState<TemporalData[]>([]);
  const [stats, setStats] = useState<{ [key: string]: Estadistica }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemporalTrends();
  }, []);

  const fetchTemporalTrends = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/statistics/temporal-trends`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result: TemporalTrendsResponse = await response.json();
      
      setData(result.data);
      setStats(result.estadisticas_numericas);
    } catch (err) {
      console.error('Error fetching temporal trends:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg">Cargando estadísticas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar las estadísticas: {error}
        </AlertDescription>
      </Alert>
    );
  }

  // Preparar datos para gráficas
  const chartData = data.map(d => ({
    periodo: `${d.mes}/${d.ano}`,
    ingresos: d.total_ingresos,
    estancia: d.estancia_promedio,
    coste: d.coste_promedio / 1000, // En miles de euros
    urgentes: d.porcentaje_urgentes
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Panel de Estadísticas</h2>
          <p className="text-muted-foreground">
            Análisis temporal de ingresos hospitalarios en salud mental
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Calendar className="mr-2 h-4 w-4" />
          {data.length} períodos analizados
        </Badge>
      </div>

      {/* Estadísticas Clave */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Ingresos */}
        {stats.total_ingresos && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_ingresos.media?.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Media mensual
              </p>
              <div className="mt-2 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mínimo:</span>
                  <span className="font-semibold">{stats.total_ingresos.minimo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Máximo:</span>
                  <span className="font-semibold">{stats.total_ingresos.maximo}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estancia Promedio */}
        {stats.estancia_promedio && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estancia Promedio</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.estancia_promedio.media?.toFixed(1)} días</div>
              <p className="text-xs text-muted-foreground mt-1">
                Media de hospitalización
              </p>
              <div className="mt-2 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mediana:</span>
                  <span className="font-semibold">{stats.estancia_promedio.mediana?.toFixed(1)} días</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Desv. Est.:</span>
                  <span className="font-semibold">{stats.estancia_promedio.desviacion_estandar?.toFixed(1)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Coste Promedio */}
        {stats.coste_promedio && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coste Promedio</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{stats.coste_promedio.media?.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Media por ingreso
              </p>
              <div className="mt-2 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Varianza:</span>
                  <span className="font-semibold">{stats.coste_promedio.varianza?.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rango:</span>
                  <span className="font-semibold">€{stats.coste_promedio.rango?.toFixed(0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Casos Severos */}
        {stats.casos_severos && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Casos Severos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.casos_severos.media?.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Media mensual (Nivel 3-4)
              </p>
              <div className="mt-2 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Q1:</span>
                  <span className="font-semibold">{stats.casos_severos.q1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Q3:</span>
                  <span className="font-semibold">{stats.casos_severos.q3}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Gráficas */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Gráfica de Ingresos Totales */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Ingresos</CardTitle>
            <CardDescription>Evolución temporal del total de ingresos hospitalarios</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ingresos" stroke="#8884d8" name="Ingresos" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfica de Estancia Promedio */}
        <Card>
          <CardHeader>
            <CardTitle>Estancia Hospitalaria</CardTitle>
            <CardDescription>Duración promedio de hospitalización en días</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="estancia" stroke="#82ca9d" fill="#82ca9d" name="Días" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfica de Costes */}
        <Card>
          <CardHeader>
            <CardTitle>Evolución de Costes</CardTitle>
            <CardDescription>Coste promedio por ingreso (miles de €)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="coste" fill="#ffc658" name="Coste (k€)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfica de Urgentes */}
        <Card>
          <CardHeader>
            <CardTitle>Ingresos Urgentes</CardTitle>
            <CardDescription>Porcentaje de ingresos de urgencia</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="urgentes" stroke="#ff7300" name="% Urgentes" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas Detalladas */}
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas Descriptivas Completas</CardTitle>
          <CardDescription>Métricas estadísticas para todas las variables numéricas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(stats).map(([key, stat]) => (
              <Card key={key} className="border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium capitalize">
                    {key.replace(/_/g, ' ')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-muted-foreground">Media:</p>
                      <p className="font-semibold">{stat.media?.toFixed(2) ?? 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Mediana:</p>
                      <p className="font-semibold">{stat.mediana?.toFixed(2) ?? 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Moda:</p>
                      <p className="font-semibold">{stat.moda?.toFixed(2) ?? 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Desv. Est.:</p>
                      <p className="font-semibold">{stat.desviacion_estandar?.toFixed(2) ?? 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Varianza:</p>
                      <p className="font-semibold">{stat.varianza?.toFixed(2) ?? 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rango:</p>
                      <p className="font-semibold">{stat.rango?.toFixed(2) ?? 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Q1:</p>
                      <p className="font-semibold">{stat.q1?.toFixed(2) ?? 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Q3:</p>
                      <p className="font-semibold">{stat.q3?.toFixed(2) ?? 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">IQR:</p>
                      <p className="font-semibold">{stat.iqr?.toFixed(2) ?? 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Únicos:</p>
                      <p className="font-semibold">{stat.valores_unicos}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DefaultStatsPanel;
