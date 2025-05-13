#!/bin/bash
# Using AWS Secrets Manager for production secrets
helm secrets upgrade --install blog-app-prod ./helm \
  -f ./blog-app-helm/values-prod.yaml \
  -f <(aws secretsmanager get-secret-value --secret-id blog-app/prod-secrets | jq -r '.SecretString' | yq eval -P) \
  --namespace prod \
  --create-namespace \
  --atomic \
  --timeout 10m