#!/bin/bash
kubectl create secret generic firebase-config --from-env-file=.env
