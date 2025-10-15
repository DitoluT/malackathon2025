from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    All sensitive data (Oracle credentials, passwords) MUST be defined in .env file.
    """
    
    # Oracle Database Configuration - REQUIRED from .env (no defaults for security)
    ORACLE_USER: str
    ORACLE_PASSWORD: str
    ORACLE_DSN: str
    ORACLE_CONFIG_DIR: str
    ORACLE_WALLET_LOCATION: str
    ORACLE_WALLET_PASSWORD: str
    
    # API Configuration
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Malackathon 2025 - Health Mental Data API"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # CORS Configuration
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:8080,http://localhost:3000"
    
    # Security - SECRET_KEY REQUIRED from .env
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Convert comma-separated CORS origins to list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
