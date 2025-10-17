#!/usr/bin/env python3
"""
Script de prueba para verificar que el endpoint de query funciona correctamente.
"""
import requests
import json
import time

API_URL = "http://localhost:8000/api/v1"

def test_health():
    """Probar el endpoint de health."""
    print("=" * 80)
    print("1. Probando endpoint /health")
    print("=" * 80)
    
    try:
        response = requests.get(f"{API_URL}/health", timeout=5)
        print(f"✅ Status: {response.status_code}")
        print(f"📊 Respuesta: {json.dumps(response.json(), indent=2)}")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_simple_query():
    """Probar una query simple."""
    print("\n" + "=" * 80)
    print("2. Probando query simple (COUNT)")
    print("=" * 80)
    
    query = {
        "query": "SELECT COUNT(*) as total FROM SALUD_MENTAL_FEATURED",
        "limit": 10
    }
    
    print(f"📝 Query: {query['query']}")
    
    try:
        start = time.time()
        response = requests.post(
            f"{API_URL}/query/execute",
            json=query,
            timeout=30
        )
        elapsed = time.time() - start
        
        print(f"✅ Status: {response.status_code}")
        print(f"⏱️ Tiempo: {elapsed:.2f}s")
        
        if response.status_code == 200:
            data = response.json()
            print(f"📊 Filas devueltas: {data['rows_returned']}")
            print(f"📋 Datos: {json.dumps(data['data'], indent=2)}")
            return True
        else:
            print(f"❌ Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_grouped_query():
    """Probar una query con GROUP BY (como la del frontend)."""
    print("\n" + "=" * 80)
    print("3. Probando query con GROUP BY (como frontend)")
    print("=" * 80)
    
    query = {
        "query": '''SELECT "Categoría" as category, COUNT(*) as value
FROM SALUD_MENTAL_FEATURED
GROUP BY "Categoría"
ORDER BY value DESC''',
        "limit": 10
    }
    
    print(f"📝 Query:\n{query['query']}")
    
    try:
        start = time.time()
        response = requests.post(
            f"{API_URL}/query/execute",
            json=query,
            timeout=30,
            headers={"Content-Type": "application/json"}
        )
        elapsed = time.time() - start
        
        print(f"✅ Status: {response.status_code}")
        print(f"⏱️ Tiempo: {elapsed:.2f}s")
        
        if response.status_code == 200:
            data = response.json()
            print(f"📊 Filas devueltas: {data['rows_returned']}")
            print(f"📋 Columnas: {data['columns']}")
            print(f"🔍 Primeras 3 filas:")
            for i, row in enumerate(data['data'][:3], 1):
                print(f"  {i}. {row}")
            return True
        else:
            print(f"❌ Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_query_with_filter():
    """Probar una query con filtro (como la del frontend con textFilter)."""
    print("\n" + "=" * 80)
    print("4. Probando query con filtro (textFilter)")
    print("=" * 80)
    
    query = {
        "query": '''SELECT "Categoría" as category, COUNT(*) as value
FROM SALUD_MENTAL_FEATURED
WHERE "Categoría" LIKE :searchText
GROUP BY "Categoría"
ORDER BY value DESC''',
        "params": {
            "searchText": "%Esquizofrenia%"
        },
        "limit": 10
    }
    
    print(f"📝 Query:\n{query['query']}")
    print(f"🔑 Parámetros: {query['params']}")
    
    try:
        start = time.time()
        response = requests.post(
            f"{API_URL}/query/execute",
            json=query,
            timeout=30,
            headers={"Content-Type": "application/json"}
        )
        elapsed = time.time() - start
        
        print(f"✅ Status: {response.status_code}")
        print(f"⏱️ Tiempo: {elapsed:.2f}s")
        
        if response.status_code == 200:
            data = response.json()
            print(f"📊 Filas devueltas: {data['rows_returned']}")
            print(f"📋 Columnas: {data['columns']}")
            print(f"🔍 Datos:")
            for i, row in enumerate(data['data'], 1):
                print(f"  {i}. {row}")
            return True
        else:
            print(f"❌ Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Ejecutar todas las pruebas."""
    print("\n" + "🧪" * 40)
    print("PRUEBAS DE API - ENDPOINT /query/execute")
    print("🧪" * 40 + "\n")
    
    print("⚠️  Asegúrate de que el backend esté corriendo:")
    print("    cd backend && uvicorn main:app --host 0.0.0.0 --port 8000 --reload\n")
    
    input("Presiona Enter para continuar...")
    
    results = []
    
    # Ejecutar pruebas
    results.append(("Health Check", test_health()))
    results.append(("Query Simple", test_simple_query()))
    results.append(("Query con GROUP BY", test_grouped_query()))
    results.append(("Query con Filtro", test_query_with_filter()))
    
    # Resumen
    print("\n" + "=" * 80)
    print("RESUMEN DE PRUEBAS")
    print("=" * 80)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")
    
    total = len(results)
    passed = sum(1 for _, r in results if r)
    
    print("\n" + "=" * 80)
    print(f"Total: {passed}/{total} pruebas pasaron")
    print("=" * 80)
    
    if passed == total:
        print("\n🎉 ¡Todas las pruebas pasaron!")
    else:
        print("\n⚠️  Algunas pruebas fallaron. Revisa los logs del backend.")

if __name__ == "__main__":
    main()
