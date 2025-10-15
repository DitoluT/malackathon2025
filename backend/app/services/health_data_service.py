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
                    d.categoria,
                    COUNT(*) as total,
                    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as porcentaje
                FROM DIAGNOSTICOS d
                INNER JOIN INGRESOS_HOSPITALARIOS ih ON d.id_diagnostico = ih.id_diagnostico
                WHERE d.categoria IS NOT NULL
                GROUP BY d.categoria
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
                        WHEN p.edad BETWEEN 18 AND 25 THEN '18-25'
                        WHEN p.edad BETWEEN 26 AND 35 THEN '26-35'
                        WHEN p.edad BETWEEN 36 AND 45 THEN '36-45'
                        WHEN p.edad BETWEEN 46 AND 55 THEN '46-55'
                        WHEN p.edad BETWEEN 56 AND 65 THEN '56-65'
                        WHEN p.edad > 65 THEN '65+'
                        ELSE 'Unknown'
                    END as rango_edad,
                    COUNT(*) as total
                FROM PACIENTES p
                INNER JOIN INGRESOS_HOSPITALARIOS ih ON p.id_paciente = ih.id_paciente
                WHERE p.edad IS NOT NULL
                GROUP BY 
                    CASE 
                        WHEN p.edad BETWEEN 18 AND 25 THEN '18-25'
                        WHEN p.edad BETWEEN 26 AND 35 THEN '26-35'
                        WHEN p.edad BETWEEN 36 AND 45 THEN '36-45'
                        WHEN p.edad BETWEEN 46 AND 55 THEN '46-55'
                        WHEN p.edad BETWEEN 56 AND 65 THEN '56-65'
                        WHEN p.edad > 65 THEN '65+'
                        ELSE 'Unknown'
                    END
                ORDER BY 
                    CASE rango_edad
                        WHEN '18-25' THEN 1
                        WHEN '26-35' THEN 2
                        WHEN '36-45' THEN 3
                        WHEN '46-55' THEN 4
                        WHEN '56-65' THEN 5
                        WHEN '65+' THEN 6
                        ELSE 7
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
                    p.genero,
                    COUNT(*) as total,
                    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as porcentaje
                FROM PACIENTES p
                INNER JOIN INGRESOS_HOSPITALARIOS ih ON p.id_paciente = ih.id_paciente
                WHERE p.genero IS NOT NULL
                GROUP BY p.genero
                ORDER BY total DESC
            """
            cursor.execute(query)
            
            results = []
            for row in cursor:
                results.append({
                    "genero": row[0],
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
        Get admission type statistics.
        
        Args:
            connection: Database connection
            
        Returns:
            List of dictionaries with admission type statistics
        """
        try:
            cursor = connection.cursor()
            query = """
                SELECT 
                    tipo_ingreso,
                    COUNT(*) as total,
                    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as porcentaje
                FROM INGRESOS_HOSPITALARIOS
                WHERE tipo_ingreso IS NOT NULL
                GROUP BY tipo_ingreso
                ORDER BY total DESC
            """
            cursor.execute(query)
            
            results = []
            for row in cursor:
                results.append({
                    "tipo_ingreso": row[0],
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
                        TO_CHAR(fecha_ingreso, 'MM') as mes,
                        TO_CHAR(fecha_ingreso, 'YYYY') as anio,
                        COUNT(*) as total
                    FROM INGRESOS_HOSPITALARIOS
                    WHERE EXTRACT(YEAR FROM fecha_ingreso) = :year
                    GROUP BY TO_CHAR(fecha_ingreso, 'MM'), TO_CHAR(fecha_ingreso, 'YYYY')
                    ORDER BY mes
                """
                cursor.execute(query, year=year)
            else:
                query = """
                    SELECT 
                        TO_CHAR(fecha_ingreso, 'MM') as mes,
                        TO_CHAR(fecha_ingreso, 'YYYY') as anio,
                        COUNT(*) as total
                    FROM INGRESOS_HOSPITALARIOS
                    WHERE fecha_ingreso >= ADD_MONTHS(SYSDATE, -12)
                    GROUP BY TO_CHAR(fecha_ingreso, 'MM'), TO_CHAR(fecha_ingreso, 'YYYY')
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
                    "anio": int(row[1]),
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
                        WHEN (fecha_alta - fecha_ingreso) BETWEEN 1 AND 3 THEN '1-3 dias'
                        WHEN (fecha_alta - fecha_ingreso) BETWEEN 4 AND 7 THEN '4-7 dias'
                        WHEN (fecha_alta - fecha_ingreso) BETWEEN 8 AND 14 THEN '8-14 dias'
                        WHEN (fecha_alta - fecha_ingreso) BETWEEN 15 AND 30 THEN '15-30 dias'
                        WHEN (fecha_alta - fecha_ingreso) > 30 THEN '30+ dias'
                        ELSE 'Unknown'
                    END as rango_dias,
                    COUNT(*) as total
                FROM INGRESOS_HOSPITALARIOS
                WHERE fecha_alta IS NOT NULL
                GROUP BY 
                    CASE 
                        WHEN (fecha_alta - fecha_ingreso) BETWEEN 1 AND 3 THEN '1-3 dias'
                        WHEN (fecha_alta - fecha_ingreso) BETWEEN 4 AND 7 THEN '4-7 dias'
                        WHEN (fecha_alta - fecha_ingreso) BETWEEN 8 AND 14 THEN '8-14 dias'
                        WHEN (fecha_alta - fecha_ingreso) BETWEEN 15 AND 30 THEN '15-30 dias'
                        WHEN (fecha_alta - fecha_ingreso) > 30 THEN '30+ dias'
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
        Get paginated list of patients.
        
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
                SELECT id_paciente, edad, genero, codigo_postal_region
                FROM PACIENTES
                ORDER BY id_paciente
                OFFSET :skip ROWS
                FETCH NEXT :limit ROWS ONLY
            """
            cursor.execute(query, skip=skip, limit=limit)
            
            results = []
            for row in cursor:
                results.append({
                    "id_paciente": row[0],
                    "edad": row[1],
                    "genero": row[2],
                    "codigo_postal_region": row[3]
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
                SELECT id_diagnostico, codigo_cie10, descripcion, categoria
                FROM DIAGNOSTICOS
                ORDER BY id_diagnostico
                OFFSET :skip ROWS
                FETCH NEXT :limit ROWS ONLY
            """
            cursor.execute(query, skip=skip, limit=limit)
            
            results = []
            for row in cursor:
                results.append({
                    "id_diagnostico": row[0],
                    "codigo_cie10": row[1],
                    "descripcion": row[2],
                    "categoria": row[3]
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
                SELECT id_ingreso, id_paciente, id_diagnostico, 
                       fecha_ingreso, fecha_alta, tipo_ingreso
                FROM INGRESOS_HOSPITALARIOS
                ORDER BY id_ingreso
                OFFSET :skip ROWS
                FETCH NEXT :limit ROWS ONLY
            """
            cursor.execute(query, skip=skip, limit=limit)
            
            results = []
            for row in cursor:
                results.append({
                    "id_ingreso": row[0],
                    "id_paciente": row[1],
                    "id_diagnostico": row[2],
                    "fecha_ingreso": row[3].isoformat() if row[3] else None,
                    "fecha_alta": row[4].isoformat() if row[4] else None,
                    "tipo_ingreso": row[5]
                })
            
            cursor.close()
            return results
        except Exception as e:
            logger.error(f"Error getting admissions list: {str(e)}")
            raise
