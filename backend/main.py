from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.database.connection import db_connection
from app.api import health, statistics, data

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    # Startup
    logger.info("Starting up application...")
    try:
        db_connection.initialize_pool()
        logger.info("Database connection pool initialized")
    except Exception as e:
        logger.error(f"Failed to initialize database pool: {str(e)}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down application...")
    db_connection.close_pool()
    logger.info("Database connection pool closed")


# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
    REST API for accessing health mental data from Oracle Autonomous Database.
    
    ## Features
    
    * **Statistics**: Get various statistical analyses of health mental data
    * **Data Access**: Retrieve raw data from patients, diagnoses, and hospital admissions
    * **Health Check**: Monitor API and database status
    
    ## Database Schema
    
    The API provides access to three main tables:
    
    * **PACIENTES**: Patient demographic information
    * **DIAGNOSTICOS**: Mental health diagnoses with ICD-10 codes
    * **INGRESOS_HOSPITALARIOS**: Hospital admission records
    
    ## Authentication
    
    Currently, the API is open for development. Production deployment should implement
    proper authentication and authorization mechanisms.
    
    ## Rate Limiting
    
    No rate limiting is currently implemented. Consider adding rate limiting for production use.
    """,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix=settings.API_V1_PREFIX)
app.include_router(statistics.router, prefix=settings.API_V1_PREFIX)
app.include_router(data.router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint with API information.
    """
    return {
        "message": "Malackathon 2025 - Health Mental Data API",
        "version": settings.VERSION,
        "docs": "/docs",
        "redoc": "/redoc",
        "openapi": f"{settings.API_V1_PREFIX}/openapi.json"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
