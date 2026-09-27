# Azaria Wiki - Docker Makefile
.PHONY: help dev dev-check build run deploy stop rm restart logs health smoke test test-image stats build-multi push pull scan audit clean clean-all prune shell inspect size up down ps ci-build version

# Variables
IMAGE_NAME = azaria-wiki
CONTAINER_NAME = azaria-wiki
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
dev: ## Start the SvelteKit dev server (http://localhost:5173)
	@echo "🚀 Starting dev server..."
	npm run dev

dev-check: ## Type-check and lint the project
	@echo "🧪 Running svelte-check and lint..."
	npm run check
	npm run lint

##@ Production
build: ## Build production image
	@echo "🔨 Building production image..."
	docker build -t $(IMAGE_NAME):$(TAG) .

run: ## Run production container (host 8080 -> container :80)
	@echo "🏃 Running production container..."
	docker run -d \
		--name $(CONTAINER_NAME) \
		--restart unless-stopped \
		-p $(PORT):80 \
		$(IMAGE_NAME):$(TAG)

deploy: ## Deploy using docker compose
	@echo "🚀 Deploying with docker compose..."
	docker compose up -d

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
stop: ## Stop running container
	@echo "🛑 Stopping container..."
	-docker stop $(CONTAINER_NAME)

rm: stop ## Remove container
	@echo "🗑️  Removing container..."
	-docker rm $(CONTAINER_NAME)

restart: stop run ## Restart production container

##@ Monitoring
logs: ## Show container logs
	@echo "📋 Showing container logs..."
	docker logs -f $(CONTAINER_NAME)

health: ## Check container health (host port $(PORT))
	@echo "🏥 Checking container health..."
	@curl -f http://localhost:$(PORT)/health && echo "✅ Container is healthy" || echo "❌ Container is unhealthy"

stats: ## Show container resource usage
	@echo "📊 Container resource usage:"
	docker stats --no-stream $(CONTAINER_NAME)

##@ Testing
smoke: ## Run smoke tests against the built image
	@echo "🧪 Running smoke tests..."
	bash scripts/smoke-test.sh $(IMAGE_NAME):$(TAG)

test: smoke ## Alias for `make smoke`

test-image: build ## Build and smoke-test the image
	@echo "🧪 Building and smoke-testing image..."
	bash scripts/smoke-test.sh $(IMAGE_NAME):$(TAG)

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
clean: ## Clean up container and image
	@echo "🧹 Cleaning up..."
	-docker stop $(CONTAINER_NAME)
	-docker rm $(CONTAINER_NAME)
	-docker rmi $(IMAGE_NAME):$(TAG)

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

inspect: ## Inspect container configuration
	@echo "🔍 Inspecting container..."
	docker inspect $(CONTAINER_NAME)

size: ## Show image size
	@echo "📏 Image size:"
	docker images $(IMAGE_NAME):$(TAG) --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

##@ Docker Compose
up: ## Start all services with docker compose
	@echo "🚀 Starting services with docker compose..."
	docker compose up -d

down: ## Stop all services with docker compose
	@echo "🛑 Stopping services with docker compose..."
	docker compose down

ps: ## Show running services
	@echo "📋 Running services:"
	docker compose ps

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
