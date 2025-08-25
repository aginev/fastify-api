# Docker & Kubernetes Deployment Guide

This guide covers deploying your Node.js API to Kubernetes using Docker containers.

## 🐳 Docker Setup

### Prerequisites
- Docker installed and running
- Node.js 20+ (for local development)

### Building the Docker Image

#### Option 1: Using the Build Script (Recommended)
```bash
# Build with default settings
./scripts/build-docker.sh

# Build with custom tag
./scripts/build-docker.sh v1.0.0

# Build and push to registry
./scripts/build-docker.sh v1.0.0 your-registry.com --push
```

#### Option 2: Manual Docker Build
```bash
# Build the image
docker build -t nodejs-api:latest .

# Tag for your registry
docker tag nodejs-api:latest your-registry.com/nodejs-api:latest

# Push to registry
docker push your-registry.com/nodejs-api:latest
```

### Testing the Docker Image Locally
```bash
# Run the container
docker run -p 3000:3000 nodejs-api:latest

# Run with environment variables
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e DB_HOST=localhost \
  nodejs-api:latest

# Run in detached mode
docker run -d -p 3000:3000 --name api-container nodejs-api:latest

# View logs
docker logs api-container

# Stop and remove
docker stop api-container && docker rm api-container
```

## ☸️ Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (local: minikube, Docker Desktop, or cloud: GKE, EKS, AKS)
- `kubectl` configured to access your cluster
- Container registry access (if using private images)

### Deployment Steps

#### 1. Update Configuration
Edit `k8s/deployment.yaml`:
- Update image name and tag
- Configure database connection details
- Adjust resource limits and replicas
- Update ingress hostname

#### 2. Create Secrets and ConfigMaps
```bash
# Create database secrets (replace with your values)
kubectl create secret generic nodejs-api-secrets \
  --from-literal=db_user=your_db_user \
  --from-literal=db_password=your_db_password

# Create database config
kubectl create configmap nodejs-api-config \
  --from-literal=db_host=your-db-host \
  --from-literal=db_port=3306 \
  --from-literal=db_name=api
```

#### 3. Deploy to Kubernetes
```bash
# Apply all manifests
kubectl apply -f k8s/

# Or deploy individually
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

#### 4. Verify Deployment
```bash
# Check deployment status
kubectl get deployments
kubectl get pods
kubectl get services
kubectl get ingress

# View logs
kubectl logs -l app=nodejs-api

# Check pod details
kubectl describe pod <pod-name>
```

### Scaling and Updates

#### Scale Deployment
```bash
# Scale to 5 replicas
kubectl scale deployment nodejs-api --replicas=5

# Auto-scaling (if HPA is configured)
kubectl autoscale deployment nodejs-api --min=2 --max=10 --cpu-percent=80
```

#### Rolling Update
```bash
# Update image
kubectl set image deployment/nodejs-api nodejs-api=your-registry.com/nodejs-api:v1.1.0

# Check rollout status
kubectl rollout status deployment/nodejs-api

# Rollback if needed
kubectl rollout undo deployment/nodejs-api
```

## 🔧 Configuration

### Environment Variables
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `production` | Yes |
| `PORT` | Server port | `3000` | Yes |
| `GRACEFUL_SHUTDOWN_TIMEOUT` | Shutdown timeout (ms) | `30000` | No |
| `DB_HOST` | Database host | - | Yes |
| `DB_PORT` | Database port | `3306` | Yes |
| `DB_NAME` | Database name | - | Yes |
| `DB_USER` | Database user | - | Yes |
| `DB_PASSWORD` | Database password | - | Yes |

### Resource Requirements
```yaml
resources:
  requests:
    memory: "128Mi"    # Minimum memory
    cpu: "100m"        # Minimum CPU
  limits:
    memory: "512Mi"    # Maximum memory
    cpu: "500m"        # Maximum CPU
```

### Health Checks
- **Liveness Probe**: `/health` endpoint every 10s
- **Readiness Probe**: `/health` endpoint every 5s
- **Startup Probe**: 30s initial delay

## 🚀 Production Considerations

### Security
- ✅ Non-root user (UID 1001)
- ✅ Read-only filesystem where possible
- ✅ Dropped capabilities
- ✅ Resource limits
- ✅ Secrets management

### Monitoring
- Health check endpoints
- Structured logging
- Metrics collection
- Distributed tracing

### High Availability
- Multiple replicas (3+)
- Pod anti-affinity rules
- Multi-zone deployment
- Load balancing

### Backup & Recovery
- Database backups
- Configuration versioning
- Rollback procedures
- Disaster recovery plan

## 🔍 Troubleshooting

### Common Issues

#### Pod Not Starting
```bash
# Check pod events
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>

# Check resource usage
kubectl top pod <pod-name>
```

#### Image Pull Errors
```bash
# Check image pull policy
kubectl get pod <pod-name> -o yaml | grep imagePullPolicy

# Verify image exists
docker images | grep nodejs-api
```

#### Health Check Failures
```bash
# Test health endpoint locally
curl http://localhost:3000/health

# Check probe configuration
kubectl get pod <pod-name> -o yaml | grep -A 20 livenessProbe
```

### Debug Commands
```bash
# Port forward to access service locally
kubectl port-forward service/nodejs-api-service 8080:80

# Execute commands in pod
kubectl exec -it <pod-name> -- /bin/sh

# View pod metrics
kubectl top pod <pod-name>
```

## 📚 Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Fastify Production Guide](https://www.fastify.io/docs/latest/Guides/Production/)
- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
