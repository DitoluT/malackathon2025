from fastapi import APIRouter, Depends
from datetime import datetime
import oracledb

from app.models.schemas import HealthStatus
from app.database.connection import get_db_connection
from app.config import settings
from app.services.health_data_service import HealthDataService

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthStatus,
    summary="Health check endpoint",
    description="Check the health status of the API and database connection."
)
async def health_check(connection=Depends(get_db_connection)):
    """
    Health check endpoint.
    
    Returns:
    - Service status
    - Database connection status
    - Current timestamp
    - API version
    - Total records count
    """
    db_status = "connected"
    total_registros = None
    
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT 1 FROM DUAL")
        cursor.fetchone()
        cursor.close()
        
        # Get total records count
        total_registros = HealthDataService.count_total_registros(connection)
    except oracledb.Error:
        db_status = "disconnected"
    except Exception:
        db_status = "error"
    
    return {
        "status": "healthy" if db_status == "connected" else "unhealthy",
        "database": db_status,
        "timestamp": datetime.now(),
        "version": settings.VERSION,
        "total_registros": total_registros
    }
