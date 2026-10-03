@echo off
REM Windows batch script - same as "make clean"
echo Removing containers, volumes, and images...
docker-compose down -v --rmi all
echo Cleanup complete!
