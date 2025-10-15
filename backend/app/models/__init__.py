"""
Models package initialization.
"""
from app.models.schemas import (
    Paciente,
    Diagnostico,
    IngresoHospitalario,
    DiagnosticoStats,
    EdadStats,
    GeneroStats,
    TipoIngresoStats,
    TendenciaMensual,
    DuracionEstancia,
    HealthStatus,
    ErrorResponse
)

__all__ = [
    'Paciente',
    'Diagnostico',
    'IngresoHospitalario',
    'DiagnosticoStats',
    'EdadStats',
    'GeneroStats',
    'TipoIngresoStats',
    'TendenciaMensual',
    'DuracionEstancia',
    'HealthStatus',
    'ErrorResponse'
]
