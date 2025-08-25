#!/bin/bash

# Build script for Docker image optimized for Kubernetes deployment
set -e

# Configuration
IMAGE_NAME="fastify-api"
IMAGE_TAG="${1:-latest}"
REGISTRY="${2:-localhost:5000}"  # Default to local registry, change for production

echo -e "🚀 Building Docker image for Kubernetes deployment..."
echo -e "📦 Image: ${IMAGE_NAME}:${IMAGE_TAG}"
echo -e "🏗️  Registry: ${REGISTRY}\n"

# Build the multi-stage Docker image
echo -e "🔨 Building Docker image...\n"
docker build \
    --platform linux/amd64 \
    --tag "${IMAGE_NAME}:${IMAGE_TAG}" \
    --tag "${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}" \
    --file Dockerfile \
    .

# Check if build was successful
if [ $? -eq 0 ]; then
    echo -e "✅ Docker image built successfully!\n"
    
    # Display image information
    echo -e "📊 Image details:\n"
    docker images "${IMAGE_NAME}:${IMAGE_TAG}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
    
    # Optional: Push to registry
    if [ "$3" = "--push" ]; then
        echo -e "\n📤 Pushing image to registry...\n"
        
        docker push "${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
        
        echo -e ""
        echo -e "\n✅ Image pushed successfully!\n"
    fi
    
    echo -e ""
    echo -e "🎯 Next steps:"
    echo -e "   1. Test the image locally: docker run -p 3000:3000 ${IMAGE_NAME}:${IMAGE_TAG}"
    echo -e "   2. Deploy to Kubernetes: kubectl apply -f k8s/"
    echo -e "   3. Update image tag in k8s/deployment.yaml if needed"
    
else
    echo -e "❌ Docker build failed!"
    exit 1
fi
