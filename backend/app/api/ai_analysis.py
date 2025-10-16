"""
AI Analysis API endpoints
Provides endpoints for AI-powered data analysis with statistical context.
"""
import logging
import re
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any

from app.database.connection import get_db_connection
from app.services.ai_analysis_service import AIAnalysisService

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize AI service
ai_service = AIAnalysisService()


class AIAnalysisRequest(BaseModel):
    """Request model for AI analysis."""
    query: str = Field(..., min_length=1, description="SQL query to analyze")
    user_question: Optional[str] = Field(None, description="Optional specific question for the AI")
    limit: Optional[int] = Field(100, ge=1, le=1000, description="Maximum rows to analyze")
    
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


class AIAnalysisResponse(BaseModel):
    """Response model for AI analysis."""
    success: bool
    statistics: Dict[str, Any]
    ai_insight: str
    data_sample: List[Dict[str, Any]]
    query_executed: str
    rows_analyzed: int


@router.post("/analyze", response_model=AIAnalysisResponse)
async def analyze_with_ai(
    request: AIAnalysisRequest,
    connection=Depends(get_db_connection)
):
    """
    Analyze data with AI-powered insights.
    
    This endpoint:
    1. Executes the provided SQL query
    2. Calculates statistical metrics
    3. Generates AI-powered insights using Gemini
    4. Returns both empirical data and AI analysis
    
    Args:
        request: AIAnalysisRequest with query and optional question
        connection: Database connection (injected)
        
    Returns:
        AIAnalysisResponse with statistics and AI insights
    """
    try:
        # La validación se hace automáticamente por Pydantic en el modelo
        logger.info(f"AI Analysis requested for query: {request.query[:100]}...")
        
        # Execute query
        cursor = connection.cursor()
        
        # Add limit to query if not present
        query = request.query.strip()
        if not any(keyword in query.upper() for keyword in ['FETCH FIRST', 'ROWNUM', 'LIMIT']):
            query += f" FETCH FIRST {request.limit} ROWS ONLY"
        
        cursor.execute(query)
        
        # Fetch results
        columns = [desc[0] for desc in cursor.description]
        rows = cursor.fetchall()
        
        # Transform to list of dicts
        data = []
        for row in rows:
            row_dict = {}
            for i, value in enumerate(row):
                row_dict[columns[i]] = value
            data.append(row_dict)
        
        cursor.close()
        
        if not data:
            raise HTTPException(
                status_code=404,
                detail="Query returned no results. Cannot perform analysis."
            )
        
        logger.info(f"Query returned {len(data)} rows. Analyzing...")
        
        # Perform AI analysis
        analysis_result = await ai_service.analyze_data(
            query=query,
            data=data,
            user_question=request.user_question
        )
        
        logger.info("AI analysis completed successfully")
        
        return AIAnalysisResponse(
            success=True,
            statistics=analysis_result["statistics"],
            ai_insight=analysis_result["ai_insight"],
            data_sample=analysis_result["data_sample"],
            query_executed=query,
            rows_analyzed=len(data)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"AI analysis failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"AI analysis failed: {str(e)}"
        )


@router.get("/health")
async def ai_health_check():
    """
    Health check for AI service.
    
    Returns:
        Status of AI service availability
    """
    try:
        # Check if AI is configured
        test_service = AIAnalysisService()
        
        if test_service.ai_enabled:
            return {
                "status": "healthy",
                "service": "AI Analysis",
                "model": "gemini-pro",
                "ai_enabled": True,
                "message": "Gemini AI is configured and ready"
            }
        else:
            return {
                "status": "partial",
                "service": "AI Analysis",
                "ai_enabled": False,
                "message": "Statistics available, AI insights disabled (no API key configured)",
                "instructions": "Add GEMINI_API_KEY to backend/.env to enable AI features"
            }
    except Exception as e:
        logger.error(f"AI service health check failed: {str(e)}")
        return {
            "status": "error",
            "service": "AI Analysis",
            "ai_enabled": False,
            "error": str(e)
        }
