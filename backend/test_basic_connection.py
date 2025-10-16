#!/usr/bin/env python3
"""
Conexión básica a Oracle Database - Siguiendo documentación oficial
Thin mode solo necesita: tnsnames.ora y ewallet.pem
"""
import oracledb
import os
from pathlib import Path

# Configuración directa
ORACLE_USER = "ADMIN"
ORACLE_PASSWORD = "GaussCousinsAreHere25"
ORACLE_DSN = "malackathon2025_low"
WALLET_PASSWORD = "malackathon25"

# Ruta absoluta al wallet
backend_dir = Path(__file__).parent
wallet_dir = backend_dir / "Wallet_Malackathon2025"
wallet_dir_absolute = str(wallet_dir.resolve())

print("=" * 80)
print("🔌 CONEXIÓN BÁSICA A ORACLE (Thin Mode)")
print("=" * 80)
print(f"Usuario: {ORACLE_USER}")
print(f"DSN: {ORACLE_DSN}")
print(f"Config dir (tnsnames.ora): {wallet_dir_absolute}")
print(f"Wallet location (ewallet.pem): {wallet_dir_absolute}")
print()

# Verificar que los archivos necesarios existen
tnsnames = wallet_dir / "tnsnames.ora"
ewallet = wallet_dir / "ewallet.pem"

print("📁 Verificando archivos necesarios para Thin mode:")
print(f"   {'✅' if tnsnames.exists() else '❌'} tnsnames.ora")
print(f"   {'✅' if ewallet.exists() else '❌'} ewallet.pem")
print()

if not tnsnames.exists() or not ewallet.exists():
    print("❌ Faltan archivos necesarios. No se puede conectar.")
    exit(1)

try:
    print("🔌 Conectando en Thin mode (documentación oficial)...")
    print("-" * 80)
    
    # Conexión exactamente como en la documentación de Oracle
    connection = oracledb.connect(
        config_dir=wallet_dir_absolute,
        user=ORACLE_USER,
        password=ORACLE_PASSWORD,
        dsn=ORACLE_DSN,
        wallet_location=wallet_dir_absolute,
        wallet_password=WALLET_PASSWORD
    )
    
    print("✅ ¡CONEXIÓN EXITOSA!")
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
    
except oracledb.DatabaseError as e:
    error_obj, = e.args
    print(f"❌ ERROR DE BASE DE DATOS")
    print(f"   Código: {error_obj.code}")
    print(f"   Mensaje: {error_obj.message}")
    print()
    
    # Diagnósticos específicos
    if "DPY-6000" in str(e) or "12506" in str(e):
        print("💡 Error DPY-6000: El listener rechaza la conexión")
        print()
        print("Causas comunes:")
        print("1. ❌ La base de datos está STOPPED en Oracle Cloud")
        print("2. ❌ ACL (Access Control List) bloquea tu IP")
        print("3. ❌ El wallet no corresponde a esta base de datos")
        print("4. ❌ Credenciales incorrectas")
        print()
        print("Verifica en Oracle Cloud Console:")
        print("- Estado de la base de datos (debe ser AVAILABLE)")
        print("- Access Control Lists (debe permitir tu IP o estar en 0.0.0.0/0)")
        print("- Descarga un wallet nuevo si es necesario")
        
    elif "DPY-4011" in str(e) or "1017" in str(e):
        print("💡 Error: Usuario o contraseña incorrectos")
        
    print()
    import traceback
    traceback.print_exc()
    
except Exception as e:
    print(f"❌ ERROR INESPERADO: {e}")
    print()
    import traceback
    traceback.print_exc()
