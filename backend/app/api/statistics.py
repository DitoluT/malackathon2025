from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
from datetime import datetime
import oracledb
import statistics
import logging

from app.models.schemas import (
    DiagnosticoStats,
    EdadStats,
    SexoStats,
    TendenciaMensual,
    EstanciaStats,
    ComunidadStats,
    ServicioStats,
    ErrorResponse
)
from app.database.connection import get_db_connection
from app.services.health_data_service import HealthDataService
from pydantic import BaseModel

router = APIRouter(prefix="/statistics", tags=["Statistics"])
logger = logging.getLogger(__name__)

class StatisticsResponse(BaseModel):
    """Response model for temporal statistics."""
    success: bool
    data: List[Dict[str, Any]]
    estadisticas_numericas: Dict[str, Dict[str, Any]]
    total_records: int

def calcular_estadisticas_numericas(data: List[Dict[str, Any]], columnas_numericas: List[str]) -> Dict[str, Dict[str, Any]]:
    """
    Calcula estadísticas descriptivas para columnas numéricas.
    
    Args:
        data: Lista de diccionarios con los datos
        columnas_numericas: Lista de nombres de columnas numéricas
        
    Returns:
        dict: Diccionario con estadísticas por columna
    """
    estadisticas_map = {}
    
    for columna in columnas_numericas:
        # Extraer valores no nulos de la columna
        valores = [row[columna] for row in data if row.get(columna) is not None and isinstance(row.get(columna), (int, float))]
        
        if not valores:
            estadisticas_map[columna] = {
                'media': None,
                'mediana': None,
                'moda': None,
                'desviacion_estandar': None,
                'varianza': None,
                'minimo': None,
                'maximo': None,
                'rango': None,
                'q1': None,
                'q3': None,
                'iqr': None,
                'valores_nulos': len(data) - len(valores),
                'valores_unicos': 0,
                'total_valores': len(data)
            }
            continue
        
        # Ordenar valores para cuartiles
        valores_ordenados = sorted(valores)
        n = len(valores_ordenados)
        
        # Calcular cuartiles
        q1_index = n // 4
        q3_index = (3 * n) // 4
        q1 = valores_ordenados[q1_index] if n > 0 else None
        q3 = valores_ordenados[q3_index] if n > 0 else None
        
        # Calcular moda
        try:
            moda = statistics.mode(valores)
        except statistics.StatisticsError:
            # Si no hay moda única, usar el valor más frecuente
            moda = max(set(valores), key=valores.count) if valores else None
        
        estadisticas_map[columna] = {
            'media': round(statistics.mean(valores), 2) if valores else None,
            'mediana': round(statistics.median(valores), 2) if valores else None,
            'moda': round(moda, 2) if moda is not None else None,
            'desviacion_estandar': round(statistics.stdev(valores), 2) if len(valores) > 1 else 0,
            'varianza': round(statistics.variance(valores), 2) if len(valores) > 1 else 0,
            'minimo': round(min(valores), 2),
            'maximo': round(max(valores), 2),
            'rango': round(max(valores) - min(valores), 2),
            'q1': round(q1, 2) if q1 is not None else None,
            'q3': round(q3, 2) if q3 is not None else None,
            'iqr': round(q3 - q1, 2) if q1 is not None and q3 is not None else None,
            'valores_nulos': len(data) - len(valores),
            'valores_unicos': len(set(valores)),
            'total_valores': len(data)
        }
    
    return estadisticas_map


@router.get(
    "/diagnosticos",
    response_model=List[DiagnosticoStats],
    summary="Get diagnosis statistics",
    description="Retrieve statistics about diagnoses grouped by category with counts and percentages.",
    responses={
        200: {"description": "Successfully retrieved diagnosis statistics"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def get_diagnosticos_stats(
    connection=Depends(get_db_connection)
):
    """
    Get diagnosis statistics grouped by category.
    
    Returns a list of diagnoses with:
    - Category name
    - Total count
    - Percentage of total diagnoses
    """
    try:
        results = HealthDataService.get_diagnosticos_stats(connection)
        return results
    except oracledb.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/edad",
    response_model=List[EdadStats],
    summary="Get age distribution",
    description="Retrieve age distribution statistics grouped by age ranges.",
    responses={
        200: {"description": "Successfully retrieved age distribution"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def get_edad_distribution(
    connection=Depends(get_db_connection)
):
    """
    Get age distribution statistics.
    
    Returns patient count grouped by age ranges:
    - 0-17, 18-25, 26-35, 36-45, 46-55, 56-65, 65+
    """
    try:
        results = HealthDataService.get_edad_distribution(connection)
        return results
    except oracledb.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/sexo",
    response_model=List[SexoStats],
    summary="Get sex distribution",
    description="Retrieve sex distribution statistics with counts and percentages.",
    responses={
        200: {"description": "Successfully retrieved sex distribution"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def get_sexo_distribution(
    connection=Depends(get_db_connection)
):
    """
    Get sex distribution statistics.
    
    Returns patient count grouped by sex (1: Hombre, 2: Mujer) with percentages.
    """
    try:
        results = HealthDataService.get_genero_distribution(connection)
        return results
    except oracledb.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/circunstancia-contacto",
    response_model=List[DiagnosticoStats],
    summary="Get admission circumstance statistics",
    description="Retrieve statistics about hospital admission circumstances (Circunstancia de Contacto).",
    responses={
        200: {"description": "Successfully retrieved admission circumstance statistics"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def get_circunstancia_stats(
    connection=Depends(get_db_connection)
):
    """
    Get admission circumstance statistics.
    
    Returns admission counts grouped by circumstance of contact with percentages.
    """
    try:
        results = HealthDataService.get_tipo_ingreso_stats(connection)
        return results
    except oracledb.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/tendencia-mensual",
    response_model=List[TendenciaMensual],
    summary="Get monthly admission trends",
    description="Retrieve monthly trends of hospital admissions, optionally filtered by year.",
    responses={
        200: {"description": "Successfully retrieved monthly trends"},
        400: {"model": ErrorResponse, "description": "Invalid year parameter"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def get_tendencia_mensual(
    year: Optional[int] = Query(None, description="Filter by specific year", ge=2000, le=2100),
    connection=Depends(get_db_connection)
):
    """
    Get monthly admission trends.
    
    Optionally filter by year. If no year is provided, returns last 12 months.
    """
    try:
        results = HealthDataService.get_tendencia_mensual(connection, year)
        return results
    except oracledb.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/duracion-estancia",
    response_model=List[EstanciaStats],
    summary="Get hospital stay duration statistics",
    description="Retrieve statistics about hospital stay durations grouped by day ranges.",
    responses={
        200: {"description": "Successfully retrieved stay duration statistics"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def get_duracion_estancia(
    connection=Depends(get_db_connection)
):
    """
    Get hospital stay duration statistics.
    
    Returns patient count grouped by stay duration ranges:
    - 1-3 days, 4-7 days, 8-14 days, 15-30 days, 30+ days
    """
    try:
        results = HealthDataService.get_duracion_estancia(connection)
        return results
    except oracledb.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/comunidad-autonoma",
    response_model=List[ComunidadStats],
    summary="Get statistics by Comunidad Autónoma",
    description="Retrieve statistics grouped by Comunidad Autónoma with counts and percentages.",
    responses={
        200: {"description": "Successfully retrieved community statistics"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def get_comunidad_stats(
    connection=Depends(get_db_connection)
):
    """
    Get statistics by Comunidad Autónoma.
    
    Returns patient count grouped by autonomous community with percentages.
    """
    try:
        results = HealthDataService.get_comunidad_stats(connection)
        return results
    except oracledb.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/servicio",
    response_model=List[ServicioStats],
    summary="Get statistics by service",
    description="Retrieve statistics grouped by hospital service (top 20).",
    responses={
        200: {"description": "Successfully retrieved service statistics"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def get_servicio_stats(
    connection=Depends(get_db_connection)
):
    """
    Get statistics by service.
    
    Returns patient count grouped by hospital service with percentages (top 20).
    """
    try:
        results = HealthDataService.get_servicio_stats(connection)
        return results
    except oracledb.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/temporal-trends",
    response_model=StatisticsResponse,
    summary="Get temporal trends with full statistics",
    description="Retrieve temporal trends with complete descriptive statistics for all numeric metrics.",
    responses={
        200: {"description": "Successfully retrieved temporal trends with statistics"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def get_temporal_trends(
    connection=Depends(get_db_connection)
):
    """
    Get temporal trends with complete statistics.
    
    Returns:
    - Monthly/yearly data with all metrics
    - Descriptive statistics (mean, median, mode, variance, quartiles, etc.) for each numeric column
    """
    try:
        query = """
        SELECT 
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
          MES_INGRESO
        """
        
        cursor = connection.cursor()
        cursor.execute(query)
        
        columns = [desc[0].lower() for desc in cursor.description]
        rows = cursor.fetchall()
        
        # Transformar a lista de diccionarios
        data = []
        for row in rows:
            row_dict = {}
            for i, value in enumerate(row):
                row_dict[columns[i]] = value
            data.append(row_dict)
        
        cursor.close()
        
        # Columnas numéricas para calcular estadísticas
        columnas_numericas = [
            'total_ingresos',
            'estancia_promedio',
            'coste_promedio',
            'edad_promedio',
            'casos_severos',
            'ingresos_urgentes',
            'porcentaje_urgentes',
            'categorias_distintas'
        ]
        
        # Calcular estadísticas descriptivas
        estadisticas = calcular_estadisticas_numericas(data, columnas_numericas)
        
        logger.info(f"Temporal trends retrieved: {len(data)} records with statistics")
        
        return StatisticsResponse(
            success=True,
            data=data,
            estadisticas_numericas=estadisticas,
            total_records=len(data)
        )
        
    except Exception as e:
        logger.error(f"Error fetching temporal trends: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching temporal trends: {str(e)}"
        )
