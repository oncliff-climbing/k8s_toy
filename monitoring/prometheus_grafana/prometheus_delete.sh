#!/bin/bash

# 클러스터 Role 관한 내용
kubectl delete -f prometheus-cluster-role.yaml
sleep 5
kubectl delete -f prometheus-config-map.yaml
sleep 5
# 프로메테우스 서버
kubectl delete -f prometheus-deployment.yaml
sleep 5
# 노드의 정보 "node-exporter" 관련 에이전트
kubectl delete -f prometheus-node-exporter.yaml
sleep 5
# 서버의 접속할 수 있는 엔드포인트 (서비스)
kubectl delete -f prometheus-svc.yaml
sleep 5
#"monitoring" 네임스페이스 확인
kubectl get ns -n monitoring -o wide
# kube-state : 쿠버네티스의 자원 사용량에 대한 에이전트
kubectl delete -f kube-state-cluster-role.yaml
sleep 5
kubectl delete -f kube-state-deployment.yaml
sleep 5
kubectl delete -f kube-state-svcaccount.yaml
sleep 5
kubectl delete -f kube-state-svc.yaml
sleep 5
kubectl get pod -n kube-system -o wide
