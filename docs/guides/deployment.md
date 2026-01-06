# Deployment Guide

This guide covers deploying MergePRCockPit in various environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Deployment Options](#deployment-options)
3. [Development Deployment](#development-deployment)
4. [Production Deployment](#production-deployment)
5. [Configuration](#configuration)
6. [Monitoring & Operations](#monitoring--operations)
7. [Backup & Disaster Recovery](#backup--disaster-recovery)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Hardware Requirements

#### Minimum (Development/Small Teams)
- **CPU**: 4 cores
- **RAM**: 16 GB
- **Storage**: 100 GB SSD
- **Network**: 100 Mbps
- **Users**: 1-50

#### Recommended (Production)
- **CPU**: 16+ cores
- **RAM**: 64+ GB
- **Storage**: 500+ GB SSD (NVMe preferred)
- **Network**: 1 Gbps
- **Users**: 100-1000+

#### High Availability Cluster
- **Nodes**: 3-10+ nodes
- **CPU per node**: 8-16 cores
- **RAM per node**: 32-64 GB
- **Storage**: 1+ TB distributed
- **Network**: 10 Gbps

### Software Requirements

- **Operating System**: Linux (Ubuntu 20.04+, RHEL 8+, or equivalent)
- **Container Runtime**: Docker 20.10+ or containerd 1.6+
- **Kubernetes**: 1.24+ (for cluster deployments)
- **Database**: PostgreSQL 14+
- **Cache**: Redis 7+
- **Message Queue**: NATS 2.9+

### Network Requirements

- **Ports**:
  - 80/443 (HTTP/HTTPS) - Web UI and API
  - 5432 (PostgreSQL)
  - 6379 (Redis)
  - 4222 (NATS)
  - 9200 (Elasticsearch)
  - 3000 (Grafana - optional)
  - 9090 (Prometheus - optional)

---

## Deployment Options

### 1. Docker Compose (Development/Small Teams)

**Best for**: Development, testing, small teams (1-50 users)

**Pros**:
- Quick setup
- Easy to manage
- Low resource requirements

**Cons**:
- Limited scalability
- No high availability
- Manual updates

### 2. Kubernetes (Production/Enterprise)

**Best for**: Production, enterprise deployments (100+ users)

**Pros**:
- High availability
- Auto-scaling
- Rolling updates
- Easy monitoring

**Cons**:
- More complex
- Higher resource requirements
- Requires Kubernetes knowledge

### 3. Bare Metal (Custom Deployments)

**Best for**: Air-gapped environments, custom requirements

**Pros**:
- Maximum control
- Optimized performance
- Custom configurations

**Cons**:
- Manual management
- Complex setup
- Requires deep knowledge

---

## Development Deployment

### Docker Compose Setup

#### 1. Clone Repository

```bash
git clone https://github.com/muammarlone/MergePRCockPit.git
cd MergePRCockPit
```

#### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit configuration
nano .env
```

Example `.env`:
```bash
# Database
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=mergeprcockpit
POSTGRES_USER=mpc
POSTGRES_PASSWORD=changeme

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# NATS
NATS_HOST=nats
NATS_PORT=4222

# API Gateway
API_GATEWAY_PORT=8080
JWT_SECRET=your-secret-key-here

# AI Services
AI_MODEL_STORAGE=/data/models
AI_GPU_ENABLED=false

# Feature Flags
ENABLE_AI_ASSISTANTS=true
ENABLE_PLUGIN_FRAMEWORK=true
```

#### 3. Start Services

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### 4. Initialize Database

```bash
# Run migrations
docker-compose exec api-gateway ./scripts/migrate.sh

# Seed initial data (optional)
docker-compose exec api-gateway ./scripts/seed.sh
```

#### 5. Access Platform

- **Web UI**: http://localhost:8080
- **API**: http://localhost:8080/api/v1
- **API Docs**: http://localhost:8080/api/docs

Default credentials:
- **Username**: admin
- **Password**: admin (change immediately!)

---

## Production Deployment

### Kubernetes Deployment

#### 1. Prepare Cluster

```bash
# Create namespace
kubectl create namespace mergeprcockpit

# Create secrets
kubectl create secret generic mpc-secrets \
  --from-literal=postgres-password=<password> \
  --from-literal=jwt-secret=<secret> \
  --namespace=mergeprcockpit
```

#### 2. Deploy with Helm

```bash
# Add Helm repository (future)
helm repo add mergeprcockpit https://charts.mergeprcockpit.io

# Update repositories
helm repo update

# Install chart
helm install mpc mergeprcockpit/mergeprcockpit \
  --namespace mergeprcockpit \
  --values values-production.yaml

# Or install from local chart
cd deploy/helm/mergeprcockpit
helm install mpc . \
  --namespace mergeprcockpit \
  --values values-production.yaml
```

#### 3. Configure values.yaml

```yaml
# values-production.yaml

# Global settings
global:
  domain: mergeprcockpit.example.com
  environment: production
  
# Replicas
replicaCount:
  apiGateway: 3
  gitOperations: 3
  issueManagement: 2
  prAnalytics: 2
  aiAssistants: 2
  trustFabric: 2
  pluginEngine: 2

# Resources
resources:
  apiGateway:
    requests:
      cpu: 500m
      memory: 1Gi
    limits:
      cpu: 2000m
      memory: 4Gi
  
  aiAssistants:
    requests:
      cpu: 2000m
      memory: 4Gi
      nvidia.com/gpu: 1
    limits:
      cpu: 8000m
      memory: 16Gi
      nvidia.com/gpu: 1

# Storage
persistence:
  enabled: true
  storageClass: fast-ssd
  size: 500Gi

# Database
postgresql:
  enabled: true
  auth:
    existingSecret: mpc-secrets
    secretKeys:
      adminPasswordKey: postgres-password
  primary:
    persistence:
      size: 200Gi
  replication:
    enabled: true
    readReplicas: 2

# Redis
redis:
  enabled: true
  architecture: replication
  master:
    persistence:
      size: 50Gi
  replica:
    replicaCount: 2

# Ingress
ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: mergeprcockpit.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: mpc-tls
      hosts:
        - mergeprcockpit.example.com

# Monitoring
monitoring:
  enabled: true
  prometheus:
    enabled: true
  grafana:
    enabled: true
    adminPassword: <secure-password>

# Autoscaling
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80
```

#### 4. Verify Deployment

```bash
# Check pods
kubectl get pods -n mergeprcockpit

# Check services
kubectl get svc -n mergeprcockpit

# Check ingress
kubectl get ingress -n mergeprcockpit

# View logs
kubectl logs -f deployment/api-gateway -n mergeprcockpit
```

#### 5. Configure DNS

Point your domain to the ingress controller:

```bash
# Get ingress IP
kubectl get ingress mpc -n mergeprcockpit -o jsonpath='{.status.loadBalancer.ingress[0].ip}'

# Add DNS record
# mergeprcockpit.example.com -> <ingress-ip>
```

---

## Configuration

### Environment-Specific Configuration

#### Development
```yaml
# config/development/api-gateway.yaml
server:
  port: 8080
  debug: true
  cors:
    enabled: true
    origins: ["*"]

logging:
  level: debug
  format: text

features:
  ai_assistants: true
  plugin_framework: true
```

#### Production
```yaml
# config/production/api-gateway.yaml
server:
  port: 8080
  debug: false
  cors:
    enabled: true
    origins: ["https://mergeprcockpit.example.com"]

logging:
  level: info
  format: json

features:
  ai_assistants: true
  plugin_framework: true

security:
  tls:
    enabled: true
    cert_file: /certs/tls.crt
    key_file: /certs/tls.key
  rate_limiting:
    enabled: true
    requests_per_minute: 100
```

### Database Configuration

```yaml
# config/production/database.yaml
postgres:
  host: postgres.mergeprcockpit.svc.cluster.local
  port: 5432
  database: mergeprcockpit
  user: mpc
  password_secret: mpc-secrets/postgres-password
  
  pool:
    max_connections: 100
    min_connections: 10
    max_lifetime: 3600
  
  backup:
    enabled: true
    schedule: "0 2 * * *"  # Daily at 2 AM
    retention_days: 30
```

### AI Configuration

```yaml
# config/production/ai-assistants.yaml
ai:
  inference:
    backend: torchserve
    gpu_enabled: true
    batch_size: 32
    
  models:
    pr_review_assistant:
      enabled: true
      version: "1.0.0"
      replicas: 2
      
    merge_intelligence:
      enabled: true
      version: "1.2.0"
      replicas: 2
```

---

## Monitoring & Operations

### Prometheus Metrics

```bash
# Access Prometheus
kubectl port-forward svc/prometheus 9090:9090 -n mergeprcockpit

# Open http://localhost:9090
```

Key metrics to monitor:
- `http_requests_total` - Total HTTP requests
- `http_request_duration_seconds` - Request latency
- `db_connections_active` - Database connections
- `ai_model_latency_ms` - AI inference latency
- `git_operations_total` - Git operations count

### Grafana Dashboards

```bash
# Access Grafana
kubectl port-forward svc/grafana 3000:3000 -n mergeprcockpit

# Open http://localhost:3000
# Default: admin/admin
```

Import pre-built dashboards:
1. Platform Overview
2. Git Operations
3. PR Analytics
4. AI Performance
5. Database Performance

### Logging

```bash
# View logs with kubectl
kubectl logs -f deployment/api-gateway -n mergeprcockpit

# Aggregate logs with Elasticsearch/Loki
kubectl port-forward svc/kibana 5601:5601 -n logging
```

### Alerts

Configure alerting in Prometheus:

```yaml
# alerts.yaml
groups:
  - name: mergeprcockpit
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected"
          
      - alert: DatabaseDown
        expr: up{job="postgresql"} == 0
        for: 1m
        annotations:
          summary: "Database is down"
```

---

## Backup & Disaster Recovery

### Database Backup

#### Automated Backups

```bash
# Configure backup with Helm
helm upgrade mpc mergeprcockpit/mergeprcockpit \
  --set postgresql.backup.enabled=true \
  --set postgresql.backup.schedule="0 2 * * *"
```

#### Manual Backup

```bash
# Backup PostgreSQL
kubectl exec -it postgres-0 -n mergeprcockpit -- \
  pg_dump -U mpc mergeprcockpit > backup-$(date +%Y%m%d).sql

# Backup to S3 (recommended)
kubectl exec -it postgres-0 -n mergeprcockpit -- \
  pg_dump -U mpc mergeprcockpit | \
  aws s3 cp - s3://backups/mergeprcockpit/backup-$(date +%Y%m%d).sql
```

### Recovery

```bash
# Restore from backup
kubectl exec -it postgres-0 -n mergeprcockpit -- \
  psql -U mpc mergeprcockpit < backup-20260106.sql

# Or from S3
aws s3 cp s3://backups/mergeprcockpit/backup-20260106.sql - | \
  kubectl exec -i postgres-0 -n mergeprcockpit -- \
  psql -U mpc mergeprcockpit
```

### Disaster Recovery Plan

1. **RTO** (Recovery Time Objective): < 4 hours
2. **RPO** (Recovery Point Objective): < 1 hour

**Steps**:
1. Restore database from latest backup
2. Redeploy services with Helm
3. Verify all services are running
4. Run smoke tests
5. Notify users

---

## Troubleshooting

### Common Issues

#### Pods Not Starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n mergeprcockpit

# Common causes:
# 1. Image pull errors - check image name/tag
# 2. Resource constraints - increase limits
# 3. ConfigMap/Secret missing - create them
```

#### Database Connection Issues

```bash
# Check database pod
kubectl logs postgres-0 -n mergeprcockpit

# Test connection
kubectl run -it --rm debug --image=postgres:14 --restart=Never -- \
  psql -h postgres -U mpc -d mergeprcockpit
```

#### High Memory Usage

```bash
# Check resource usage
kubectl top pods -n mergeprcockpit

# Solutions:
# 1. Increase memory limits
# 2. Optimize queries
# 3. Enable caching
# 4. Scale horizontally
```

#### AI Service Slow

```bash
# Check AI service logs
kubectl logs deployment/ai-assistants -n mergeprcockpit

# Common causes:
# 1. No GPU available - check GPU allocation
# 2. Model not loaded - check model storage
# 3. High concurrency - scale replicas
```

### Debug Mode

```bash
# Enable debug logging
kubectl set env deployment/api-gateway LOG_LEVEL=debug -n mergeprcockpit

# Disable after debugging
kubectl set env deployment/api-gateway LOG_LEVEL=info -n mergeprcockpit
```

### Performance Tuning

#### Database
- Enable connection pooling
- Add indexes for slow queries
- Configure vacuuming
- Use read replicas

#### Cache
- Tune Redis eviction policies
- Increase cache size
- Use cache warming

#### API Gateway
- Enable rate limiting
- Use CDN for static assets
- Enable gzip compression
- Optimize connection timeouts

---

## Scaling

### Horizontal Scaling

```bash
# Scale deployment manually
kubectl scale deployment api-gateway --replicas=5 -n mergeprcockpit

# Enable autoscaling
kubectl autoscale deployment api-gateway \
  --min=2 --max=10 --cpu-percent=70 \
  -n mergeprcockpit
```

### Vertical Scaling

```bash
# Increase resources
kubectl set resources deployment api-gateway \
  --limits=cpu=4,memory=8Gi \
  --requests=cpu=2,memory=4Gi \
  -n mergeprcockpit
```

---

## Security Hardening

### Network Policies

```yaml
# network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-gateway-policy
spec:
  podSelector:
    matchLabels:
      app: api-gateway
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: postgres
```

### Pod Security

```yaml
# pod-security.yaml
apiVersion: v1
kind: Pod
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    fsGroup: 1000
  containers:
    - name: api-gateway
      securityContext:
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        capabilities:
          drop:
            - ALL
```

---

## Support

For deployment assistance:
- **Documentation**: https://docs.mergeprcockpit.io/deployment
- **Community**: https://community.mergeprcockpit.io
- **Enterprise Support**: support@mergeprcockpit.io

---

**Last Updated**: 2026-01-06  
**Version**: 1.0
