@echo off
REM Windows batch script - same as "make dev"
echo Starting in development mode...
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
