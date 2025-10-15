from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime


class PacienteBase(BaseModel):
    """Base model for patient data."""
    edad: Optional[int] = Field(None, ge=0, le=120, description="Patient age")
    genero: Optional[str] = Field(None, max_length=20, description="Patient gender")
    codigo_postal_region: Optional[str] = Field(None, max_length=10, description="Postal code region")


class PacienteCreate(PacienteBase):
    """Model for creating a new patient."""
    pass


class Paciente(PacienteBase):
    """Complete patient model with ID."""
    id_paciente: int = Field(..., description="Patient unique identifier")
    
    class Config:
        from_attributes = True


class DiagnosticoBase(BaseModel):
    """Base model for diagnosis data."""
    codigo_cie10: str = Field(..., max_length=10, description="ICD-10 code")
    descripcion: str = Field(..., max_length=500, description="Diagnosis description")
    categoria: Optional[str] = Field(None, max_length=100, description="Diagnosis category")


class DiagnosticoCreate(DiagnosticoBase):
    """Model for creating a new diagnosis."""
    pass


class Diagnostico(DiagnosticoBase):
    """Complete diagnosis model with ID."""
    id_diagnostico: int = Field(..., description="Diagnosis unique identifier")
    
    class Config:
        from_attributes = True


class IngresoHospitalarioBase(BaseModel):
    """Base model for hospital admission data."""
    id_paciente: int = Field(..., description="Patient ID")
    id_diagnostico: int = Field(..., description="Diagnosis ID")
    fecha_ingreso: date = Field(..., description="Admission date")
    fecha_alta: Optional[date] = Field(None, description="Discharge date")
    tipo_ingreso: Optional[str] = Field(None, max_length=50, description="Admission type")


class IngresoHospitalarioCreate(IngresoHospitalarioBase):
    """Model for creating a new hospital admission."""
    pass


class IngresoHospitalario(IngresoHospitalarioBase):
    """Complete hospital admission model with ID."""
    id_ingreso: int = Field(..., description="Admission unique identifier")
    
    class Config:
        from_attributes = True


class DiagnosticoStats(BaseModel):
    """Statistics for diagnosis distribution."""
    categoria: str = Field(..., description="Diagnosis category")
    total: int = Field(..., description="Total count")
    porcentaje: float = Field(..., description="Percentage of total")


class EdadStats(BaseModel):
    """Statistics for age distribution."""
    rango_edad: str = Field(..., description="Age range")
    total: int = Field(..., description="Total count")


class GeneroStats(BaseModel):
    """Statistics for gender distribution."""
    genero: str = Field(..., description="Gender")
    total: int = Field(..., description="Total count")
    porcentaje: float = Field(..., description="Percentage of total")


class TipoIngresoStats(BaseModel):
    """Statistics for admission type distribution."""
    tipo_ingreso: str = Field(..., description="Admission type")
    total: int = Field(..., description="Total count")
    porcentaje: float = Field(..., description="Percentage of total")


class TendenciaMensual(BaseModel):
    """Monthly trend data."""
    mes: str = Field(..., description="Month")
    anio: int = Field(..., description="Year")
    total: int = Field(..., description="Total admissions")


class DuracionEstancia(BaseModel):
    """Hospital stay duration statistics."""
    rango_dias: str = Field(..., description="Days range")
    total: int = Field(..., description="Total count")


class HealthStatus(BaseModel):
    """API health check response."""
    status: str = Field(..., description="Service status")
    database: str = Field(..., description="Database connection status")
    timestamp: datetime = Field(..., description="Check timestamp")
    version: str = Field(..., description="API version")


class ErrorResponse(BaseModel):
    """Standard error response."""
    detail: str = Field(..., description="Error message")
    error_code: Optional[str] = Field(None, description="Error code")
    timestamp: datetime = Field(default_factory=datetime.now, description="Error timestamp")
