#!/bin/bash
helm upgrade --install blog-app-dev ./helm \
  -f ./blog-app-helm/values-dev.yaml \
  --namespace dev \
  --create-namespace \
  --atomic \
  --timeout 5m