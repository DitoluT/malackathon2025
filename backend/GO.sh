#!/bin/bash
# SCRIPT DE INICIO SUPER SIMPLE - Malackathon 2025 Backend

echo "🚀 Iniciando Backend Malackathon 2025..."
echo ""

# Verificar que oracledb está instalado
if ! python3 -c "import oracledb" 2>/dev/null; then
    echo "📦 Instalando dependencias..."
    pip install -r requirements.txt
fi

echo "✅ Iniciando servidor en http://localhost:8000"
echo "📚 Documentación en http://localhost:8000/docs"
echo ""
echo "Presiona Ctrl+C para detener"
echo ""

python3 main.py
