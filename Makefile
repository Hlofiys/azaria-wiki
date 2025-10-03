# Azaria Wiki - Docker Makefile
.PHONY: help build run dev stop clean test deploy logs health

# Variables
IMAGE_NAME = azaria-wiki
CONTAINER_NAME = azaria-wiki
DEV_CONTAINER_NAME = azaria-wiki-dev
REGISTRY = ghcr.io
REPO_NAME = $(shell basename `git rev-parse --show-toplevel`)
TAG = latest
PORT = 8080
DEV_PORT = 5173

# Default target
help: ## Show this help message
	@echo "Azaria Wiki - Docker Management"
	@echo "================================"
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Development
dev: ## Start development environment with hot reload
	@echo "🚀 Starting development environment..."
	docker-compose -f docker-compose.dev.yml up --build

dev-build: ## Build development image
	@echo "🔨 Building development image..."
	docker build -f Dockerfile.dev -t $(IMAGE_NAME):dev .

dev-run: ## Run development container
	@echo "🏃 Running development container..."
	docker run -d \
		--name $(DEV_CONTAINER_NAME) \
		-p $(DEV_PORT):$(DEV_PORT) \
		-v $(PWD):/app \
		-v /app/node_modules \
		$(IMAGE_NAME):dev

dev-stop: ## Stop development environment
	@echo "🛑 Stopping development environment..."
	docker-compose -f docker-compose.dev.yml down

##@ Production
build: ## Build production image
	@echo "🔨 Building production image..."
	docker build -t $(IMAGE_NAME):$(TAG) .

run: ## Run production container
	@echo "🏃 Running production container..."
	docker run -d \
		--name $(CONTAINER_NAME) \
		--restart unless-stopped \
		-p $(PORT):8080 \
		$(IMAGE_NAME):$(TAG)

deploy: ## Deploy using docker-compose
	@echo "🚀 Deploying with docker-compose..."
	docker-compose up -d

##@ Multi-platform
build-multi: ## Build multi-platform image (amd64, arm64)
	@echo "🔨 Building multi-platform image..."
	docker buildx build \
		--platform linux/amd64,linux/arm64 \
		-t $(IMAGE_NAME):$(TAG) \
		--push .

##@ Registry Operations
push: ## Push image to registry
	@echo "📤 Pushing image to registry..."
	docker tag $(IMAGE_NAME):$(TAG) $(REGISTRY)/$(REPO_NAME):$(TAG)
	docker push $(REGISTRY)/$(REPO_NAME):$(TAG)

pull: ## Pull image from registry
	@echo "📥 Pulling image from registry..."
	docker pull $(REGISTRY)/$(REPO_NAME):$(TAG)

##@ Container Management
stop: ## Stop running containers
	@echo "🛑 Stopping containers..."
	-docker stop $(CONTAINER_NAME) $(DEV_CONTAINER_NAME)

rm: stop ## Remove containers
	@echo "🗑️  Removing containers..."
	-docker rm $(CONTAINER_NAME) $(DEV_CONTAINER_NAME)

restart: stop run ## Restart production container

##@ Monitoring
logs: ## Show container logs
	@echo "📋 Showing container logs..."
	docker logs -f $(CONTAINER_NAME)

logs-dev: ## Show development container logs
	@echo "📋 Showing development container logs..."
	docker logs -f $(DEV_CONTAINER_NAME)

health: ## Check container health
	@echo "🏥 Checking container health..."
	@curl -f http://localhost:$(PORT)/health && echo "✅ Container is healthy" || echo "❌ Container is unhealthy"

stats: ## Show container resource usage
	@echo "📊 Container resource usage:"
	docker stats --no-stream $(CONTAINER_NAME)

##@ Testing
test: ## Run container tests
	@echo "🧪 Running container tests..."
	@./scripts/test-container.sh

test-image: build ## Build and test image
	@echo "🧪 Testing built image..."
	@docker run --rm --name $(CONTAINER_NAME)-test \
		-p 8081:8080 \
		-d $(IMAGE_NAME):$(TAG)
	@sleep 10
	@curl -f http://localhost:8081/health || (docker stop $(CONTAINER_NAME)-test && exit 1)
	@echo "✅ Image test passed"
	@docker stop $(CONTAINER_NAME)-test

##@ Security
scan: ## Scan image for vulnerabilities
	@echo "🔍 Scanning image for vulnerabilities..."
	docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
		aquasec/trivy:latest image $(IMAGE_NAME):$(TAG)

audit: ## Security audit of the container
	@echo "🔐 Running security audit..."
	docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
		-v $(PWD):/src \
		aquasec/trivy:latest fs /src

##@ Cleanup
clean: ## Clean up containers and images
	@echo "🧹 Cleaning up..."
	-docker stop $(CONTAINER_NAME) $(DEV_CONTAINER_NAME)
	-docker rm $(CONTAINER_NAME) $(DEV_CONTAINER_NAME)
	-docker rmi $(IMAGE_NAME):$(TAG) $(IMAGE_NAME):dev

clean-all: ## Clean up everything (containers, images, volumes)
	@echo "🧹 Deep cleaning..."
	docker system prune -af
	docker volume prune -f

prune: ## Remove unused Docker objects
	@echo "🧹 Pruning unused Docker objects..."
	docker system prune -f

##@ Utilities
shell: ## Open shell in running container
	@echo "🐚 Opening shell in container..."
	docker exec -it $(CONTAINER_NAME) /bin/sh

shell-dev: ## Open shell in development container
	@echo "🐚 Opening shell in development container..."
	docker exec -it $(DEV_CONTAINER_NAME) /bin/sh

inspect: ## Inspect container configuration
	@echo "🔍 Inspecting container..."
	docker inspect $(CONTAINER_NAME)

size: ## Show image size
	@echo "📏 Image size:"
	docker images $(IMAGE_NAME):$(TAG) --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

##@ Docker Compose
up: ## Start all services with docker-compose
	@echo "🚀 Starting services with docker-compose..."
	docker-compose up -d

down: ## Stop all services with docker-compose
	@echo "🛑 Stopping services with docker-compose..."
	docker-compose down

ps: ## Show running services
	@echo "📋 Running services:"
	docker-compose ps

##@ CI/CD
ci-build: ## Build for CI/CD pipeline
	@echo "🏗️  Building for CI/CD..."
	docker build \
		--build-arg NODE_ENV=production \
		--build-arg BUILD_DATE=$(shell date -u +'%Y-%m-%dT%H:%M:%SZ') \
		--build-arg VCS_REF=$(shell git rev-parse --short HEAD) \
		-t $(IMAGE_NAME):$(TAG) .

version: ## Show current version info
	@echo "📦 Version Information:"
	@echo "Git commit: $(shell git rev-parse --short HEAD)"
	@echo "Git branch: $(shell git rev-parse --abbrev-ref HEAD)"
	@echo "Build date: $(shell date -u +'%Y-%m-%dT%H:%M:%SZ')"
	@echo "Image: $(IMAGE_NAME):$(TAG)"