"""
AI Analysis Service
Provides statistical analysis and AI-powered insights for health data.
"""
import logging
from typing import Dict, List, Any, Optional
import statistics
import google.generativeai as genai
from app.config import settings

logger = logging.getLogger(__name__)

class AIAnalysisService:
    """Service for generating AI-powered insights with statistical context."""
    
    def __init__(self):
        """Initialize the Gemini AI model."""
        self.ai_enabled = bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "YOUR_GEMINI_API_KEY_HERE")
        
        if self.ai_enabled:
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self.model = genai.GenerativeModel('gemini-2.0-flash')
                logger.info("Gemini AI (Flash 2.0) initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini AI: {str(e)}")
                self.ai_enabled = False
                self.model = None
        else:
            logger.warning("Gemini AI not configured - AI features will be disabled")
            self.model = None
    
    @staticmethod
    def calculate_statistics(data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate statistical metrics from query results.
        
        Args:
            data: List of dictionaries containing query results
            
        Returns:
            Dictionary with statistical metrics
        """
        if not data:
            return {
                "total_records": 0,
                "unique_categories": 0,
                "metrics": {}
            }
        
        # Extract numeric values
        values = []
        categories = set()
        
        for row in data:
            for key, value in row.items():
                if isinstance(value, (int, float)) and key.lower() not in ['id', 'year', 'edad']:
                    values.append(value)
                if isinstance(value, str) and value:
                    categories.add(value)
        
        stats = {
            "total_records": len(data),
            "unique_categories": len(categories),
            "metrics": {}
        }
        
        if values:
            stats["metrics"] = {
                "mean": round(statistics.mean(values), 2),
                "median": round(statistics.median(values), 2),
                "std_dev": round(statistics.stdev(values), 2) if len(values) > 1 else 0,
                "min": min(values),
                "max": max(values),
                "range": max(values) - min(values)
            }
        
        return stats
    
    @staticmethod
    def build_contextual_prompt(
        query: str,
        data: List[Dict[str, Any]],
        statistics: Dict[str, Any],
        user_question: Optional[str] = None
    ) -> str:
        """
        Build a contextual prompt for the AI model.
        
        Args:
            query: SQL query executed
            data: Query results (limited sample)
            statistics: Statistical metrics
            user_question: Optional user question
            
        Returns:
            Formatted prompt string
        """
        # Limit data sample to avoid token overflow
        data_sample = data[:10] if len(data) > 10 else data
        
        prompt = f"""Eres un experto analista de datos de salud mental. Analiza la siguiente información y proporciona insights valiosos y accionables.

CONTEXTO DE LA CONSULTA:
SQL Query: {query}

ESTADÍSTICAS CLAVE:
- Total de registros: {statistics['total_records']}
- Categorías únicas: {statistics['unique_categories']}
"""
        
        if statistics.get('metrics'):
            prompt += f"""
MÉTRICAS ESTADÍSTICAS:
- Media: {statistics['metrics'].get('mean', 'N/A')}
- Mediana: {statistics['metrics'].get('median', 'N/A')}
- Desviación estándar: {statistics['metrics'].get('std_dev', 'N/A')}
- Rango: {statistics['metrics'].get('min', 'N/A')} - {statistics['metrics'].get('max', 'N/A')}
"""
        
        prompt += f"""
MUESTRA DE DATOS (primeros 10 registros):
{data_sample}

"""
        
        if user_question:
            prompt += f"""PREGUNTA ESPECÍFICA DEL USUARIO:
{user_question}

"""
        
        # Detectar si es una query temporal para añadir instrucciones de predicción
        is_temporal = any(keyword in query.upper() for keyword in ['MES_INGRESO', 'FECHA_INGRESO', 'FECHA', 'TEMPORAL', 'EXTRACT', 'YEAR', 'MONTH'])
        
        if is_temporal:
            prompt += """PROPORCIONA UN ANÁLISIS PREDICTIVO EN FORMATO MARKDOWN:

## 📊 Patrones Temporales Identificados
Describe tendencias mensuales/anuales claras en los datos con estadísticas específicas

## 📈 Análisis de Estacionalidad
Identifica meses con mayor/menor actividad y posibles causas

## 🔮 Predicción Fundamentada
Basándote en los patrones históricos, proyecta cómo se comportarán los próximos 3-6 meses
- Incluye rangos numéricos específicos (ej: "incremento del 15-20%")
- Usa listas con viñetas para claridad

## ⚠️ Factores de Riesgo
Señala períodos críticos que requieren preparación adicional de recursos

## 💡 Recomendaciones Estratégicas
Acciones concretas numeradas para optimizar recursos:
1. Acción específica 1
2. Acción específica 2
3. Acción específica 3

## 📌 Métricas Clave a Monitorear
Lista de indicadores específicos para validar o ajustar las predicciones

**Importante:** Usa negritas para resaltar datos clave, listas con viñetas/numeradas, y emojis para secciones.
Responde en español, máximo 500 palabras."""
        else:
            prompt += """PROPORCIONA UN ANÁLISIS EN FORMATO MARKDOWN:

## 🔍 Patrones Principales
Análisis conciso de los patrones encontrados con datos específicos

## 🏥 Insights Clínicos
Relevantes para profesionales de salud mental:
- Insight 1 con dato específico
- Insight 2 con dato específico
- Insight 3 con dato específico

## 💡 Recomendaciones Accionables
1. Recomendación específica 1
2. Recomendación específica 2
3. Recomendación específica 3

## ⚠️ Áreas de Atención Prioritaria
Posibles preocupaciones que requieren acción inmediata

## 📈 Tendencias Significativas
Aspectos que merecen investigación adicional

**Importante:** Usa negritas para datos clave, listas organizadas, y emojis para secciones.
Responde en español, máximo 400 palabras."""
        
        return prompt
    
    async def generate_ai_insight(
        self,
        query: str,
        data: List[Dict[str, Any]],
        statistics: Dict[str, Any],
        user_question: Optional[str] = None
    ) -> str:
        """
        Generate AI-powered insight using Gemini.
        
        Args:
            query: SQL query executed
            data: Query results
            statistics: Statistical metrics
            user_question: Optional user question
            
        Returns:
            AI-generated insight text
        """
        # Si no está habilitado, retornar mensaje informativo
        if not self.ai_enabled:
            return """⚠️ Análisis con IA no disponible

Para habilitar el análisis con Gemini AI:

1. Obtén una API key gratuita en: https://makersuite.google.com/app/apikey
2. Agrega la clave al archivo backend/.env:
   GEMINI_API_KEY=tu_clave_aqui
3. Reinicia el backend

Mientras tanto, puedes revisar las estadísticas empíricas calculadas arriba que proporcionan información valiosa sobre los datos."""
        
        try:
            prompt = self.build_contextual_prompt(query, data, statistics, user_question)
            
            logger.info("Generating AI insight with Gemini")
            logger.debug(f"Prompt length: {len(prompt)} characters")
            
            response = self.model.generate_content(prompt)
            
            if not response.text:
                logger.warning("Empty response from Gemini")
                return "No se pudo generar un análisis. Por favor, intenta con diferentes parámetros."
            
            logger.info("AI insight generated successfully")
            return response.text
            
        except Exception as e:
            logger.error(f"Error generating AI insight: {str(e)}")
            # En lugar de lanzar excepción, retornar mensaje amigable
            return f"""⚠️ Error al generar análisis con IA

Error: {str(e)}

Posibles causas:
- API key inválida o expirada
- Límite de rate alcanzado (espera unos segundos)
- Problema de conexión con Google AI

Revisa las estadísticas empíricas arriba que siguen siendo válidas."""
    
    async def analyze_data(
        self,
        query: str,
        data: List[Dict[str, Any]],
        user_question: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Complete analysis pipeline: statistics + AI insights.
        
        Args:
            query: SQL query executed
            data: Query results
            user_question: Optional user question
            
        Returns:
            Dictionary with statistics and AI insights
        """
        # Calculate statistics
        stats = self.calculate_statistics(data)
        
        # Generate AI insight
        ai_insight = await self.generate_ai_insight(query, data, stats, user_question)
        
        return {
            "statistics": stats,
            "ai_insight": ai_insight,
            "data_sample": data[:20],  # Return limited sample
            "query_executed": query
        }
