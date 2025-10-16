#!/usr/bin/env python3
"""
Script de verificación de configuración del wallet.
Verifica que todas las rutas y archivos estén correctos.
"""

import sys
from pathlib import Path

def check_config():
    """Verificar la configuración del wallet."""
    print("=" * 60)
    print("🔍 VERIFICACIÓN DE CONFIGURACIÓN DEL WALLET")
    print("=" * 60)
    print()
    
    # 1. Verificar que se puede importar la configuración
    print("[1/5] Verificando importación de configuración...")
    try:
        from app.config import settings
        print("✅ Configuración importada correctamente")
    except Exception as e:
        print(f"❌ Error importando configuración: {e}")
        return False
    
    print()
    
    # 2. Verificar valores de configuración
    print("[2/5] Verificando valores de configuración...")
    print(f"  - ORACLE_USER: {settings.ORACLE_USER}")
    print(f"  - ORACLE_DSN: {settings.ORACLE_DSN}")
    print(f"  - WALLET_DIR: {settings.WALLET_DIR}")
    print(f"  - ORACLE_CONFIG_DIR: {settings.ORACLE_CONFIG_DIR}")
    print(f"  - ORACLE_WALLET_LOCATION: {settings.ORACLE_WALLET_LOCATION}")
    print("✅ Valores de configuración cargados")
    print()
    
    # 3. Verificar que el directorio del wallet existe
    print("[3/5] Verificando directorio del wallet...")
    wallet_path = Path(settings.ORACLE_WALLET_LOCATION)
    if wallet_path.exists() and wallet_path.is_dir():
        print(f"✅ Directorio del wallet existe: {wallet_path}")
    else:
        print(f"❌ Directorio del wallet NO existe: {wallet_path}")
        return False
    
    print()
    
    # 4. Verificar archivos requeridos del wallet
    print("[4/5] Verificando archivos del wallet...")
    required_files = [
        "tnsnames.ora",
        "sqlnet.ora",
        "ewallet.pem",
        "cwallet.sso"
    ]
    
    all_files_present = True
    for filename in required_files:
        file_path = wallet_path / filename
        if file_path.exists():
            print(f"  ✅ {filename}")
        else:
            print(f"  ❌ {filename} - NO ENCONTRADO")
            all_files_present = False
    
    if not all_files_present:
        print("❌ Faltan archivos requeridos del wallet")
        return False
    
    print("✅ Todos los archivos del wallet presentes")
    print()
    
    # 5. Verificar conexión a la base de datos
    print("[5/5] Verificando conexión a la base de datos...")
    try:
        from app.database.connection import db_connection
        
        # Intentar inicializar el pool
        db_connection.initialize_pool()
        
        # Intentar obtener una conexión
        conn = db_connection.get_connection()
        
        # Ejecutar una query simple
        cursor = conn.cursor()
        cursor.execute("SELECT 1 FROM DUAL")
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if result and result[0] == 1:
            print("✅ Conexión a la base de datos exitosa")
            print()
            print("=" * 60)
            print("🎉 ¡TODAS LAS VERIFICACIONES PASARON!")
            print("=" * 60)
            return True
        else:
            print("❌ Query de prueba falló")
            return False
            
    except Exception as e:
        print(f"❌ Error conectando a la base de datos: {e}")
        return False

if __name__ == "__main__":
    try:
        success = check_config()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n⚠️ Verificación interrumpida")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
