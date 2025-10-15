from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
import oracledb

from app.models.schemas import Paciente, Diagnostico, IngresoHospitalario, ErrorResponse
from app.database.connection import get_db_connection
from app.services.health_data_service import HealthDataService

router = APIRouter(prefix="/data", tags=["Data"])


@router.get(
    "/pacientes",
    response_model=List[Paciente],
    summary="Get patients list",
    description="Retrieve a paginated list of patients from the database.",
    responses={
        200: {"description": "Successfully retrieved patients list"},
        400: {"model": ErrorResponse, "description": "Invalid pagination parameters"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def get_pacientes(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    connection=Depends(get_db_connection)
):
    """
    Get paginated list of patients.
    
    Parameters:
    - skip: Number of records to skip (default: 0)
    - limit: Maximum number of records to return (default: 100, max: 1000)
    """
    try:
        results = HealthDataService.get_pacientes_list(connection, skip, limit)
        return results
    except oracledb.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/diagnosticos",
    response_model=List[Diagnostico],
    summary="Get diagnoses list",
    description="Retrieve a paginated list of diagnoses from the database.",
    responses={
        200: {"description": "Successfully retrieved diagnoses list"},
        400: {"model": ErrorResponse, "description": "Invalid pagination parameters"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def get_diagnosticos(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    connection=Depends(get_db_connection)
):
    """
    Get paginated list of diagnoses.
    
    Parameters:
    - skip: Number of records to skip (default: 0)
    - limit: Maximum number of records to return (default: 100, max: 1000)
    """
    try:
        results = HealthDataService.get_diagnosticos_list(connection, skip, limit)
        return results
    except oracledb.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/ingresos",
    response_model=List[IngresoHospitalario],
    summary="Get hospital admissions list",
    description="Retrieve a paginated list of hospital admissions from the database.",
    responses={
        200: {"description": "Successfully retrieved admissions list"},
        400: {"model": ErrorResponse, "description": "Invalid pagination parameters"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def get_ingresos(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    connection=Depends(get_db_connection)
):
    """
    Get paginated list of hospital admissions.
    
    Parameters:
    - skip: Number of records to skip (default: 0)
    - limit: Maximum number of records to return (default: 100, max: 1000)
    """
    try:
        results = HealthDataService.get_ingresos_list(connection, skip, limit)
        return results
    except oracledb.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
