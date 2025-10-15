# API Integration Guide

This guide explains how to integrate the FastAPI backend with the frontend application.

## Base URL Configuration

### Development
```javascript
const API_BASE_URL = 'http://localhost:8000/api/v1';
```

### Production
```javascript
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://your-domain.com/api/v1';
```

## Frontend Integration Examples

### 1. Create API Service Layer

Create a new file: `frontend/src/services/apiService.ts`

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export interface DiagnosticoStats {
  categoria: string;
  total: number;
  porcentaje: number;
}

export interface EdadStats {
  rango_edad: string;
  total: number;
}

export interface GeneroStats {
  genero: string;
  total: number;
  porcentaje: number;
}

export class ApiService {
  private static async fetchJSON<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Statistics endpoints
  static async getDiagnosticosStats(): Promise<DiagnosticoStats[]> {
    return this.fetchJSON<DiagnosticoStats[]>('/statistics/diagnosticos');
  }

  static async getEdadDistribution(): Promise<EdadStats[]> {
    return this.fetchJSON<EdadStats[]>('/statistics/edad');
  }

  static async getGeneroDistribution(): Promise<GeneroStats[]> {
    return this.fetchJSON<GeneroStats[]>('/statistics/genero');
  }

  static async getTendenciaMensual(year?: number): Promise<any[]> {
    const params = year ? `?year=${year}` : '';
    return this.fetchJSON(`/statistics/tendencia-mensual${params}`);
  }

  static async getDuracionEstancia(): Promise<any[]> {
    return this.fetchJSON('/statistics/duracion-estancia');
  }

  static async getTipoIngresoStats(): Promise<any[]> {
    return this.fetchJSON('/statistics/tipo-ingreso');
  }

  // Data endpoints
  static async getPacientes(skip: number = 0, limit: number = 100): Promise<any[]> {
    return this.fetchJSON(`/data/pacientes?skip=${skip}&limit=${limit}`);
  }

  static async getDiagnosticos(skip: number = 0, limit: number = 100): Promise<any[]> {
    return this.fetchJSON(`/data/diagnosticos?skip=${skip}&limit=${limit}`);
  }

  static async getIngresos(skip: number = 0, limit: number = 100): Promise<any[]> {
    return this.fetchJSON(`/data/ingresos?skip=${skip}&limit=${limit}`);
  }

  // Health check
  static async healthCheck(): Promise<any> {
    return this.fetchJSON('/health');
  }
}
```

### 2. Update Environment Variables

Add to `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### 3. Usage in Components

```typescript
import { useEffect, useState } from 'react';
import { ApiService, DiagnosticoStats } from '@/services/apiService';

export function DiagnosticsChart() {
  const [data, setData] = useState<DiagnosticoStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const stats = await ApiService.getDiagnosticosStats();
        setData(stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {/* Your chart component using the data */}
    </div>
  );
}
```

### 4. Integration with Chatbot

Update `frontend/src/lib/chatbot-charts.ts`:

```typescript
import { ApiService } from '@/services/apiService';

export const generateChartFromRealData = async (
  prompt: string
): Promise<ChartData> => {
  // Analyze prompt to determine which API to call
  const input = prompt.toLowerCase();

  if (input.includes('edad')) {
    const data = await ApiService.getEdadDistribution();
    return {
      type: 'bar',
      data: data.map(item => ({
        name: item.rango_edad,
        value: item.total
      })),
      title: 'Distribucion de Diagnosticos por Edad',
      dataKey: 'value',
      xAxisKey: 'name'
    };
  }

  if (input.includes('genero')) {
    const data = await ApiService.getGeneroDistribution();
    return {
      type: 'pie',
      data: data.map(item => ({
        name: item.genero,
        value: item.total
      })),
      title: 'Distribucion por Genero',
      dataKey: 'value'
    };
  }

  if (input.includes('diagnostico') || input.includes('categoria')) {
    const data = await ApiService.getDiagnosticosStats();
    return {
      type: 'bar',
      data: data.map(item => ({
        name: item.categoria,
        value: item.total
      })),
      title: 'Frecuencia de Diagnosticos por Categoria',
      dataKey: 'value',
      xAxisKey: 'name'
    };
  }

  // Default fallback
  const data = await ApiService.getDiagnosticosStats();
  return {
    type: 'bar',
    data: data.map(item => ({
      name: item.categoria,
      value: item.total
    })),
    title: 'Diagnosticos Principales',
    dataKey: 'value',
    xAxisKey: 'name'
  };
};
```

### 5. Error Handling

```typescript
import { ApiService } from '@/services/apiService';

async function fetchDataWithErrorHandling() {
  try {
    const data = await ApiService.getDiagnosticosStats();
    return { success: true, data };
  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return { 
        success: false, 
        error: 'Backend server is not running. Please start the API server.' 
      };
    }
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Unknown error occurred' };
  }
}
```

## CORS Configuration

The backend is already configured to accept requests from:
- http://localhost:5173 (Vite default)
- http://localhost:8080 (Custom port)
- http://localhost:3000 (React default)

To add more origins, edit `backend/.env`:

```env
CORS_ORIGINS=http://localhost:5173,http://localhost:8080,https://your-domain.com
```

## Running Both Servers

### Option 1: Two Terminals

Terminal 1 (Backend):
```bash
cd backend
source venv/bin/activate
python main.py
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### Option 2: Background Process

```bash
# Start backend in background
cd backend
source venv/bin/activate
python main.py &

# Start frontend
cd ../frontend
npm run dev
```

## Testing the Integration

### 1. Health Check

```bash
curl http://localhost:8000/api/v1/health
```

### 2. Test from Frontend Console

Open browser console and run:

```javascript
fetch('http://localhost:8000/api/v1/statistics/diagnosticos')
  .then(r => r.json())
  .then(console.log);
```

### 3. Check CORS

If you see CORS errors:
1. Verify backend is running
2. Check CORS_ORIGINS in backend/.env
3. Restart backend server after changes

## Production Deployment

### Backend (FastAPI)

1. Set production environment variables
2. Disable DEBUG mode
3. Use production WSGI server (uvicorn with workers)
4. Set up HTTPS
5. Configure proper CORS origins

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend Updates

1. Update API_BASE_URL to production URL
2. Build frontend: `npm run build`
3. Deploy to hosting service

## Troubleshooting

### Backend not accessible from frontend

1. Check if backend is running: `curl http://localhost:8000/api/v1/health`
2. Verify CORS configuration in backend/.env
3. Check firewall settings
4. Ensure correct port in API_BASE_URL

### Database connection errors

1. Verify Oracle credentials in backend/.env
2. Check wallet files location
3. Test database connection independently
4. Review backend logs

### API returns 404

1. Verify API_BASE_URL includes `/api/v1`
2. Check endpoint paths match documentation
3. Review backend logs for routing errors

## Advanced: Using React Query

For better data management:

```bash
npm install @tanstack/react-query
```

```typescript
import { useQuery } from '@tanstack/react-query';
import { ApiService } from '@/services/apiService';

export function useDiagnosticosStats() {
  return useQuery({
    queryKey: ['diagnosticos-stats'],
    queryFn: ApiService.getDiagnosticosStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Usage in component
function MyComponent() {
  const { data, isLoading, error } = useDiagnosticosStats();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{/* Use data */}</div>;
}
```

## Summary

1. Backend runs on `http://localhost:8000`
2. API endpoints are prefixed with `/api/v1`
3. Use the ApiService class for all API calls
4. Handle errors appropriately
5. Configure CORS for your domains
6. Test integration before deploying
