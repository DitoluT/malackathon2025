from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import time

from app.config import settings
from app.database.connection import db_connection
from app.api import health, statistics, data, query, ai_analysis

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
    REST API for accessing mental health data from Oracle Autonomous Database.
    
    ## Features
    
    * **Statistics**: Get various statistical analyses of mental health data
    * **Data Access**: Retrieve data from patients, diagnoses, and hospital admissions
    * **Custom Queries**: Execute custom SQL SELECT queries with safety checks
    * **Health Check**: Monitor API and database status
    
    ## Database Schema
    
    The API provides access to the main table:
    
        **Available Tables:**
    
    * **SALUD_MENTAL_FEATURED**: Complete mental health diagnosis data (112 columns)
      - Patient demographics (age, gender, location)
      - Location data (autonomous community, country)
      - Admission details (dates, duration, service)
      - Diagnoses (principal + 19 additional diagnoses)
      - Clinical data (GDR, APR, costs, etc.)
    
    ## Custom Queries
    
    The `/query/execute` endpoint allows you to run custom SQL SELECT queries with:
    - **Security**: Only SELECT queries allowed, dangerous operations blocked
    - **Parameters**: Support for parameterized queries to prevent SQL injection
    - **Examples**: Use `/query/examples` to see useful query templates
    - **Schema Info**: Use `/query/schema` to explore available columns
    
    ## Authentication
    
    Currently, the API is open for development. Production deployment should implement
    proper authentication and authorization mechanisms.
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


# Add logging middleware to track all requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests with detailed information."""
    start_time = time.time()
    
    # Log request details
    logger.info("=" * 80)
    logger.info(f"🌐 [HTTP REQUEST] {request.method} {request.url.path}")
    logger.info(f"📍 Full URL: {request.url}")
    logger.info(f"🔤 Query params: {dict(request.query_params)}")
    logger.info(f"🌍 Client: {request.client.host if request.client else 'Unknown'}")
    
    # Note: No leemos el body aquí porque consumiría el stream
    # El logging del body se hace en cada endpoint individual
    
    # Process request
    response = await call_next(request)
    
    # Log response
    process_time = (time.time() - start_time) * 1000
    logger.info(f"✅ Status: {response.status_code} | Time: {process_time:.2f}ms")
    logger.info("=" * 80)
    
    return response


# Include routers
app.include_router(health.router, prefix=settings.API_V1_PREFIX)
app.include_router(statistics.router, prefix=settings.API_V1_PREFIX)
app.include_router(data.router, prefix=settings.API_V1_PREFIX)
app.include_router(query.router, prefix=settings.API_V1_PREFIX)
app.include_router(ai_analysis.router, prefix=f"{settings.API_V1_PREFIX}/ai", tags=["AI Analysis"])


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
