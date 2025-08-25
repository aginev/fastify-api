#!/bin/bash

# Kubernetes deployment script for Fastify API
set -e

NAMESPACE="fastify-api"
DEPLOYMENT_DIR="k8s/deployments"  # Fixed path

echo -e "🚀 Deploying Fastify API to Kubernetes...\n"
echo -e "📦 Namespace: ${NAMESPACE}"

# Create namespace if it doesn't exist
echo -e "\n🔧 Creating namespace...\n"
kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

# Check what's already deployed
echo -e "\n🔍 Checking existing resources...\n"
kubectl get all,ingress,configmap,secret -n ${NAMESPACE} || echo -e "No existing resources found"

# Check if we're using kind and load the image
if command -v kind &> /dev/null; then
    echo -e "\n🐳 Kind detected, checking clusters...\n"
    
    # Get the first available cluster name
    CLUSTER_NAME=$(kind get clusters | head -n 1)

    echo "CLUSTER_NAME: $CLUSTER_NAME"
    
    if [ -n "$CLUSTER_NAME" ]; then
        echo -e "\n🐳 Loading Docker image into kind cluster: $CLUSTER_NAME \n"
        
        kind load docker-image fastify-api:latest --name "$CLUSTER_NAME" || {
            echo -e "⚠️  Failed to load image into kind cluster: $CLUSTER_NAME"
            echo -e "   Make sure you've built the image: docker build -t fastify-api:latest ."

            exit 1
        }
    else
        echo -e "⚠️  No kind clusters found. Create one with: kind create cluster"
        echo -e "   Then rebuild and redeploy."

        exit 1
    fi
fi

# Apply API deployment
echo -e "\n🚀 Deploying API...\n"
kubectl apply -f ${DEPLOYMENT_DIR}/api.yaml || {
    echo -e "⚠️  Deployment failed, trying to replace existing resources..."
    
    kubectl replace -f ${DEPLOYMENT_DIR}/api.yaml --force || {
        echo -e "❌ Replace failed, deleting and recreating..."
        
        kubectl delete -f ${DEPLOYMENT_DIR}/api.yaml --ignore-not-found || {
            echo -e "❌ Delete failed, trying to recreate..."
        }

        kubectl apply -f ${DEPLOYMENT_DIR}/api.yaml || {
            echo -e "❌ Recreate failed, exiting..."

            exit 1
        }

        echo -e "✅ Recreate successful!\n"
    }
}

# Wait for API to be ready
echo -e "\n⏳ Waiting for API to be ready...\n"
kubectl wait --for=condition=available --timeout=300s deployment/fastify-api -n ${NAMESPACE}

# Show deployment status
echo -e "\n✅ Deployment completed!\n"
echo -e ""
echo -e "📊 Current status:\n"
kubectl get all -n ${NAMESPACE}

echo -e ""
echo -e "\n🌐 Access your API:\n"
echo -e "   - Local: kubectl port-forward -n ${NAMESPACE} service/fastify-api-service 8080:80"
echo -e "   - Ingress: https://fastify-api.localtest.me (if ingress controller is running)"
echo -e ""
echo -e "📝 Useful commands:"
echo -e "   - View logs: kubectl logs -f deployment/fastify-api -n ${NAMESPACE}"
echo -e "   - Check status: kubectl get pods -n ${NAMESPACE}"
echo -e "   - Scale: kubectl scale deployment/fastify-api --replicas=5 -n ${NAMESPACE}"
echo -e ""
echo -e "⚠️  Important Notes:"
echo -e "   - Your API is configured to use 'host.kind.internal' as database host"
echo -e "   - Make sure your database is accessible from the kind cluster"
echo -e "   - For production, update the database host in k8s/deployments/api.yaml"
echo -e "   - TLS is enabled and requires the 'fastify-api-tls' secret (which you've created)"
echo -e "   - Health endpoints /health/live and /health/ready are configured and accessible"
