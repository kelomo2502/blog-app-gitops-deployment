# blog-app-gitops-deploymnt 
This project aims to show how a blog app developed with React Vite frontend and a Firebase backend can be deployed to kubernetes using CI CD pipelines such as `github-actions`  and `jenkins` can be deployed in conjuction with kubernetes tools like `helm charts`and `kustomize`. We would be deploying locally to `minikube` cluster and also to production using `aws eks`. We would tie all this together into gitops practice using git as our single source of truth. All of this will happen in a declarative manner in order to make sure that our current application state always matches the application desired state.

We shall divide the implementation of this project into the following phases:
1. Setting up Docker image
2. Setting up minikube environment
3. Setting up helm chart
4. Setting up kustomize
5. Deploying blog-app to minikube using helm charts
6. Deploying blog-app to minikube using kustomize base and overlays
7. Seeting up argocd
8. Implementing gitops using argocd with git as our single source of truth

## 1.  Setting up the Docker Image

Here’s a production-ready `Dockerfile` for React + Firebase blog app, following best practices for security, efficiency, and maintainability.

### 🔹 Key Optimizations

- ✅ **Multi-Stage Build** (Reduces image size significantly)
- ✅ **Minimal Base Image** (`node:20-alpine` for security & performance)
- ✅ **Runs as Non-Root User** (`node` user instead of `root`)
- ✅ **Explicit Tags** (Avoids `latest` for reproducibility)
- ✅ **Optimized Layer Caching** (Installs dependencies before copying the code)
- ✅ **Health Checks** (Ensures the container is running)
- ✅ **Security Measures** (Vulnerability scanning, linter recommendation)
- ✅ **Metadata Labels** (Adds useful info about the image)

**Note** Running as a non-root user gives a better level of security but also comes with an additional level of permission complexities. So we would try and factor all of that into our Dockerfile

### Dockerfile for React + Firebase Blog App

```dockerfile
# ----- builder stage -----
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build



FROM nginx:alpine

# Metadata for final image
LABEL org.opencontainers.image.source="https://github.com/kelomo2502/blog-app-gitops-deployment"
LABEL org.opencontainers.image.maintainer="kelvinoye@gmail.com"
LABEL org.opencontainers.image.description="Nginx container to serve blog app"

# Add non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create necessary dirs and assign permissions to non-root user
RUN mkdir -p /var/cache/nginx /var/run && \
    chown -R appuser:appgroup /usr/share/nginx /var/cache/nginx /var/run

# Copy custom nginx configuration file to replace default config
COPY nginx.conf /etc/nginx/nginx.conf

# Set working directory
WORKDIR /usr/share/nginx/html

# Copy build artifacts from the builder stage
COPY --from=builder /app/dist/ ./

# Copy and set permissions for entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Change ownership of nginx html directory (if not done earlier)
RUN chown -R appuser:appgroup /usr/share/nginx/html

RUN mkdir -p /run && chown appuser:appgroup /run

# Switch to non-root user
USER appuser

# Health check to verify container is serving
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --spider http://127.0.0.1 || exit 1

# Entrypoint
ENTRYPOINT ["/entrypoint.sh"]


```

### `.dockerignore` (Prevent unnecessary files from being copied)

```gitignore
# Node.js dependencies
node_modules
npm-debug.log
yarn.lock
container.sh

# Build artifacts
dist
build

# Environment files (security reasons)
.env.local
.env.development
.env.production
.env

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Git files
.git
.gitignore
.gitattributes

# Docker files
Dockerfile
.dockerignore
docker-compose.yaml

# Editor and system files
.vscode
.idea
.DS_Store
*.swp
*.swo
```

## 🚀 How to Use

```sh
docker build -t your-docker-username/blog-app-gitop:v1 .
docker login
docker push your-docker-username/blog-app-gitop:v1
```

## Step 1: Setup Docker Environment in Minikube
**I am assuming that:**
- minikube is already installed on your pc
- kubectl already installed
- minikube addons enable ingress
- minikube addons enable metrics-server

```sh
eval $(minikube docker-env)
```
The above is only necessary if you want to build your docker image within minikube context so as to use it locally without having to pull from an image registry like dockerhub

## Step 2: Create Kubernetes Secrets for Sensitive Environment Variables

To prevent exposing credentials in the image or config maps, use Kubernetes Secrets.

Create a secret for Firebase environment variables:
`kubectl create secret generic blog-app-secrets --from-file .env`

### To Verify the Secret

```sh
kubectl get secrets
kubectl describe secret blog-app-secrets
```

## Step 3: Helm Chart Deployment (Local)
 1. Initialize Helm chart:
```bash
mkdir -p blog-app-gitops-deployment/kubernetes/helm/blog-app/templates
cd gitops-deployment/kubernetes/helm/blog-app
```
 2. Create Chart.yaml
```yaml
apiVersion: v2
name: blog-app
description: A React Vite blog application with Firebase backend
version: 0.1.0
appVersion: "1.0.0"
```
3. Create values.yaml:
```yaml
replicaCount: 1
image:
  repository: your-docker-username/blog-app
  pullPolicy: IfNotPresent
  tag: "latest"
service:
  type: NodePort
  port: 80
env:
  configMap:
    NODE_ENV: "development"
  secrets:
    existingSecret: "blog-app-secrets"
```
4. Create templates/deployment.yaml:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "blog-app.fullname" . }}
  labels:
    {{- include "blog-app.labels" . | nindent 4 }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      {{- include "blog-app.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      labels:
        {{- include "blog-app.selectorLabels" . | nindent 8 }}
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - name: http
              containerPort: 80
              protocol: TCP
          envFrom:
            - configMapRef:
                name: {{ include "blog-app.fullname" . }}-config
            - secretRef:
                name: {{ .Values.env.secrets.existingSecret }}
```
5. Create templates/configmap.yaml:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ include "blog-app.fullname" . }}-config
data:
  {{- range $key, $value := .Values.env.configMap }}
  {{ $key }}: {{ $value | quote }}
  {{- end }}
```
6. Create templates/_helpers.tpl:
```yaml
{{- define "blog-app.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "blog-app.labels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "blog-app.selectorLabels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}
```
7. Deploy to Minikube:
`helm install blog-app-local ./blog-app-gitops-deployment/kubernetes/helm/blog-app`

You can see the pods by running:
`kubectl get pods` 

## Step 4: Kustomize Deployment (Local)
1. Create base files in kubernetes/kustomize/base/:
Inside the base folder create:
- deployment.yaml:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: blog-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: blog-app
  template:
    metadata:
      labels:
        app: blog-app
    spec:
      containers:
      - name: blog-app
        image: your-docker-username/blog-app:latest
        ports:
        - containerPort: 80
        envFrom:
        - configMapRef:
            name: blog-app-config
        - secretRef:
            name: blog-app-secrets
```

2. Create service.yaml:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: blog-app
spec:
  type: NodePort
  ports:
  - port: 80
    targetPort: 80
  selector:
    app: blog-app
```
3. Create configmap.yaml:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: blog-app-config
data:
  NODE_ENV: "development"
```
4. Create kustomization.yaml
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
- deployment.yaml
- service.yaml
- configmap.yaml
```