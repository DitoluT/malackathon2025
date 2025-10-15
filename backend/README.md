# Malackathon 2025 - Health Mental Data API

FastAPI-based REST API for accessing and analyzing health mental data stored in Oracle Autonomous Database.

## Project Structure

```
backend/
├── app/
│   ├── api/                    # API endpoints
│   │   ├── health.py          # Health check endpoints
│   │   ├── statistics.py      # Statistical analysis endpoints
│   │   └── data.py            # Data access endpoints
│   ├── database/              # Database configuration
│   │   └── connection.py      # Oracle connection pool manager
│   ├── models/                # Data models
│   │   └── schemas.py         # Pydantic schemas
│   ├── services/              # Business logic
│   │   └── health_data_service.py  # Health data operations
│   └── config.py              # Application configuration
├── main.py                    # Application entry point
├── requirements.txt           # Python dependencies
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## Features

- RESTful API with FastAPI
- Oracle Autonomous Database integration
- Connection pooling for optimal performance
- Comprehensive statistical analysis endpoints
- Automatic OpenAPI (Swagger) documentation
- CORS support for frontend integration
- Type safety with Pydantic models
- Error handling and logging

## Prerequisites

- Python 3.9 or higher
- Oracle Instant Client (for oracledb driver)
- Access to Oracle Autonomous Database
- Wallet files for database connection (if using mTLS)

## Installation

1. Clone the repository:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

## Configuration

Edit the `.env` file with your Oracle Database credentials:

```env
# Oracle Database Configuration
ORACLE_USER=your_username
ORACLE_PASSWORD=your_password
ORACLE_DSN=your_oracle_dsn
ORACLE_CONFIG_DIR=/path/to/oracle/config
ORACLE_WALLET_LOCATION=/path/to/wallet
ORACLE_WALLET_PASSWORD=your_wallet_password

# API Configuration
API_V1_PREFIX=/api/v1
PROJECT_NAME=Malackathon 2025 - Health Mental Data API
VERSION=1.0.0
DEBUG=True

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,http://localhost:8080

# Security
SECRET_KEY=your-secret-key-change-this-in-production
```

## Running the Application

### Development Mode

```bash
# With uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or using Python
python main.py
```

### Production Mode

```bash
# Set DEBUG=False in .env first
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at:
- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Health Check

- `GET /api/v1/health` - Check API and database status

### Statistics Endpoints

- `GET /api/v1/statistics/diagnosticos` - Diagnosis statistics by category
- `GET /api/v1/statistics/edad` - Age distribution statistics
- `GET /api/v1/statistics/genero` - Gender distribution statistics
- `GET /api/v1/statistics/tipo-ingreso` - Admission type statistics
- `GET /api/v1/statistics/tendencia-mensual` - Monthly admission trends
- `GET /api/v1/statistics/duracion-estancia` - Hospital stay duration statistics

### Data Access Endpoints

- `GET /api/v1/data/pacientes` - List patients (paginated)
- `GET /api/v1/data/diagnosticos` - List diagnoses (paginated)
- `GET /api/v1/data/ingresos` - List hospital admissions (paginated)

## API Documentation

Access the interactive API documentation at:

- **Swagger UI**: http://localhost:8000/docs
  - Interactive API testing interface
  - Try out endpoints directly from the browser
  - View request/response schemas

- **ReDoc**: http://localhost:8000/redoc
  - Alternative documentation format
  - Better for reading and understanding API structure

## Database Schema

The API interacts with three main tables:

### PACIENTES (Patients)
```sql
- id_paciente: INTEGER (Primary Key)
- edad: INTEGER (Age)
- genero: VARCHAR(20) (Gender)
- codigo_postal_region: VARCHAR(10) (Postal Code Region)
```

### DIAGNOSTICOS (Diagnoses)
```sql
- id_diagnostico: INTEGER (Primary Key)
- codigo_cie10: VARCHAR(10) (ICD-10 Code)
- descripcion: VARCHAR(500) (Description)
- categoria: VARCHAR(100) (Category)
```

### INGRESOS_HOSPITALARIOS (Hospital Admissions)
```sql
- id_ingreso: INTEGER (Primary Key)
- id_paciente: INTEGER (Foreign Key to PACIENTES)
- id_diagnostico: INTEGER (Foreign Key to DIAGNOSTICOS)
- fecha_ingreso: DATE (Admission Date)
- fecha_alta: DATE (Discharge Date)
- tipo_ingreso: VARCHAR(50) (Admission Type)
```

## Example Usage

### Using curl

```bash
# Health check
curl http://localhost:8000/api/v1/health

# Get diagnosis statistics
curl http://localhost:8000/api/v1/statistics/diagnosticos

# Get patients (first 10)
curl "http://localhost:8000/api/v1/data/pacientes?skip=0&limit=10"

# Get monthly trends for 2024
curl "http://localhost:8000/api/v1/statistics/tendencia-mensual?year=2024"
```

### Using Python requests

```python
import requests

base_url = "http://localhost:8000/api/v1"

# Get diagnosis statistics
response = requests.get(f"{base_url}/statistics/diagnosticos")
data = response.json()
print(data)

# Get age distribution
response = requests.get(f"{base_url}/statistics/edad")
data = response.json()
print(data)
```

### Using JavaScript fetch

```javascript
const baseUrl = 'http://localhost:8000/api/v1';

// Get gender distribution
fetch(`${baseUrl}/statistics/genero`)
  .then(response => response.json())
  .then(data => console.log(data));

// Get patients
fetch(`${baseUrl}/data/pacientes?limit=50`)
  .then(response => response.json())
  .then(data => console.log(data));
```

## Error Handling

The API returns standard HTTP status codes:

- `200 OK` - Successful request
- `400 Bad Request` - Invalid parameters
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

Error responses follow this format:

```json
{
  "detail": "Error message",
  "error_code": "OPTIONAL_CODE",
  "timestamp": "2025-10-15T10:30:00.000Z"
}
```

## Logging

The application uses Python's built-in logging module. Logs include:

- Database connection events
- Query executions
- Errors and exceptions
- Request information (in DEBUG mode)

Configure logging level in `.env`:
```env
DEBUG=True  # INFO level logging
DEBUG=False # WARNING level logging
```

## Performance Considerations

- **Connection Pooling**: Uses Oracle connection pool (min: 2, max: 10 connections)
- **Pagination**: All list endpoints support pagination to avoid large result sets
- **Query Optimization**: Queries are optimized with proper indexes
- **Error Handling**: Graceful error handling prevents connection leaks

## Security Recommendations for Production

1. **Enable Authentication**: Implement JWT or OAuth2 authentication
2. **HTTPS Only**: Use HTTPS in production
3. **Rate Limiting**: Add rate limiting middleware
4. **Input Validation**: Already implemented with Pydantic
5. **Database Credentials**: Use secrets manager (e.g., AWS Secrets Manager)
6. **CORS**: Restrict CORS origins to specific domains
7. **Logging**: Implement centralized logging (e.g., ELK stack)

## Testing

### Manual Testing with Swagger UI

1. Start the server
2. Navigate to http://localhost:8000/docs
3. Click on any endpoint
4. Click "Try it out"
5. Fill in parameters (if any)
6. Click "Execute"

### Health Check Test

```bash
curl http://localhost:8000/api/v1/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-10-15T10:30:00.000000",
  "version": "1.0.0"
}
```

## Troubleshooting

### Database Connection Issues

1. Check Oracle credentials in `.env`
2. Verify Oracle Instant Client is installed
3. Ensure wallet files are in correct location
4. Check network connectivity to database

### Import Errors

```bash
# Reinstall dependencies
pip install -r requirements.txt --upgrade
```

### Port Already in Use

```bash
# Use a different port
uvicorn main:app --port 8001
```

## Development

### Adding New Endpoints

1. Create/modify schema in `app/models/schemas.py`
2. Add business logic in `app/services/`
3. Create endpoint in `app/api/`
4. Include router in `main.py`

### Code Style

The project follows PEP 8 guidelines. Use tools like:
- `black` for code formatting
- `flake8` for linting
- `mypy` for type checking

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Internal project for Malackathon 2025

## Support

For issues or questions, contact the development team.

## Changelog

### Version 1.0.0 (2025-10-15)
- Initial release
- Core API endpoints
- Oracle Database integration
- OpenAPI documentation
- CORS support
- Connection pooling
