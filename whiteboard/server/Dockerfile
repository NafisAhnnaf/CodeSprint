# Use a lightweight Python base image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Set environment variables so Python can find the Conda environment later
# These paths must match the host-mounted env path inside the container
ENV CONDA_PREFIX=/opt/conda/envs/ai-whiteboard
ENV PATH=$CONDA_PREFIX/bin:/opt/conda/bin:$PATH

# Copy only necessary app files
COPY main.py ./
COPY .env ./

# Expose FastAPI port
EXPOSE 8900

# Default entrypoint (runs FastAPI app)
CMD ["python", "main.py"]
