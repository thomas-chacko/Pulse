@echo off
REM Windows batch script - same as "make up"
echo Starting containers...
docker-compose up -d
echo Containers started! Access your server at http://localhost:3000
