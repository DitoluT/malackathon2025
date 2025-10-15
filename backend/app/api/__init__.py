"""
API package initialization.
"""
from app.api import health, statistics, data, query

__all__ = ['health', 'statistics', 'data', 'query']
