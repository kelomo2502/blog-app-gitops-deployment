#!/bin/bash
helm upgrade --install blog-app-staging ./helm \
  -f ./blog-app-helm/values-staging.yaml \
  --namespace staging \
  --create-namespace \
  --atomic \
  --timeout 5m