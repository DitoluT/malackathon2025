#!/usr/bin/env python3
"""
Conexión básica a Oracle Database - Sin modificaciones
"""
import oracledb
import os
from pathlib import Path

# Configuración directa (sin .env para debug)
ORACLE_USER = "ADMIN"
ORACLE_PASSWORD = "GaussCousinsAreHere25"
ORACLE_DSN = "malackathon2025_low"
WALLET_PASSWORD = "malackathon25"

# Ruta absoluta al wallet
backend_dir = Path(__file__).parent
wallet_dir = backend_dir / "Wallet_Malackathon2025"
wallet_dir_absolute = str(wallet_dir.resolve())

print("=" * 80)
print("🔌 CONEXIÓN BÁSICA A ORACLE")
print("=" * 80)
print(f"Usuario: {ORACLE_USER}")
print(f"DSN: {ORACLE_DSN}")
print(f"Wallet: {wallet_dir_absolute}")
print()

try:
    print("Conectando...")
    
    # Conexión básica usando el TNS alias
    connection = oracledb.connect(
        user=ORACLE_USER,
        password=ORACLE_PASSWORD,
        dsn=ORACLE_DSN,
        config_dir=wallet_dir_absolute,
        wallet_location=wallet_dir_absolute,
        wallet_password=WALLET_PASSWORD
    )
    
    print("✅ CONEXIÓN EXITOSA!")
    print()
    
    # Test simple
    cursor = connection.cursor()
    cursor.execute("SELECT 1 FROM DUAL")
    result = cursor.fetchone()[0]
    print(f"✅ Test query: {result}")
    
    # Contar registros
    cursor.execute("SELECT COUNT(*) FROM ENFERMEDADESMENTALESDIAGNOSTICO")
    count = cursor.fetchone()[0]
    print(f"✅ Registros en tabla: {count:,}")
    
    cursor.close()
    connection.close()
    
    print()
    print("=" * 80)
    print("✅ TODO FUNCIONA CORRECTAMENTE")
    print("=" * 80)
    
except Exception as e:
    print(f"❌ ERROR: {e}")
    print()
    import traceback
    traceback.print_exc()
