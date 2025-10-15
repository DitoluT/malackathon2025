from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime
import oracledb

from app.models.schemas import (
    DiagnosticoStats,
    EdadStats,
    GeneroStats,
    TipoIngresoStats,
    TendenciaMensual,
    DuracionEstancia,
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
    - 18-25, 26-35, 36-45, 46-55, 56-65, 65+
    """
    try:
        results = HealthDataService.get_edad_distribution(connection)
        return results
    except oracledb.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/genero",
    response_model=List[GeneroStats],
    summary="Get gender distribution",
    description="Retrieve gender distribution statistics with counts and percentages.",
    responses={
        200: {"description": "Successfully retrieved gender distribution"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def get_genero_distribution(
    connection=Depends(get_db_connection)
):
    """
    Get gender distribution statistics.
    
    Returns patient count grouped by gender with percentages.
    """
    try:
        results = HealthDataService.get_genero_distribution(connection)
        return results
    except oracledb.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/tipo-ingreso",
    response_model=List[TipoIngresoStats],
    summary="Get admission type statistics",
    description="Retrieve statistics about hospital admission types.",
    responses={
        200: {"description": "Successfully retrieved admission type statistics"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def get_tipo_ingreso_stats(
    connection=Depends(get_db_connection)
):
    """
    Get admission type statistics.
    
    Returns admission counts grouped by type (Urgent, Scheduled, Referred) with percentages.
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
    response_model=List[DuracionEstancia],
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
