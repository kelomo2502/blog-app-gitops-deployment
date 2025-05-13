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
  CMD wget --no-verbose --spider http://localhost || exit 1

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
docker build -t vite-blog-app:1.0 .
docker tag vite-blog-app:1.0 myusername/vite-blog-app:1.0
docker push myusername/vite-blog-app:1.0
```

## Setup Docker Environment in Minikube

```sh
eval $(minikube docker-env)
```

## Create Kubernetes Secrets for Sensitive Environment Variables

To prevent exposing credentials in the image or config maps, use Kubernetes Secrets.

Create a secret for Firebase environment variables:

```sh
kubectl create secret generic firebase-secrets \
  --from-literal=VITE_API_KEY="xxxxxxxxxxxxxx" \
  --from-literal=VITE_AUTH_DOMAIN="xxxxxxxxxxxxxxxxxx" \
  --from-literal=VITE_PROJECT_ID="xxxxxxxxxxxxxxxxxxx" \
  --from-literal=VITE_STORAGE_BUCKET="xxxxxxxxxxxxxxxxxx" \
  --from-literal=VITE_MESSAGING_SENDER_ID="xxxxxxxxxxxxxx" \
  --from-literal=VITE_APP_ID="xxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### To Verify the Secret

```sh
kubectl get secrets
kubectl describe secret firebase-secrets
```

## Create Kubernetes Deployment & Service

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: react-blog-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: react-blog-app
  template:
    metadata:
      labels:
        app: react-blog-app
    spec:
      containers:
        - name: react-blog-app
          image: kelomo2502/vite-blog-app:v1
          ports:
            - containerPort: 80
          env:
            - name: VITE_API_KEY
              valueFrom:
                secretKeyRef:
                  name: firebase-secrets
                  key: VITE_API_KEY
            - name: VITE_AUTH_DOMAIN
              valueFrom:
                secretKeyRef:
                  name: firebase-secrets
                  key: VITE_AUTH_DOMAIN
            - name: VITE_PROJECT_ID
              valueFrom:
                secretKeyRef:
                  name: firebase-secrets
                  key: VITE_PROJECT_ID
            - name: VITE_STORAGE_BUCKET
              valueFrom:
                secretKeyRef:
                  name: firebase-secrets
                  key: VITE_STORAGE_BUCKET
            - name: VITE_MESSAGING_SENDER_ID
              valueFrom:
                secretKeyRef:
                  name: firebase-secrets
                  key: VITE_MESSAGING_SENDER_ID
            - name: VITE_APP_ID
              valueFrom:
                secretKeyRef:
                  name: firebase-secrets
                  key: VITE_APP_ID
```

### Apply Deployment

```sh
kubectl apply -f deployment.yaml
```

### Check Deployments and Service

```sh
kubectl get deployments
kubectl get services
```

## Access the App via Ngrok Tunnel

1. **Verify Minikube's IP is Correct**

   ```sh
   minikube ip
   ```

   It should return `192.168.49.2` (the IP you're forwarding via Ngrok). If it's different, update the Ngrok tunnel.

2. **Ensure Minikube Can Access the NodePort**

   ```sh
   curl http://192.168.49.2:32435
   ```

   If it returns your app’s HTML, Minikube is working fine.

3. **Make Sure Ngrok is Properly Forwarding Requests**

   ```sh
   ngrok http 192.168.49.2:32435
   ```

4. **Access the URL generated from the Ngrok forwarding**

## Applying Best Practice: Using Ingress Service

### Create `service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: vite-blog-service
spec:
  type: ClusterIP # Change from NodePort to ClusterIP
  selector:
    app: vite-blog-app
  ports:
    - protocol: TCP
      port: 80 # Internal service port
      targetPort: 80 # Container's port
```

### Option 1: Use Ingress Without a Domain (Access via IP)

Create `ingress.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: vite-blog-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
    - host: blog-app.com # This can be anything, even a fake domain
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: vite-blog-service
                port:
                  number: 80
```

### Deploy Ingress Controller

```sh
minikube addons enable ingress
kubectl get pods -n kube-system | grep ingress
kubectl apply -f ingress.yaml
```

### Test Setup

```sh
minikube ip
```

Edit `/etc/hosts`:

```sh
sudo nano /etc/hosts
```

Add:

192.168.49.2 blog-app.com

Now, access your app at:

[http://blog-app.com](http://blog-app.com)

## Deploying via helm

- Run ```bash
- helm create vite-blog-app
cd vite-blog-app

```

## Edit the Values.yaml file
```yaml
## Updated values.yaml

replicaCount: 4

image:
  repository: kelomo2502/vite-blog-app
  pullPolicy: IfNotPresent
  tag: "v3"

imagePullSecrets: []
nameOverride: ""
fullnameOverride: ""

serviceAccount:
  create: true
  automount: true
  annotations: {}
  name: ""

podAnnotations: {}
podLabels: {}

podSecurityContext: {}
securityContext: {}

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: false
  className: ""
  annotations: {}
  hosts:
    - host: blog-app.com
      paths:
        - path: /
          pathType: ImplementationSpecific
  tls: []

resources: {}

livenessProbe:
  httpGet:
    path: /
    port: http
readinessProbe:
  httpGet:
    path: /
    port: http

autoscaling:
  enabled: false
  minReplicas: 1
  maxReplicas: 100
  targetCPUUtilizationPercentage: 80

volumes: []
volumeMounts: []

nodeSelector: {}
tolerations: []
affinity: {}

env:
  - name: VITE_API_KEY
    valueFrom:
      secretKeyRef:
        name: firebase-secrets
        key: VITE_API_KEY
  - name: VITE_AUTH_DOMAIN
    valueFrom:
      secretKeyRef:
        name: firebase-secrets
        key: VITE_AUTH_DOMAIN
  - name: VITE_PROJECT_ID
    valueFrom:
      secretKeyRef:
        name: firebase-secrets
        key: VITE_PROJECT_ID
  - name: VITE_STORAGE_BUCKET
    valueFrom:
      secretKeyRef:
        name: firebase-secrets
        key: VITE_STORAGE_BUCKET
  - name: VITE_MESSAGING_SENDER_ID
    valueFrom:
      secretKeyRef:
        name: firebase-secrets
        key: VITE_MESSAGING_SENDER_ID
  - name: VITE_APP_ID
    valueFrom:
      secretKeyRef:
        name: firebase-secrets
        key: VITE_APP_ID

```

## Modify the deployments.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "vite-blog-app.fullname" . }}
  labels:
    {{- include "vite-blog-app.labels" . | nindent 4 }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "vite-blog-app.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      {{- with .Values.podAnnotations }}
      annotations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      labels:
        {{- include "vite-blog-app.labels" . | nindent 8 }}
        {{- with .Values.podLabels }}
        {{- toYaml . | nindent 8 }}
        {{- end }}
    spec:
      {{- with .Values.imagePullSecrets }}
      imagePullSecrets:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      serviceAccountName: {{ include "vite-blog-app.serviceAccountName" . }}
      {{- with .Values.podSecurityContext }}
      securityContext:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      containers:
        - name: {{ .Chart.Name }}
          {{- with .Values.securityContext }}
          securityContext:
            {{- toYaml . | nindent 12 }}
          {{- end }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - name: http
              containerPort: {{ .Values.service.port }}
              protocol: TCP
          env:
            - name: REACT_APP_API_BASE_URL
              value: "{{ .Values.env.apiBaseUrl }}"
          {{- with .Values.livenessProbe }}
          livenessProbe:
            {{- toYaml . | nindent 12 }}
          {{- end }}
          {{- with .Values.readinessProbe }}
          readinessProbe:
            {{- toYaml . | nindent 12 }}
          {{- end }}
          {{- with .Values.resources }}
          resources:
            {{- toYaml . | nindent 12 }}
          {{- end }}
          {{- with .Values.volumeMounts }}
          volumeMounts:
            {{- toYaml . | nindent 12 }}
          {{- end }}
      {{- with .Values.volumes }}
      volumes:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.nodeSelector }}
      nodeSelector:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.affinity }}
      affinity:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.tolerations }}
      tolerations:
        {{- toYaml . | nindent 8 }}
      {{- end }}

```

## Lint the Helm Chart

`helm lint <chart-directory>`

## Deploy the chart by running

`helm install vite-blog-app ./vite-blog-app`
👉 Purpose: This command installs a Helm chart named vite-blog-app from the ./vite-blog-app directory for the first time.
👉 Function:

Deploys the application using the values from values.yaml and the templates in the vite-blog-app chart.

If the release vite-blog-app already exists, it fails unless you add the --replace flag.

Equivalent to kubectl apply -f for Kubernetes manifests.

## To upgrade the chart, run

`helm upgrade --install vite-blog-app ./vite-blog-app`

👉 Purpose: This command is more flexible and is used to either install or upgrade the Helm release.
👉 Function:

If vite-blog-app is not already installed, it installs it just like helm install.

If vite-blog-app already exists, it updates the deployment with any changes in the Helm chart.

This is useful when making changes to values.yaml or template files, ensuring the app is always running the latest configuration.

✅ Best Practice: Use helm upgrade --install instead of helm install, since it works for both new and existing deployments! 🚀
