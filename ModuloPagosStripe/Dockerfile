# Usar imagen base de Python
FROM python:3.11-slim

# Establecer directorio de trabajo
WORKDIR /app

# Copiar requirements.txt primero para aprovechar cache de Docker
COPY requirements.txt .

# Instalar dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiar archivos de la aplicación
COPY . .

# Crear usuario no-root para seguridad
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Exponer puerto 5000 (puerto por defecto de Flask)
EXPOSE 5000

# Configurar variables de entorno para Flask
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# Comando para ejecutar la aplicación
CMD ["python", "app.py"]