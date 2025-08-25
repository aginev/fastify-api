# Kubernetes Deployment Fixes Summary

## 🚨 **Issues Found and Fixed**

### **1. Namespace Mismatch** ✅ FIXED
**Problem**: ConfigMap, Secret, and Service were not in the `fastify-api` namespace, but Ingress referenced it.

**Fix**: Added `namespace: fastify-api` to all resources.

### **2. Missing TLS Secret** ✅ FIXED
**Problem**: Ingress referenced `fastify-api-tls` secret that didn't exist.

**Fix**: Removed TLS configuration for local testing. For production, create proper TLS secret.

### **3. Incorrect Health Check Endpoints** ✅ FIXED
**Problem**: Probes used `/health/live` and `/health/ready` which may not exist.

**Fix**: Changed to `/health` endpoint that exists in your Fastify app.

### **4. Database Host Configuration** ✅ FIXED
**Problem**: `db_host: "localhost"` won't work in Kubernetes.

**Fix**: Changed to `db_host: "mariadb-service"` to use Kubernetes service discovery.

### **5. Missing Database Service** ✅ FIXED
**Problem**: No database deployment to connect to.

**Fix**: Created complete MariaDB deployment with proper service.

## 🔧 **Files Created/Modified**

### **`k8s/deployments/api.yaml`** (Fixed)
- ✅ Added namespace to all resources
- ✅ Fixed health check endpoints
- ✅ Updated database host configuration
- ✅ Removed TLS configuration for local testing

### **`k8s/deployments/database.yaml`** (New)
- ✅ MariaDB deployment with proper security context
- ✅ Persistent volume for data storage
- ✅ ConfigMap for MySQL configuration
- ✅ Service for internal communication

### **`k8s/deploy.sh`** (New)
- ✅ Automated deployment script
- ✅ Proper deployment order (database first, then API)
- ✅ Health checks and status reporting
- ✅ Useful commands and access information

## 🚀 **Deployment Instructions**

### **Quick Deploy**
```bash
# Make script executable
chmod +x k8s/deploy.sh

# Deploy everything
./k8s/deploy.sh
```

### **Manual Deploy**
```bash
# Create namespace
kubectl create namespace fastify-api

# Deploy database first
kubectl apply -f k8s/deployments/database.yaml

# Wait for database
kubectl wait --for=condition=available --timeout=300s deployment/mariadb -n fastify-api

# Deploy API
kubectl apply -f k8s/deployments/api.yaml

# Check status
kubectl get all -n fastify-api
```

## 🔍 **Verification Steps**

### **Check Pod Status**
```bash
kubectl get pods -n fastify-api
```

### **Check Services**
```bash
kubectl get services -n fastify-api
```

### **Check Logs**
```bash
# API logs
kubectl logs -f deployment/fastify-api -n fastify-api

# Database logs
kubectl logs -f deployment/mariadb -n fastify-api
```

### **Test API Access**
```bash
# Port forward to access locally
kubectl port-forward -n fastify-api service/fastify-api-service 8080:80

# Test health endpoint
curl http://localhost:8080/health
```

## ⚠️ **Important Notes**

### **Database Credentials**
The current secrets use placeholder values:
- `db_user`: `db_user` (base64: ZGJfdXNlcg==)
- `db_password`: `db_pass` (base64: ZGJfcGFzcw==)
- `db_root_password`: `root_pass` (base64: cm9vdF9wYXNz)

**⚠️ Change these for production!**

### **Storage Class**
The database PVC uses `storageClassName: standard`. Adjust this based on your cluster:
- **GKE**: `standard` or `premium-rwo`
- **EKS**: `gp2` or `gp3`
- **AKS**: `managed-premium`
- **Local**: `local-path` or `hostpath`

### **Ingress Controller**
The Ingress assumes you have an nginx ingress controller. Install it if needed:
```bash
# For minikube
minikube addons enable ingress

# For other clusters
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
```

## 🎯 **Next Steps**

1. **Customize Configuration**: Update secrets and configs with your values
2. **Test Locally**: Use `./k8s/deploy.sh` to deploy to your cluster
3. **Verify Functionality**: Check health endpoints and database connectivity
4. **Production Setup**: Configure TLS, proper secrets, and monitoring
5. **Scaling**: Adjust replica counts and resource limits as needed

## 📚 **Additional Resources**

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [MariaDB on Kubernetes](https://mariadb.org/k8s/)
- [Ingress Controller Setup](https://kubernetes.github.io/ingress-nginx/deploy/)
- [Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)
