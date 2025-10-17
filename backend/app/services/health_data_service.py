from typing import List, Optional
from datetime import datetime
import oracledb
import logging

logger = logging.getLogger(__name__)


class HealthDataService:
    """
    Service layer for health mental data operations.
    Handles all database queries and business logic.
    """
    
    @staticmethod
    def get_diagnosticos_stats(connection) -> List[dict]:
        """
        Get diagnosis statistics grouped by category.
        
        Args:
            connection: Database connection
            
        Returns:
            List of dictionaries with diagnosis statistics
        """
        try:
            cursor = connection.cursor()
            query = """
                SELECT 
                    CATEGORIA,
                    COUNT(*) as total,
                    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as porcentaje
                FROM SALUD_MENTAL_FEATURED
                WHERE CATEGORIA IS NOT NULL
                GROUP BY CATEGORIA
                ORDER BY total DESC
            """
            cursor.execute(query)
            
            results = []
            for row in cursor:
                results.append({
                    "categoria": row[0],
                    "total": row[1],
                    "porcentaje": float(row[2])
                })
            
            cursor.close()
            return results
        except Exception as e:
            logger.error(f"Error getting diagnosis stats: {str(e)}")
            raise
    
    @staticmethod
    def get_edad_distribution(connection) -> List[dict]:
        """
        Get age distribution statistics.
        
        Args:
            connection: Database connection
            
        Returns:
            List of dictionaries with age distribution
        """
        try:
            cursor = connection.cursor()
            query = """
                SELECT 
                    CASE 
                        WHEN EDAD BETWEEN 0 AND 17 THEN '0-17'
                        WHEN EDAD BETWEEN 18 AND 25 THEN '18-25'
                        WHEN EDAD BETWEEN 26 AND 35 THEN '26-35'
                        WHEN EDAD BETWEEN 36 AND 45 THEN '36-45'
                        WHEN EDAD BETWEEN 46 AND 55 THEN '46-55'
                        WHEN EDAD BETWEEN 56 AND 65 THEN '56-65'
                        WHEN EDAD > 65 THEN '65+'
                        ELSE 'Unknown'
                    END as rango_edad,
                    COUNT(*) as total
                FROM SALUD_MENTAL_FEATURED
                WHERE EDAD IS NOT NULL
                GROUP BY 
                    CASE 
                        WHEN EDAD BETWEEN 0 AND 17 THEN '0-17'
                        WHEN EDAD BETWEEN 18 AND 25 THEN '18-25'
                        WHEN EDAD BETWEEN 26 AND 35 THEN '26-35'
                        WHEN EDAD BETWEEN 36 AND 45 THEN '36-45'
                        WHEN EDAD BETWEEN 46 AND 55 THEN '46-55'
                        WHEN EDAD BETWEEN 56 AND 65 THEN '56-65'
                        WHEN EDAD > 65 THEN '65+'
                        ELSE 'Unknown'
                    END
                ORDER BY 
                    CASE rango_edad
                        WHEN '0-17' THEN 1
                        WHEN '18-25' THEN 2
                        WHEN '26-35' THEN 3
                        WHEN '36-45' THEN 4
                        WHEN '46-55' THEN 5
                        WHEN '56-65' THEN 6
                        WHEN '65+' THEN 7
                        ELSE 8
                    END
            """
            cursor.execute(query)
            
            results = []
            for row in cursor:
                results.append({
                    "rango_edad": row[0],
                    "total": row[1]
                })
            
            cursor.close()
            return results
        except Exception as e:
            logger.error(f"Error getting age distribution: {str(e)}")
            raise
    
    @staticmethod
    def get_genero_distribution(connection) -> List[dict]:
        """
        Get gender distribution statistics.
        
        Args:
            connection: Database connection
            
        Returns:
            List of dictionaries with gender distribution
        """
        try:
            cursor = connection.cursor()
            query = """
                SELECT 
                    CASE 
                        WHEN SEXO = 1 THEN 'Hombre'
                        WHEN SEXO = 2 THEN 'Mujer'
                        ELSE 'Otro'
                    END as sexo,
                    COUNT(*) as total,
                    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as porcentaje
                FROM SALUD_MENTAL_FEATURED
                WHERE SEXO IS NOT NULL
                GROUP BY SEXO
                ORDER BY total DESC
            """
            cursor.execute(query)
            
            results = []
            for row in cursor:
                results.append({
                    "sexo": row[0],
                    "total": row[1],
                    "porcentaje": float(row[2])
                })
            
            cursor.close()
            return results
        except Exception as e:
            logger.error(f"Error getting gender distribution: {str(e)}")
            raise
    
    @staticmethod
    def get_tipo_ingreso_stats(connection) -> List[dict]:
        """
        Get admission type statistics (circunstancia de contacto).
        
        Args:
            connection: Database connection
            
        Returns:
            List of dictionaries with admission type statistics
        """
        try:
            cursor = connection.cursor()
            query = """
                SELECT 
                    CIRCUNSTANCIA_DE_CONTACTO,
                    COUNT(*) as total,
                    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as porcentaje
                FROM SALUD_MENTAL_FEATURED
                WHERE CIRCUNSTANCIA_DE_CONTACTO IS NOT NULL
                GROUP BY CIRCUNSTANCIA_DE_CONTACTO
                ORDER BY total DESC
            """
            cursor.execute(query)
            
            results = []
            for row in cursor:
                results.append({
                    "tipo_ingreso": str(row[0]),
                    "total": row[1],
                    "porcentaje": float(row[2])
                })
            
            cursor.close()
            return results
        except Exception as e:
            logger.error(f"Error getting admission type stats: {str(e)}")
            raise
    
    @staticmethod
    def get_tendencia_mensual(connection, year: Optional[int] = None) -> List[dict]:
        """
        Get monthly admission trends.
        
        Args:
            connection: Database connection
            year: Optional year filter
            
        Returns:
            List of dictionaries with monthly trends
        """
        try:
            cursor = connection.cursor()
            
            if year:
                query = """
                    SELECT 
                        TO_CHAR(FECHA_INGRESO, 'MM') as mes,
                        TO_CHAR(FECHA_INGRESO, 'YYYY') as anio,
                        COUNT(*) as total
                    FROM SALUD_MENTAL_FEATURED
                    WHERE EXTRACT(YEAR FROM FECHA_INGRESO) = :year
                    GROUP BY TO_CHAR(FECHA_INGRESO, 'MM'), TO_CHAR(FECHA_INGRESO, 'YYYY')
                    ORDER BY mes
                """
                cursor.execute(query, year=year)
            else:
                query = """
                    SELECT 
                        TO_CHAR(FECHA_INGRESO, 'MM') as mes,
                        TO_CHAR(FECHA_INGRESO, 'YYYY') as anio,
                        COUNT(*) as total
                    FROM SALUD_MENTAL_FEATURED
                    WHERE FECHA_INGRESO >= ADD_MONTHS(SYSDATE, -12)
                    GROUP BY TO_CHAR(FECHA_INGRESO, 'MM'), TO_CHAR(FECHA_INGRESO, 'YYYY')
                    ORDER BY anio, mes
                """
                cursor.execute(query)
            
            results = []
            month_names = {
                '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
                '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
                '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
            }
            
            for row in cursor:
                results.append({
                    "mes": month_names.get(row[0], row[0]),
                    "anio": row[1],
                    "total": row[2]
                })
            
            cursor.close()
            return results
        except Exception as e:
            logger.error(f"Error getting monthly trends: {str(e)}")
            raise
    
    @staticmethod
    def get_duracion_estancia(connection) -> List[dict]:
        """
        Get hospital stay duration statistics.
        
        Args:
            connection: Database connection
            
        Returns:
            List of dictionaries with stay duration statistics
        """
        try:
            cursor = connection.cursor()
            query = """
                SELECT 
                    CASE 
                        WHEN ESTANCIA_DIAS BETWEEN 1 AND 3 THEN '1-3 dias'
                        WHEN ESTANCIA_DIAS BETWEEN 4 AND 7 THEN '4-7 dias'
                        WHEN ESTANCIA_DIAS BETWEEN 8 AND 14 THEN '8-14 dias'
                        WHEN ESTANCIA_DIAS BETWEEN 15 AND 30 THEN '15-30 dias'
                        WHEN ESTANCIA_DIAS > 30 THEN '30+ dias'
                        ELSE 'Unknown'
                    END as rango_dias,
                    COUNT(*) as total
                FROM SALUD_MENTAL_FEATURED
                WHERE ESTANCIA_DIAS IS NOT NULL
                GROUP BY 
                    CASE 
                        WHEN ESTANCIA_DIAS BETWEEN 1 AND 3 THEN '1-3 dias'
                        WHEN ESTANCIA_DIAS BETWEEN 4 AND 7 THEN '4-7 dias'
                        WHEN ESTANCIA_DIAS BETWEEN 8 AND 14 THEN '8-14 dias'
                        WHEN ESTANCIA_DIAS BETWEEN 15 AND 30 THEN '15-30 dias'
                        WHEN ESTANCIA_DIAS > 30 THEN '30+ dias'
                        ELSE 'Unknown'
                    END
                ORDER BY 
                    CASE rango_dias
                        WHEN '1-3 dias' THEN 1
                        WHEN '4-7 dias' THEN 2
                        WHEN '8-14 dias' THEN 3
                        WHEN '15-30 dias' THEN 4
                        WHEN '30+ dias' THEN 5
                        ELSE 6
                    END
            """
            cursor.execute(query)
            
            results = []
            for row in cursor:
                results.append({
                    "rango_dias": row[0],
                    "total": row[1]
                })
            
            cursor.close()
            return results
        except Exception as e:
            logger.error(f"Error getting stay duration stats: {str(e)}")
            raise
    
    @staticmethod
    def get_pacientes_list(connection, skip: int = 0, limit: int = 100) -> List[dict]:
        """
        Get paginated list of patients/registros.
        
        Args:
            connection: Database connection
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of patient dictionaries
        """
        try:
            cursor = connection.cursor()
            query = """
                SELECT NOMBRE_COMPLETO, EDAD, SEXO, COMUNIDAD_AUTONOMA, FECHA_NACIMIENTO
                FROM SALUD_MENTAL_FEATURED
                ORDER BY NOMBRE_COMPLETO
                OFFSET :skip ROWS
                FETCH NEXT :limit ROWS ONLY
            """
            cursor.execute(query, skip=skip, limit=limit)
            
            results = []
            for row in cursor:
                results.append({
                    "nombre": row[0],
                    "edad": row[1],
                    "sexo": row[2],
                    "comunidad_autonoma": row[3],
                    "fecha_de_nacimiento": row[4].isoformat() if row[4] else None
                })
            
            cursor.close()
            return results
        except Exception as e:
            logger.error(f"Error getting patients list: {str(e)}")
            raise
    
    @staticmethod
    def get_diagnosticos_list(connection, skip: int = 0, limit: int = 100) -> List[dict]:
        """
        Get paginated list of diagnoses.
        
        Args:
            connection: Database connection
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of diagnosis dictionaries
        """
        try:
            cursor = connection.cursor()
            query = """
                SELECT DIAGNOSTICO_PRINCIPAL, CATEGORIA, COUNT(*) as casos
                FROM SALUD_MENTAL_FEATURED
                WHERE DIAGNOSTICO_PRINCIPAL IS NOT NULL
                GROUP BY DIAGNOSTICO_PRINCIPAL, CATEGORIA
                ORDER BY casos DESC
                OFFSET :skip ROWS
                FETCH NEXT :limit ROWS ONLY
            """
            cursor.execute(query, skip=skip, limit=limit)
            
            results = []
            for row in cursor:
                results.append({
                    "diagnostico_principal": row[0],
                    "categoria": row[1],
                    "casos": row[2]
                })
            
            cursor.close()
            return results
        except Exception as e:
            logger.error(f"Error getting diagnoses list: {str(e)}")
            raise
    
    @staticmethod
    def get_ingresos_list(connection, skip: int = 0, limit: int = 100) -> List[dict]:
        """
        Get paginated list of hospital admissions.
        
        Args:
            connection: Database connection
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of admission dictionaries
        """
        try:
            cursor = connection.cursor()
            query = """
                SELECT NOMBRE_COMPLETO, FECHA_INGRESO, FECHA_FIN_CONTACTO, 
                       ESTANCIA_DIAS, DIAGNOSTICO_PRINCIPAL, CATEGORIA, 
                       TIPO_ALTA, SERVICIO
                FROM SALUD_MENTAL_FEATURED
                WHERE FECHA_INGRESO IS NOT NULL
                ORDER BY FECHA_INGRESO DESC
                OFFSET :skip ROWS
                FETCH NEXT :limit ROWS ONLY
            """
            cursor.execute(query, skip=skip, limit=limit)
            
            results = []
            for row in cursor:
                results.append({
                    "nombre": row[0],
                    "fecha_de_ingreso": row[1].isoformat() if row[1] else None,
                    "fecha_de_fin_contacto": row[2].isoformat() if row[2] else None,
                    "estancia_dias": row[3],
                    "diagnostico_principal": row[4],
                    "categoria": row[5],
                    "tipo_alta": row[6],
                    "servicio": row[7]
                })
            
            cursor.close()
            return results
        except Exception as e:
            logger.error(f"Error getting admissions list: {str(e)}")
            raise
    
    @staticmethod
    def get_comunidad_stats(connection) -> List[dict]:
        """
        Get statistics by Comunidad Autónoma.
        
        Args:
            connection: Database connection
            
        Returns:
            List of dictionaries with community statistics
        """
        try:
            cursor = connection.cursor()
            query = """
                SELECT 
                    COMUNIDAD_AUTONOMA,
                    COUNT(*) as total,
                    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as porcentaje
                FROM SALUD_MENTAL_FEATURED
                WHERE COMUNIDAD_AUTONOMA IS NOT NULL
                GROUP BY COMUNIDAD_AUTONOMA
                ORDER BY total DESC
            """
            cursor.execute(query)
            
            results = []
            for row in cursor:
                results.append({
                    "comunidad_autonoma": row[0],
                    "total": row[1],
                    "porcentaje": float(row[2])
                })
            
            cursor.close()
            return results
        except Exception as e:
            logger.error(f"Error getting community stats: {str(e)}")
            raise
    
    @staticmethod
    def get_servicio_stats(connection) -> List[dict]:
        """
        Get statistics by service.
        
        Args:
            connection: Database connection
            
        Returns:
            List of dictionaries with service statistics
        """
        try:
            cursor = connection.cursor()
            query = """
                SELECT 
                    SERVICIO,
                    COUNT(*) as total,
                    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as porcentaje
                FROM SALUD_MENTAL_FEATURED
                WHERE SERVICIO IS NOT NULL
                GROUP BY SERVICIO
                ORDER BY total DESC
                FETCH FIRST 20 ROWS ONLY
            """
            cursor.execute(query)
            
            results = []
            for row in cursor:
                results.append({
                    "servicio": row[0],
                    "total": row[1],
                    "porcentaje": float(row[2])
                })
            
            cursor.close()
            return results
        except Exception as e:
            logger.error(f"Error getting service stats: {str(e)}")
            raise
    
    @staticmethod
    def count_total_registros(connection) -> int:
        """
        Get total count of records.
        
        Args:
            connection: Database connection
            
        Returns:
            Total count of records
        """
        try:
            cursor = connection.cursor()
            query = "SELECT COUNT(*) FROM SALUD_MENTAL_FEATURED"
            cursor.execute(query)
            result = cursor.fetchone()
            cursor.close()
            return result[0] if result else 0
        except Exception as e:
            logger.error(f"Error counting records: {str(e)}")
            raise

