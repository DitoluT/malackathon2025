/**
 * API Service for connecting to the FastAPI backend
 * Provides methods to fetch data and execute custom queries
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Types for API responses
export interface HealthResponse {
  status: string;
  database: string;
  timestamp: string;
  version: string;
  total_registros?: number;
}

export interface DiagnosticoStats {
  categoria: string;
  total: number;
  porcentaje: number;
}

export interface EdadStats {
  rango_edad: string;
  total: number;
}

export interface SexoStats {
  sexo: string;
  total: number;
  porcentaje: number;
}

export interface ComunidadStats {
  comunidad_autonoma: string;
  total: number;
  porcentaje: number;
}

export interface ServicioStats {
  servicio: string;
  total: number;
  porcentaje: number;
}

export interface EstanciaStats {
  rango_dias: string;
  total: number;
}

export interface TendenciaMensual {
  mes: string;
  anio: string;
  total: number;
}

export interface CustomQueryRequest {
  query: string;
  params?: Record<string, any>;
  limit?: number;
}

export interface CustomQueryResponse {
  success: boolean;
  rows_returned: number;
  columns: string[];
  data: Record<string, any>[];
  query_executed: string;
  execution_time_ms?: number;
  message?: string;
}

export interface QueryExample {
  name: string;
  description: string;
  query: string;
}

export interface TableSchema {
  table_name: string;
  total_columns: number;
  columns: {
    column_name: string;
    data_type: string;
    data_length: number;
    nullable: boolean;
  }[];
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

/**
 * Health Check
 */
export async function checkHealth(): Promise<HealthResponse> {
  return fetchAPI<HealthResponse>('/health');
}

/**
 * Statistics Endpoints
 */
export async function getDiagnosticosStats(): Promise<DiagnosticoStats[]> {
  return fetchAPI<DiagnosticoStats[]>('/statistics/diagnosticos');
}

export async function getEdadDistribution(): Promise<EdadStats[]> {
  return fetchAPI<EdadStats[]>('/statistics/edad');
}

export async function getSexoDistribution(): Promise<SexoStats[]> {
  return fetchAPI<SexoStats[]>('/statistics/sexo');
}

export async function getComunidadStats(): Promise<ComunidadStats[]> {
  return fetchAPI<ComunidadStats[]>('/statistics/comunidad-autonoma');
}

export async function getServicioStats(): Promise<ServicioStats[]> {
  return fetchAPI<ServicioStats[]>('/statistics/servicio');
}

export async function getEstanciaStats(): Promise<EstanciaStats[]> {
  return fetchAPI<EstanciaStats[]>('/statistics/duracion-estancia');
}

export async function getTendenciaMensual(year?: number): Promise<TendenciaMensual[]> {
  const yearParam = year ? `?year=${year}` : '';
  return fetchAPI<TendenciaMensual[]>(`/statistics/tendencia-mensual${yearParam}`);
}

/**
 * Custom Query Endpoints
 */
export async function executeCustomQuery(request: CustomQueryRequest): Promise<CustomQueryResponse> {
  return fetchAPI<CustomQueryResponse>('/query/execute', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function getQueryExamples(): Promise<QueryExample[]> {
  return fetchAPI<QueryExample[]>('/query/examples');
}

export async function getTableSchema(): Promise<TableSchema> {
  return fetchAPI<TableSchema>('/query/schema');
}

/**
 * Helper function to build a custom query with filters
 */
export function buildQuery(
  xAxis: string,
  yAxis: string,
  aggregation: 'COUNT' | 'AVG' | 'SUM' | 'MIN' | 'MAX',
  filters?: { column: string; value: string }[]
): CustomQueryRequest {
  // Map field names to actual column names
  const columnMapping: Record<string, string> = {
    // Categorical fields
    'categoria': '"Categoría"',
    'diagnostico': '"Diagnóstico Principal"',
    'comunidad': '"Comunidad Autónoma"',
    'servicio': 'SERVICIO',
    'sexo': 'SEXO',
    'procedencia': 'PROCEDENCIA',
    'tipo_alta': 'TIPO_ALTA',
    'circunstancia_contacto': 'CIRCUNSTANCIA_DE_CONTACTO',
    'reingreso': 'REINGRESO',
    'mes_ingreso': 'MES_DE_INGRESO',
    'pais_nacimiento': '"País Nacimiento"',
    'ccaa_residencia': 'CCAA_RESIDENCIA',
    'tipo_gdr_ap': 'TIPO_GDR_AP',
    'tipo_gdr_apr': 'TIPO_GDR_APR',
    'nivel_severidad_apr': 'NIVEL_SEVERIDAD_APR',
    'riesgo_mortalidad_apr': 'RIESGO_MORTALIDAD_APR',
    'ingreso_uci': 'INGRESO_EN_UCI',
    // Numerical fields
    'edad': 'EDAD',
    'estancia': '"Estancia Días"',
    'coste': 'COSTE_APR',
    'dias_uci': '"Días UCI"',
    'edad_ingreso': 'EDAD_EN_INGRESO',
    'fecha_ingreso': 'FECHA_DE_INGRESO',
  };

  const xColumn = columnMapping[xAxis] || xAxis;
  const yColumn = columnMapping[yAxis] || yAxis;

  // Build WHERE clause
  let whereClause = '';
  const params: Record<string, any> = {};
  
  if (filters && filters.length > 0) {
    const conditions: string[] = [];
    filters.forEach((filter, index) => {
      const col = columnMapping[filter.column] || filter.column;
      const paramName = `filter${index}`;
      conditions.push(`${col} = :${paramName}`);
      params[paramName] = filter.value;
    });
    whereClause = `WHERE ${conditions.join(' AND ')}`;
  }

  // Build query based on aggregation type
  let query: string;
  
  if (aggregation === 'COUNT') {
    query = `
      SELECT ${xColumn} as category, COUNT(*) as value
      FROM ENFERMEDADESMENTALESDIAGNOSTICO
      ${whereClause}
      GROUP BY ${xColumn}
      ORDER BY value DESC
    `.trim();
  } else {
    query = `
      SELECT ${xColumn} as category, ${aggregation}(${yColumn}) as value
      FROM ENFERMEDADESMENTALESDIAGNOSTICO
      ${whereClause}
      GROUP BY ${xColumn}
      ORDER BY value DESC
    `.trim();
  }

  return {
    query,
    params: Object.keys(params).length > 0 ? params : undefined,
    limit: 50,
  };
}

/**
 * Helper to execute a query with text filters
 */
export async function executeQueryWithTextFilters(
  xAxis: string,
  yAxis: string,
  aggregation: 'COUNT' | 'AVG' | 'SUM' | 'MIN' | 'MAX',
  textFilter?: string,
  limit: number = 50
): Promise<CustomQueryResponse> {
  console.group("🔍 [API Service] executeQueryWithTextFilters");
  console.log("📥 Parámetros recibidos:", { xAxis, yAxis, aggregation, textFilter, limit });

  const columnMapping: Record<string, string> = {
    // Categorical fields
    'categoria': '"Categoría"',
    'diagnostico': '"Diagnóstico Principal"',
    'comunidad': '"Comunidad Autónoma"',
    'servicio': 'SERVICIO',
    'sexo': 'SEXO',
    'procedencia': 'PROCEDENCIA',
    'tipo_alta': 'TIPO_ALTA',
    'circunstancia_contacto': 'CIRCUNSTANCIA_DE_CONTACTO',
    'reingreso': 'REINGRESO',
    'mes_ingreso': 'MES_DE_INGRESO',
    'pais_nacimiento': '"País Nacimiento"',
    'ccaa_residencia': 'CCAA_RESIDENCIA',
    'tipo_gdr_ap': 'TIPO_GDR_AP',
    'tipo_gdr_apr': 'TIPO_GDR_APR',
    'nivel_severidad_apr': 'NIVEL_SEVERIDAD_APR',
    'riesgo_mortalidad_apr': 'RIESGO_MORTALIDAD_APR',
    'ingreso_uci': 'INGRESO_EN_UCI',
    // Numerical fields
    'edad': 'EDAD',
    'estancia': '"Estancia Días"',
    'coste': 'COSTE_APR',
    'dias_uci': '"Días UCI"',
    'edad_ingreso': 'EDAD_EN_INGRESO',
    'fecha_ingreso': 'FECHA_DE_INGRESO',
  };

  const xColumn = columnMapping[xAxis] || xAxis;
  const yColumn = columnMapping[yAxis] || yAxis;

  console.log("🔄 Mapeo de columnas:", {
    xAxis_input: xAxis,
    xColumn_mapped: xColumn,
    yAxis_input: yAxis,
    yColumn_mapped: yColumn,
  });

  // Build WHERE clause for text filter
  let whereClause = '';
  const params: Record<string, any> = {};

  if (textFilter && textFilter.trim()) {
    // Parse text filter: "column:value" or "column=value" or "column LIKE value"
    whereClause = `WHERE ${xColumn} LIKE :searchText`;
    params.searchText = `%${textFilter}%`;
    console.log("🔍 Filtro aplicado:", { whereClause, searchText: params.searchText });
  } else {
    console.log("ℹ️ Sin filtro de texto");
  }

  // Build query
  let query: string;
  
  if (aggregation === 'COUNT' || yAxis === 'count') {
    query = `
      SELECT ${xColumn} as category, COUNT(*) as value
      FROM ENFERMEDADESMENTALESDIAGNOSTICO
      ${whereClause}
      GROUP BY ${xColumn}
      ORDER BY value DESC
    `.trim();
  } else {
    query = `
      SELECT ${xColumn} as category, ${aggregation}(${yColumn}) as value
      FROM ENFERMEDADESMENTALESDIAGNOSTICO
      ${whereClause}
      GROUP BY ${xColumn}
      ORDER BY value DESC
    `.trim();
  }

  console.log("📝 Query SQL generado:", query);
  console.log("🔑 Parámetros SQL:", params);

  const requestPayload = {
    query,
    params: Object.keys(params).length > 0 ? params : undefined,
    limit: limit,
  };

  console.log("📦 Payload completo a enviar:", requestPayload);
  console.log("🌐 Endpoint destino:", `${API_BASE_URL}/query/execute`);

  try {
    const result = await executeCustomQuery(requestPayload);
    console.log("✅ Resultado recibido:", {
      success: result.success,
      rows: result.rows_returned,
      columns: result.columns,
      dataLength: result.data?.length,
    });
    console.groupEnd();
    return result;
  } catch (error) {
    console.error("❌ Error en executeQueryWithTextFilters:", error);
    console.groupEnd();
    throw error;
  }
}

export default {
  checkHealth,
  getDiagnosticosStats,
  getEdadDistribution,
  getSexoDistribution,
  getComunidadStats,
  getServicioStats,
  getEstanciaStats,
  getTendenciaMensual,
  executeCustomQuery,
  getQueryExamples,
  getTableSchema,
  buildQuery,
  executeQueryWithTextFilters,
};
