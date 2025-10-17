from fastapi import APIRouter, Depends, HTTPException, Body
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, validator
import oracledb
import logging
import re

from app.database.connection import get_db_connection
from app.models.schemas import ErrorResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/query", tags=["Custom Queries"])


class SQLQueryRequest(BaseModel):
    """Request model for custom SQL queries."""
    query: str = Field(..., description="SQL query to execute", min_length=10, max_length=5000)
    params: Optional[Dict[str, Any]] = Field(None, description="Query parameters for prepared statements")
    limit: Optional[int] = Field(100, description="Maximum number of rows to return", ge=1, le=10000)
    
    @validator('query')
    def validate_query(cls, v):
        """Validate that the query is safe to execute."""
        query_upper = v.upper().strip()
        
        # Solo permitir SELECT
        if not query_upper.startswith('SELECT'):
            raise ValueError("Only SELECT queries are allowed")
        
        # Prohibir palabras clave peligrosas
        dangerous_keywords = [
            'DROP', 'DELETE', 'TRUNCATE', 'INSERT', 'UPDATE', 
            'CREATE', 'ALTER', 'GRANT', 'REVOKE', 'EXECUTE',
            'EXEC', 'CALL', 'MERGE', 'RENAME'
        ]
        
        for keyword in dangerous_keywords:
            # Buscar la palabra clave como palabra completa
            pattern = r'\b' + keyword + r'\b'
            if re.search(pattern, query_upper):
                raise ValueError(f"Keyword '{keyword}' is not allowed in queries")
        
        # Prohibir múltiples statements (;)
        if ';' in v.strip().rstrip(';'):
            raise ValueError("Multiple statements are not allowed")
        
        return v


class SQLQueryResponse(BaseModel):
    """Response model for custom SQL queries."""
    success: bool = Field(..., description="Whether the query executed successfully")
    rows_returned: int = Field(..., description="Number of rows returned")
    columns: List[str] = Field(..., description="Column names")
    data: List[Dict[str, Any]] = Field(..., description="Query results")
    query_executed: str = Field(..., description="The query that was executed")
    message: Optional[str] = Field(None, description="Additional message or warning")


class QueryExample(BaseModel):
    """Example query model."""
    name: str = Field(..., description="Name of the example")
    description: str = Field(..., description="Description of what the query does")
    query: str = Field(..., description="The SQL query")


@router.post(
    "/execute",
    response_model=SQLQueryResponse,
    summary="Execute custom SQL query",
    description="""
    Execute a custom SELECT query on the SALUD_MENTAL_FEATURED table.
    
    **Security:**
    - Only SELECT queries are allowed
    - Dangerous keywords (DROP, DELETE, INSERT, etc.) are blocked
    - Multiple statements are not allowed
    - Results are limited to prevent memory issues
    
    **Tips:**
    - Column names do NOT have spaces: CATEGORIA, ESTANCIA_DIAS, COMUNIDAD_AUTONOMA
    - Never use quotes for column names - all are plain SQL identifiers
    - Use parameters for dynamic values to prevent SQL injection
    - The limit parameter will be applied automatically if not in your query
    """,
    responses={
        200: {"description": "Query executed successfully"},
        400: {"model": ErrorResponse, "description": "Invalid query or parameters"},
        500: {"model": ErrorResponse, "description": "Database error"}
    }
)
async def execute_custom_query(
    request: SQLQueryRequest = Body(..., example={
        "query": 'SELECT CATEGORIA, COUNT(*) as total FROM SALUD_MENTAL_FEATURED WHERE EDAD > :edad GROUP BY CATEGORIA ORDER BY total DESC',
        "params": {"edad": 50},
        "limit": 100
    }),
    connection=Depends(get_db_connection)
):
    """
    Execute a custom SQL query with safety checks.
    
    Example queries:
    
    1. Count by category:
       ```sql
       SELECT CATEGORIA, COUNT(*) as total 
       FROM SALUD_MENTAL_FEATURED 
       GROUP BY CATEGORIA
       ```
    
    2. Patients by age range with parameters:
       ```sql
       SELECT NOMBRE_COMPLETO, EDAD, SEXO 
       FROM SALUD_MENTAL_FEATURED 
       WHERE EDAD BETWEEN :min_edad AND :max_edad
       ```
       params: {"min_edad": 30, "max_edad": 40}
    
    3. Average stay by service:
       ```sql
       SELECT SERVICIO, AVG(ESTANCIA_DIAS) as promedio_estancia 
       FROM SALUD_MENTAL_FEATURED 
       WHERE ESTANCIA_DIAS IS NOT NULL 
       GROUP BY SERVICIO
       ```
    """
    try:
        query = request.query.strip()
        
        # Log detallado de la petición
        logger.info("=" * 80)
        logger.info("🔍 [CUSTOM QUERY] Nueva petición recibida")
        logger.info(f"📝 Query original: {query}")
        logger.info(f"🔑 Parámetros: {request.params}")
        logger.info(f"📊 Límite: {request.limit}")
        logger.info("=" * 80)
        
        # Agregar LIMIT si no está presente (para Oracle usamos FETCH FIRST)
        query_upper = query.upper()
        if 'FETCH FIRST' not in query_upper and 'ROWNUM' not in query_upper:
            # Agregar limit automáticamente
            query = f"{query} FETCH FIRST {request.limit} ROWS ONLY"
            logger.info(f"➕ Límite añadido automáticamente: FETCH FIRST {request.limit} ROWS ONLY")
        
        logger.info(f"✅ Query final a ejecutar: {query}")
        
        # Set autocommit for SELECT queries (should be read-only)
        connection.autocommit = True
        
        cursor = connection.cursor()
        
        try:
            # Ejecutar query con o sin parámetros
            if request.params:
                logger.info(f"🔐 Ejecutando con parámetros: {request.params}")
                cursor.execute(query, **request.params)
            else:
                logger.info("📝 Ejecutando sin parámetros")
                cursor.execute(query)
            
            logger.info("✅ Query ejecutado, obteniendo metadatos...")
            
            # Obtener nombres de columnas
            columns = [desc[0] for desc in cursor.description]
            logger.info(f"📋 Columnas obtenidas: {columns}")
            
            logger.info("📥 Fetching resultados...")
            
            # Obtener resultados
            rows = cursor.fetchall()
            logger.info(f"📊 Número de filas obtenidas: {len(rows)}")
        finally:
            cursor.close()
            logger.info("✅ Cursor cerrado")
        
        # Mostrar primeras 3 filas para debugging
        if rows:
            logger.info(f"🔍 Primeras {min(3, len(rows))} filas:")
            for i, row in enumerate(rows[:3]):
                logger.info(f"   Fila {i+1}: {row}")
        
        logger.info("🔄 Convirtiendo resultados a diccionarios...")
        
        # Convertir a lista de diccionarios
        data = []
        for row in rows:
            row_dict = {}
            for i, col_name in enumerate(columns):
                value = row[i]
                # Convertir tipos especiales a strings/números
                if hasattr(value, 'isoformat'):  # datetime/date
                    value = value.isoformat()
                elif isinstance(value, (bytes, bytearray)):  # binary
                    value = value.decode('utf-8', errors='ignore')
                row_dict[col_name] = value
            data.append(row_dict)
        
        logger.info(f"✅ Datos convertidos: {len(data)} registros")
        
        # Mensaje de advertencia si se alcanzó el límite
        message = None
        if len(data) == request.limit:
            message = f"Results limited to {request.limit} rows. Use a more specific query or increase the limit."
            logger.warning(f"⚠️ {message}")
        
        logger.info("✅ Query ejecutado exitosamente")
        logger.info(f"📤 Retornando {len(data)} filas")
        logger.info("=" * 80)
        
        return {
            "success": True,
            "rows_returned": len(data),
            "columns": columns,
            "data": data,
            "query_executed": query,
            "message": message
        }
        
    except oracledb.Error as e:
        error_obj, = e.args
        logger.error("=" * 80)
        logger.error(f"❌ [DATABASE ERROR] Error ejecutando query")
        logger.error(f"Query: {query}")
        logger.error(f"Params: {request.params}")
        logger.error(f"Error: {error_obj.message}")
        logger.error(f"Code: {error_obj.code}")
        logger.error("=" * 80)
        raise HTTPException(
            status_code=500, 
            detail=f"Database error: {error_obj.message}"
        )
    except ValueError as e:
        logger.warning("=" * 80)
        logger.warning(f"⚠️ [VALIDATION ERROR] Query inválido rechazado")
        logger.warning(f"Query: {request.query}")
        logger.warning(f"Error: {str(e)}")
        logger.warning("=" * 80)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("=" * 80)
        logger.error(f"❌ [UNEXPECTED ERROR] Error inesperado")
        logger.error(f"Query: {query if 'query' in locals() else request.query}")
        logger.error(f"Params: {request.params}")
        logger.error(f"Error: {str(e)}")
        logger.error(f"Type: {type(e).__name__}")
        logger.error("=" * 80)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get(
    "/examples",
    response_model=List[QueryExample],
    summary="Get example queries",
    description="Get a list of example SQL queries that can be used with the execute endpoint."
)
async def get_query_examples():
    """
    Get a list of useful example queries for the SALUD_MENTAL_FEATURED table.
    """
    examples = [
        {
            "name": "Distribución por Categoría",
            "description": "Cuenta cuántos casos hay por cada categoría de diagnóstico",
            "query": 'SELECT CATEGORIA, COUNT(*) as total FROM SALUD_MENTAL_FEATURED WHERE CATEGORIA IS NOT NULL GROUP BY CATEGORIA ORDER BY total DESC'
        },
        {
            "name": "Pacientes por Edad",
            "description": "Lista pacientes mayores de cierta edad (usar parámetro :edad)",
            "query": 'SELECT NOMBRE_COMPLETO, EDAD, SEXO, COMUNIDAD_AUTONOMA FROM SALUD_MENTAL_FEATURED WHERE EDAD > :edad ORDER BY EDAD DESC'
        },
        {
            "name": "Promedio de Estancia por Servicio",
            "description": "Calcula el promedio de días de estancia por servicio hospitalario",
            "query": 'SELECT SERVICIO, ROUND(AVG(ESTANCIA_DIAS), 2) as promedio_dias, COUNT(*) as casos FROM SALUD_MENTAL_FEATURED WHERE SERVICIO IS NOT NULL AND ESTANCIA_DIAS IS NOT NULL GROUP BY SERVICIO ORDER BY promedio_dias DESC'
        },
        {
            "name": "Ingresos por Comunidad Autónoma",
            "description": "Cuenta ingresos agrupados por comunidad autónoma",
            "query": 'SELECT COMUNIDAD_AUTONOMA, COUNT(*) as total_ingresos FROM SALUD_MENTAL_FEATURED WHERE COMUNIDAD_AUTONOMA IS NOT NULL GROUP BY COMUNIDAD_AUTONOMA ORDER BY total_ingresos DESC'
        },
        {
            "name": "Distribución por Sexo y Rango de Edad",
            "description": "Analiza la distribución por sexo en diferentes rangos de edad",
            "query": """SELECT 
    CASE WHEN SEXO = 1 THEN 'Hombre' WHEN SEXO = 2 THEN 'Mujer' ELSE 'Otro' END as sexo,
    CASE 
        WHEN EDAD BETWEEN 0 AND 17 THEN '0-17'
        WHEN EDAD BETWEEN 18 AND 35 THEN '18-35'
        WHEN EDAD BETWEEN 36 AND 55 THEN '36-55'
        WHEN EDAD > 55 THEN '55+'
        ELSE 'Desconocido'
    END as rango_edad,
    COUNT(*) as total
FROM SALUD_MENTAL_FEATURED
WHERE EDAD IS NOT NULL AND SEXO IS NOT NULL
GROUP BY SEXO, CASE 
    WHEN EDAD BETWEEN 0 AND 17 THEN '0-17'
    WHEN EDAD BETWEEN 18 AND 35 THEN '18-35'
    WHEN EDAD BETWEEN 36 AND 55 THEN '36-55'
    WHEN EDAD > 55 THEN '55+'
    ELSE 'Desconocido'
END
ORDER BY sexo, rango_edad"""
        },
        {
            "name": "Top 10 Diagnósticos Principales",
            "description": "Los 10 diagnósticos principales más frecuentes",
            "query": 'SELECT DIAGNOSTICO_PRINCIPAL, CATEGORIA, COUNT(*) as casos FROM SALUD_MENTAL_FEATURED WHERE DIAGNOSTICO_PRINCIPAL IS NOT NULL GROUP BY DIAGNOSTICO_PRINCIPAL, CATEGORIA ORDER BY casos DESC FETCH FIRST 10 ROWS ONLY'
        },
        {
            "name": "Análisis de Reingresos",
            "description": "Estadísticas sobre reingresos hospitalarios",
            "query": 'SELECT REINGRESO, COUNT(*) as total, ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as porcentaje FROM SALUD_MENTAL_FEATURED WHERE REINGRESO IS NOT NULL GROUP BY REINGRESO ORDER BY total DESC'
        },
        {
            "name": "Costes por Categoría",
            "description": "Coste promedio por categoría de diagnóstico",
            "query": 'SELECT CATEGORIA, COUNT(*) as casos, ROUND(AVG(COSTE_APR), 2) as coste_promedio, ROUND(MIN(COSTE_APR), 2) as coste_min, ROUND(MAX(COSTE_APR), 2) as coste_max FROM SALUD_MENTAL_FEATURED WHERE CATEGORIA IS NOT NULL AND COSTE_APR IS NOT NULL GROUP BY CATEGORIA ORDER BY coste_promedio DESC'
        },
        {
            "name": "Ingresos por Mes y Año",
            "description": "Tendencia de ingresos agrupados por mes y año",
            "query": 'SELECT TO_CHAR(FECHA_INGRESO, \'YYYY-MM\') as mes_anio, COUNT(*) as total_ingresos FROM SALUD_MENTAL_FEATURED WHERE FECHA_INGRESO IS NOT NULL GROUP BY TO_CHAR(FECHA_INGRESO, \'YYYY-MM\') ORDER BY mes_anio DESC'
        },
        {
            "name": "Pacientes con Estancia Prolongada",
            "description": "Pacientes con estancia mayor a un número de días (usar parámetro :dias)",
            "query": 'SELECT NOMBRE_COMPLETO, EDAD, SEXO, ESTANCIA_DIAS, DIAGNOSTICO_PRINCIPAL, SERVICIO FROM SALUD_MENTAL_FEATURED WHERE ESTANCIA_DIAS > :dias ORDER BY ESTANCIA_DIAS DESC'
        }
    ]
    
    return examples


@router.get(
    "/schema",
    summary="Get table schema information",
    description="Get information about available columns in SALUD_MENTAL_FEATURED table."
)
async def get_table_schema(connection=Depends(get_db_connection)):
    """
    Get schema information about the SALUD_MENTAL_FEATURED table.
    Returns column names, data types, and nullable status.
    """
    try:
        cursor = connection.cursor()
        
        # Query para obtener información de columnas
        query = """
        SELECT 
            COLUMN_NAME,
            DATA_TYPE,
            DATA_LENGTH,
            NULLABLE
        FROM USER_TAB_COLUMNS
        WHERE TABLE_NAME = 'SALUD_MENTAL_FEATURED'
        ORDER BY COLUMN_ID
        """
        
        cursor.execute(query)
        
        columns_info = []
        for row in cursor:
            columns_info.append({
                "column_name": row[0],
                "data_type": row[1],
                "data_length": row[2],
                "nullable": row[3] == 'Y'
            })
        
        cursor.close()
        
        return {
            "table_name": "SALUD_MENTAL_FEATURED",
            "total_columns": len(columns_info),
            "columns": columns_info
        }
        
    except oracledb.Error as e:
        error_obj, = e.args
        logger.error(f"Database error getting schema: {error_obj.message}")
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {error_obj.message}"
        )
    except Exception as e:
        logger.error(f"Error getting schema: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
