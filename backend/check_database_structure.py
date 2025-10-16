#!/usr/bin/env python3
"""
Script para verificar la estructura de la tabla ENFERMEDADESMENTALESDIAGNOSTICO
en Oracle Database.
"""

import oracledb
import sys



def create_connection():
    """Crear conexión usando la configuración que funciona."""
    return oracledb.connect(
        user=DB_USER,
        password=DB_PASSWORD,
        dsn=TNS_ALIAS,
        config_dir=WALLET_DIR,
        wallet_location=WALLET_DIR,
        wallet_password=WALLET_PASSWORD
    )


def check_table_structure(table_name="ENFERMEDADESMENTALESDIAGNOSTICO"):
    """Verificar la estructura de una tabla."""
    print("=" * 80)
    print(f"📊 ESTRUCTURA DE LA TABLA: {table_name}")
    print("=" * 80)
    print()
    
    try:
        connection = create_connection()
        cursor = connection.cursor()
        print("✓ Conexión establecida\n")
        
        # Verificar si la tabla existe
        print(f"1️⃣  Verificando si la tabla {table_name} existe...")
        cursor.execute("""
            SELECT COUNT(*) 
            FROM user_tables 
            WHERE table_name = :table_name
        """, table_name=table_name.upper())
        
        exists = cursor.fetchone()[0] > 0
        
        if not exists:
            print(f"❌ La tabla {table_name} NO existe en la base de datos")
            print("\nTablas disponibles:")
            cursor.execute("SELECT table_name FROM user_tables ORDER BY table_name")
            for row in cursor.fetchall():
                print(f"   - {row[0]}")
            return False
        
        print(f"✓ La tabla {table_name} existe\n")
        
        # Obtener estructura de columnas
        print(f"2️⃣  Estructura de columnas de {table_name}:")
        print("-" * 80)
        cursor.execute("""
            SELECT 
                column_name,
                data_type,
                data_length,
                data_precision,
                data_scale,
                nullable,
                column_id
            FROM user_tab_columns
            WHERE table_name = :table_name
            ORDER BY column_id
        """, table_name=table_name.upper())
        
        columns = cursor.fetchall()
        
        if not columns:
            print(f"❌ No se pudieron obtener las columnas de {table_name}")
            return False
        
        print(f"{'#':<4} {'COLUMNA':<30} {'TIPO':<20} {'NULLABLE':<10}")
        print("-" * 80)
        
        for col in columns:
            col_name = col[0]
            data_type = col[1]
            data_length = col[2]
            data_precision = col[3]
            data_scale = col[4]
            nullable = "YES" if col[5] == "Y" else "NO"
            col_id = col[6]
            
            # Formatear tipo de dato
            if data_type in ['VARCHAR2', 'CHAR']:
                type_str = f"{data_type}({data_length})"
            elif data_type == 'NUMBER':
                if data_precision and data_scale:
                    type_str = f"NUMBER({data_precision},{data_scale})"
                elif data_precision:
                    type_str = f"NUMBER({data_precision})"
                else:
                    type_str = "NUMBER"
            else:
                type_str = data_type
            
            print(f"{col_id:<4} {col_name:<30} {type_str:<20} {nullable:<10}")
        
        print()
        
        # Obtener primary keys
        print(f"3️⃣  Primary Keys de {table_name}:")
        print("-" * 80)
        cursor.execute("""
            SELECT 
                cols.column_name,
                cols.position
            FROM user_constraints cons
            JOIN user_cons_columns cols 
                ON cons.constraint_name = cols.constraint_name
            WHERE cons.constraint_type = 'P'
            AND cons.table_name = :table_name
            ORDER BY cols.position
        """, table_name=table_name.upper())
        
        pks = cursor.fetchall()
        
        if pks:
            for pk in pks:
                print(f"   ✓ {pk[0]} (posición {pk[1]})")
        else:
            print("   ⚠️  No hay primary keys definidas")
        
        print()
        
        # Obtener foreign keys
        print(f"4️⃣  Foreign Keys de {table_name}:")
        print("-" * 80)
        cursor.execute("""
            SELECT 
                a.constraint_name,
                a.column_name,
                c_pk.table_name r_table_name,
                b.column_name r_column_name
            FROM user_cons_columns a
            JOIN user_constraints c ON a.constraint_name = c.constraint_name
            JOIN user_constraints c_pk ON c.r_constraint_name = c_pk.constraint_name
            JOIN user_cons_columns b ON c_pk.constraint_name = b.constraint_name
            WHERE c.constraint_type = 'R'
            AND a.table_name = :table_name
            ORDER BY a.constraint_name, a.position
        """, table_name=table_name.upper())
        
        fks = cursor.fetchall()
        
        if fks:
            for fk in fks:
                print(f"   ✓ {fk[1]} -> {fk[2]}.{fk[3]} (constraint: {fk[0]})")
        else:
            print("   ℹ️  No hay foreign keys definidas")
        
        print()
        
        # Obtener índices
        print(f"5️⃣  Índices de {table_name}:")
        print("-" * 80)
        cursor.execute("""
            SELECT 
                i.index_name,
                i.uniqueness,
                ic.column_name,
                ic.column_position
            FROM user_indexes i
            JOIN user_ind_columns ic ON i.index_name = ic.index_name
            WHERE i.table_name = :table_name
            ORDER BY i.index_name, ic.column_position
        """, table_name=table_name.upper())
        
        indexes = cursor.fetchall()
        
        if indexes:
            current_index = None
            for idx in indexes:
                if idx[0] != current_index:
                    if current_index:
                        print()
                    uniqueness = "UNIQUE" if idx[1] == "UNIQUE" else "NON-UNIQUE"
                    print(f"   {idx[0]} ({uniqueness}):")
                    current_index = idx[0]
                print(f"      - {idx[2]} (pos {idx[3]})")
        else:
            print("   ℹ️  No hay índices definidos")
        
        print()
        
        # Obtener número de registros
        print(f"6️⃣  Estadísticas de {table_name}:")
        print("-" * 80)
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        print(f"   Total de registros: {count:,}")
        
        if count > 0:
            # Mostrar primeros registros
            print(f"\n   Primeros 5 registros:")
            cursor.execute(f"SELECT * FROM {table_name} WHERE ROWNUM <= 5")
            
            # Obtener nombres de columnas
            col_names = [desc[0] for desc in cursor.description]
            print(f"\n   Columnas: {', '.join(col_names)}\n")
            
            for i, row in enumerate(cursor.fetchall(), 1):
                print(f"   Registro {i}:")
                for col_name, value in zip(col_names, row):
                    print(f"      {col_name}: {value}")
                print()
        
        print()
        print("=" * 80)
        print("✅ Análisis completado exitosamente")
        print("=" * 80)
        
        cursor.close()
        connection.close()
        return True
        
    except oracledb.Error as e:
        print(f"❌ Error de Oracle: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def list_all_tables():
    """Listar todas las tablas disponibles."""
    print("\n📋 Listando todas las tablas disponibles...")
    print("-" * 80)
    
    try:
        connection = create_connection()
        cursor = connection.cursor()
        
        cursor.execute("""
            SELECT table_name, num_rows 
            FROM user_tables 
            ORDER BY table_name
        """)
        
        tables = cursor.fetchall()
        
        if tables:
            print(f"\nTotal de tablas: {len(tables)}\n")
            print(f"{'TABLA':<50} {'REGISTROS':<15}")
            print("-" * 80)
            for table in tables:
                rows = table[1] if table[1] is not None else "N/A"
                print(f"{table[0]:<50} {str(rows):<15}")
        else:
            print("No se encontraron tablas")
        
        cursor.close()
        connection.close()
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")


if __name__ == "__main__":
    print("🔍 Verificador de Estructura de Base de Datos")
    print("Malackathon 2025\n")
    
    # Verificar tabla específica
    table_name = "ENFERMEDADESMENTALESDIAGNOSTICO"
    
    if len(sys.argv) > 1:
        table_name = sys.argv[1].upper()
        print(f"Verificando tabla: {table_name}\n")
    
    success = check_table_structure(table_name)
    
    # Si la tabla no existe, mostrar todas las tablas disponibles
    if not success:
        list_all_tables()
    
    print("\n💡 Uso: python3 check_database_structure.py [NOMBRE_TABLA]")
    print("   Ejemplo: python3 check_database_structure.py PACIENTES\n")
