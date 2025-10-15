#!/bin/bash

# Malackathon 2025 - Backend Setup Script

echo "=========================================="
echo "Malackathon 2025 Backend Setup"
echo "=========================================="
echo ""

# Check Python version
echo "Checking Python version..."
python_version=$(python3 --version 2>&1 | grep -oP '\d+\.\d+')
if (( $(echo "$python_version < 3.9" | bc -l) )); then
    echo "Error: Python 3.9 or higher is required. Found: $python_version"
    exit 1
fi
echo "Python version OK: $(python3 --version)"
echo ""

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo "Virtual environment created"
else
    echo "Virtual environment already exists"
fi
echo ""

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate
echo ""

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip
echo ""

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo ".env file created. Please edit it with your database credentials."
    echo ""
else
    echo ".env file already exists"
    echo ""
fi

# Done
echo "=========================================="
echo "Setup completed successfully!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Edit .env file with your database credentials"
echo "2. Activate virtual environment: source venv/bin/activate"
echo "3. Run the application: python main.py"
echo "   or: uvicorn main:app --reload"
echo ""
echo "API Documentation will be available at:"
echo "  - Swagger UI: http://localhost:8000/docs"
echo "  - ReDoc: http://localhost:8000/redoc"
echo ""
