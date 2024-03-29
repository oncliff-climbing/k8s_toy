#!/bin/bash

# 클러스터 Role 관한 내용
kubectl apply -f prometheus-cluster-role.yaml
sleep 5
kubectl apply -f prometheus-config-map.yaml
sleep 5
# 프로메테우스 서버
kubectl apply -f prometheus-deployment.yaml
sleep 10
# 노드의 정보 "node-exporter" 관련 에이전트
kubectl apply -f prometheus-node-exporter.yaml
sleep 10
# node-exporter와 prometheus 연결
kubectl apply -f allow-prometheus-to-node-exporter.yaml
sleep 10
# 서버의 접속할 수 있는 엔드포인트 (서비스)
kubectl apply -f prometheus-svc.yaml
sleep 10
#"monitoring" 네임스페이스 확인
kubectl get pod -n monitoring -o wide

# kube-state : 쿠버네티스의 자원 사용량에 대한 에이전트
kubectl apply -f kube-state-cluster-role.yaml
sleep 5
kubectl apply -f kube-state-deployment.yaml
sleep 5
kubectl apply -f kube-state-svcaccount.yaml
sleep 5
kubectl apply -f kube-state-svc.yaml
sleep 5
kubectl get pod -n kube-system
