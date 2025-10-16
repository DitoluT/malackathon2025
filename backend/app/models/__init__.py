"""
Models package initialization.
"""
from app.models.schemas import (
    RegistroMental,
    RegistroMentalBase,
    PacienteResumen,
    IngresoResumen,
    DiagnosticoStats,
    EdadStats,
    SexoStats,
    ComunidadStats,
    TendenciaMensual,
    EstanciaStats,
    ServicioStats,
    HealthStatus,
    ErrorResponse
)

__all__ = [
    'RegistroMental',
    'RegistroMentalBase',
    'PacienteResumen',
    'IngresoResumen',
    'DiagnosticoStats',
    'EdadStats',
    'SexoStats',
    'ComunidadStats',
    'TendenciaMensual',
    'EstanciaStats',
    'ServicioStats',
    'HealthStatus',
    'ErrorResponse'
]
