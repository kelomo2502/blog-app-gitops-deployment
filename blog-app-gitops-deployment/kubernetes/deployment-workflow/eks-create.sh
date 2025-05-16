#!/bin/bash
eksctl create cluster --name blog-app-cluster --nodegroup-name standard-workers --node-type t3.small --nodes 1 --nodes-min 1 --nodes-max 1 --region us-east-1 --managed --spot
aws eks --region us-east-1 update-kubeconfig --name blog-app-cluster
kubectl create namespace prod
kubectl create secret generic blog-app-secrets-prod --from-env-file=.env -n prod
helm install blog-app-prod ./kubernetes/helm/blog-app   -f ./kubernetes/helm/blog-app/values.prod.yaml   -n prod