#!/bin/bash
eksctl delete cluster --name blog-app-cluster --region us-east-1
aws cloudformation delete-stack --stack-name eksctl-blog-app-cluster-cluster --region us-east-1
aws cloudformation describe-stacks --stack-name eksctl-blog-app-cluster-cluster
