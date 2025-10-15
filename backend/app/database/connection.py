import oracledb
from typing import Optional
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class DatabaseConnection:
    """
    Oracle Database connection manager using singleton pattern.
    """
    
    _instance: Optional['DatabaseConnection'] = None
    _pool: Optional[oracledb.ConnectionPool] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseConnection, cls).__new__(cls)
        return cls._instance
    
    def initialize_pool(self):
        """
        Initialize connection pool to Oracle Database.
        """
        try:
            if self._pool is None:
                logger.info("Initializing Oracle Database connection pool...")
                
                # Configure Oracle Client if needed
                if settings.ORACLE_CONFIG_DIR:
                    oracledb.init_oracle_client(config_dir=settings.ORACLE_CONFIG_DIR)
                
                # Create connection pool
                self._pool = oracledb.create_pool(
                    user=settings.ORACLE_USER,
                    password=settings.ORACLE_PASSWORD,
                    dsn=settings.ORACLE_DSN,
                    min=2,
                    max=10,
                    increment=1,
                    threaded=True
                )
                
                logger.info("Oracle Database connection pool initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing database pool: {str(e)}")
            raise
    
    def get_connection(self):
        """
        Get a connection from the pool.
        """
        if self._pool is None:
            self.initialize_pool()
        return self._pool.acquire()
    
    def close_pool(self):
        """
        Close the connection pool.
        """
        if self._pool:
            logger.info("Closing Oracle Database connection pool...")
            self._pool.close()
            self._pool = None
            logger.info("Connection pool closed")


# Singleton instance
db_connection = DatabaseConnection()


def get_db_connection():
    """
    Dependency injection for database connections.
    Yields a connection and ensures it's released back to the pool.
    """
    connection = None
    try:
        connection = db_connection.get_connection()
        yield connection
    finally:
        if connection:
            connection.close()
