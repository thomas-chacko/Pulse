# Makefile - Shortcuts for Docker commands
# Makes it easier to run common Docker operations
#
# Usage:
#   make build    - Build Docker image
#   make up       - Start containers
#   make down     - Stop containers
#   make logs     - View logs
#   make clean    - Remove containers and volumes

# Project name
PROJECT_NAME=personal-mcp-server

# Default target
.DEFAULT_GOAL := help

# PHONY targets don't represent actual files
.PHONY: help build up down restart logs shell clean test

# Help command - shows all available commands
help:
	@echo "Available commands:"
	@echo "  make build     - Build Docker images"
	@echo "  make up        - Start all containers (detached mode)"
	@echo "  make dev       - Start in development mode with hot-reload"
	@echo "  make down      - Stop and remove containers"
	@echo "  make restart   - Restart all containers"
	@echo "  make logs      - View container logs (follow mode)"
	@echo "  make shell     - Open shell in MCP server container"
	@echo "  make mongo     - Open MongoDB shell"
	@echo "  make clean     - Remove containers, volumes, and images"
	@echo "  make test      - Run tests inside container"
	@echo "  make status    - Show container status"

# Build Docker images
build:
	@echo "Building Docker images..."
	docker-compose build

# Start containers in detached mode
up:
	@echo "Starting containers..."
	docker-compose up -d
	@echo "Containers started! Access your server at http://localhost:3000"

# Start in development mode
dev:
	@echo "Starting in development mode..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Stop containers
down:
	@echo "Stopping containers..."
	docker-compose down

# Restart containers
restart: down up

# View logs (follow mode)
logs:
	docker-compose logs -f

# Open shell in MCP server container
shell:
	docker-compose exec mcp-server sh

# Open MongoDB shell
mongo:
	docker-compose exec mongodb mongosh

# Show container status
status:
	docker-compose ps

# Run tests
test:
	docker-compose exec mcp-server npm test

# Clean everything (containers, volumes, images)
clean:
	@echo "Removing containers, volumes, and images..."
	docker-compose down -v --rmi all
	@echo "Cleanup complete!"

# Stop, rebuild, and start (fresh start)
rebuild: down build up
	@echo "Rebuild complete!"
