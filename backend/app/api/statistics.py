from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime
import oracledb

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

router = APIRouter(prefix="/statistics", tags=["Statistics"])


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
