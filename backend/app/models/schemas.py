from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime


# ============================================================================
# MODELO PRINCIPAL: ENFERMEDADESMENTALESDIAGNOSTICO
# ============================================================================

class RegistroMentalBase(BaseModel):
    """
    Modelo base para registros de enfermedades mentales y diagnóstico.
    Basado en la tabla ENFERMEDADESMENTALESDIAGNOSTICO.
    """
    # Información del paciente
    comunidad_autonoma: Optional[str] = Field(None, alias="Comunidad Autónoma")
    nombre: Optional[str] = Field(None, alias="NOMBRE")
    fecha_de_nacimiento: Optional[date] = Field(None, alias="FECHA_DE_NACIMIENTO")
    sexo: Optional[int] = Field(None, alias="SEXO")
    edad: Optional[int] = Field(None, alias="EDAD")
    edad_en_ingreso: Optional[int] = Field(None, alias="EDAD_EN_INGRESO")
    
    # Ubicación
    ccaa_residencia: Optional[str] = Field(None, alias="CCAA_RESIDENCIA")
    pais_nacimiento: Optional[str] = Field(None, alias="País Nacimiento")
    pais_residencia: Optional[int] = Field(None, alias="País Residencia")
    
    # Fechas de contacto/ingreso
    fecha_de_ingreso: Optional[date] = Field(None, alias="FECHA_DE_INGRESO")
    fecha_de_inicio_contacto: Optional[str] = Field(None, alias="FECHA_DE_INICIO_CONTACTO")
    fecha_de_fin_contacto: Optional[date] = Field(None, alias="FECHA_DE_FIN_CONTACTO")
    mes_de_ingreso: Optional[str] = Field(None, alias="MES_DE_INGRESO")
    
    # Información del ingreso
    circunstancia_de_contacto: Optional[int] = Field(None, alias="CIRCUNSTANCIA_DE_CONTACTO")
    tipo_alta: Optional[int] = Field(None, alias="TIPO_ALTA")
    estancia_dias: Optional[int] = Field(None, alias="Estancia Días")
    procedencia: Optional[int] = Field(None, alias="PROCEDENCIA")
    continuidad_asistencial: Optional[int] = Field(None, alias="CONTINUIDAD_ASISTENCIAL")
    reingreso: Optional[str] = Field(None, alias="REINGRESO")
    
    # Diagnósticos (principal + 19 adicionales)
    diagnostico_principal: Optional[str] = Field(None, alias="Diagnóstico Principal")
    categoria: Optional[str] = Field(None, alias="Categoría")
    diagnostico_2: Optional[str] = Field(None, alias="Diagnóstico 2")
    diagnostico_3: Optional[str] = Field(None, alias="Diagnóstico 3")
    diagnostico_4: Optional[str] = Field(None, alias="Diagnóstico 4")
    diagnostico_5: Optional[str] = Field(None, alias="Diagnóstico 5")
    diagnostico_6: Optional[str] = Field(None, alias="Diagnóstico 6")
    diagnostico_7: Optional[str] = Field(None, alias="Diagnóstico 7")
    diagnostico_8: Optional[str] = Field(None, alias="Diagnóstico 8")
    diagnostico_9: Optional[str] = Field(None, alias="Diagnóstico 9")
    diagnostico_10: Optional[str] = Field(None, alias="Diagnóstico 10")
    diagnostico_11: Optional[str] = Field(None, alias="Diagnóstico 11")
    diagnostico_12: Optional[str] = Field(None, alias="Diagnóstico 12")
    diagnostico_13: Optional[str] = Field(None, alias="Diagnóstico 13")
    diagnostico_14: Optional[str] = Field(None, alias="Diagnóstico 14")
    diagnostico_15: Optional[str] = Field(None, alias="Diagnóstico 15")
    diagnostico_16: Optional[str] = Field(None, alias="Diagnóstico 16")
    diagnostico_17: Optional[str] = Field(None, alias="Diagnóstico 17")
    diagnostico_18: Optional[str] = Field(None, alias="Diagnóstico 18")
    diagnostico_19: Optional[str] = Field(None, alias="Diagnóstico 19")
    diagnostico_20: Optional[str] = Field(None, alias="Diagnóstico 20")
    
    # UCI
    ingreso_en_uci: Optional[int] = Field(None, alias="INGRESO_EN_UCI")
    dias_uci: Optional[int] = Field(None, alias="Días UCI")
    
    # Centro y servicio
    centro_recodificado: Optional[str] = Field(None, alias="CENTRO_RECODIFICADO")
    servicio: Optional[str] = Field(None, alias="SERVICIO")
    cip_sns_recodificado: Optional[str] = Field(None, alias="CIP_SNS_RECODIFICADO")
    
    # Información administrativa
    numero_de_registro_anual: Optional[int] = Field(None, alias="Número de registro anual")
    regimen_financiacion: Optional[int] = Field(None, alias="Régimen Financiación")
    cie: Optional[int] = Field(None, alias="CIE")
    
    # GDR/GRD
    gdr_ap: Optional[str] = Field(None, alias="GDR_AP")
    cdm_ap: Optional[str] = Field(None, alias="CDM_AP")
    tipo_gdr_ap: Optional[str] = Field(None, alias="TIPO_GDR_AP")
    valor_peso_espanol: Optional[str] = Field(None, alias="Valor Peso Español")
    grd_apr: Optional[int] = Field(None, alias="GRD_APR")
    cdm_apr: Optional[int] = Field(None, alias="CDM_APR")
    tipo_gdr_apr: Optional[str] = Field(None, alias="TIPO_GDR_APR")
    valor_peso_americano_apr: Optional[str] = Field(None, alias="VALOR_PESO_AMERICANO_APR")
    nivel_severidad_apr: Optional[int] = Field(None, alias="NIVEL_SEVERIDAD_APR")
    riesgo_mortalidad_apr: Optional[int] = Field(None, alias="RIESGO_MORTALIDAD_APR")
    coste_apr: Optional[float] = Field(None, alias="COSTE_APR")
    gdr_ir: Optional[str] = Field(None, alias="GDR_IR")
    tipo_gdr_ir: Optional[str] = Field(None, alias="TIPO_GDR_IR")
    tipo_proceso_ir: Optional[str] = Field(None, alias="TIPO_PROCESO_IR")
    tipo_grd_apr: Optional[str] = Field(None, alias="TIPO_GRD_APR")
    peso_espanol_apr: Optional[str] = Field(None, alias="Peso Español APR")
    
    class Config:
        from_attributes = True
        populate_by_name = True


class RegistroMental(RegistroMentalBase):
    """Modelo completo con alias para la respuesta de la API."""
    pass


# ============================================================================
# MODELOS SIMPLIFICADOS PARA RESPUESTAS
# ============================================================================

class PacienteResumen(BaseModel):
    """Resumen simplificado de un paciente."""
    nombre: Optional[str]
    edad: Optional[int]
    sexo: Optional[int]
    comunidad_autonoma: Optional[str]
    fecha_de_nacimiento: Optional[date]
    
    class Config:
        from_attributes = True


class IngresoResumen(BaseModel):
    """Resumen simplificado de un ingreso."""
    nombre: Optional[str]
    fecha_de_ingreso: Optional[date]
    fecha_de_fin_contacto: Optional[date]
    estancia_dias: Optional[int]
    diagnostico_principal: Optional[str]
    categoria: Optional[str]
    tipo_alta: Optional[int]
    servicio: Optional[str]
    
    class Config:
        from_attributes = True


# ============================================================================
# MODELOS DE ESTADÍSTICAS
# ============================================================================

class DiagnosticoStats(BaseModel):
    """Estadísticas de diagnósticos."""
    categoria: str = Field(..., description="Categoría del diagnóstico")
    total: int = Field(..., description="Total de casos")
    porcentaje: float = Field(..., description="Porcentaje del total")


class EdadStats(BaseModel):
    """Estadísticas de distribución por edad."""
    rango_edad: str = Field(..., description="Rango de edad")
    total: int = Field(..., description="Total de casos")
    porcentaje: float = Field(..., description="Porcentaje del total")


class SexoStats(BaseModel):
    """Estadísticas de distribución por sexo."""
    sexo: str = Field(..., description="Sexo (1: Hombre, 2: Mujer, etc.)")
    total: int = Field(..., description="Total de casos")
    porcentaje: float = Field(..., description="Porcentaje del total")


class ComunidadStats(BaseModel):
    """Estadísticas por comunidad autónoma."""
    comunidad_autonoma: str = Field(..., description="Comunidad Autónoma")
    total: int = Field(..., description="Total de casos")
    porcentaje: float = Field(..., description="Porcentaje del total")


class TendenciaMensual(BaseModel):
    """Tendencia mensual de ingresos."""
    mes: str = Field(..., description="Mes")
    anio: str = Field(..., description="Año")
    total: int = Field(..., description="Total de ingresos")


class EstanciaStats(BaseModel):
    """Estadísticas de duración de estancia."""
    rango_dias: str = Field(..., description="Rango de días")
    total: int = Field(..., description="Total de casos")
    promedio_dias: float = Field(..., description="Promedio de días")


class ServicioStats(BaseModel):
    """Estadísticas por servicio."""
    servicio: str = Field(..., description="Servicio")
    total: int = Field(..., description="Total de casos")
    porcentaje: float = Field(..., description="Porcentaje del total")


# ============================================================================
# MODELOS DE SISTEMA
# ============================================================================

class HealthStatus(BaseModel):
    """Estado de salud de la API."""
    status: str = Field(..., description="Estado del servicio")
    database: str = Field(..., description="Estado de conexión a BD")
    timestamp: datetime = Field(..., description="Timestamp del check")
    version: str = Field(..., description="Versión de la API")
    total_registros: Optional[int] = Field(None, description="Total de registros en BD")


class ErrorResponse(BaseModel):
    """Respuesta estándar de error."""
    detail: str = Field(..., description="Mensaje de error")
    error_code: Optional[str] = Field(None, description="Código de error")
    timestamp: datetime = Field(default_factory=datetime.now, description="Timestamp del error")
