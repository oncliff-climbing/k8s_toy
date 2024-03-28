# 기본 Grafana 이미지 사용
FROM grafana/grafana:latest

# 대시보드 JSON 파일 추가
COPY dashboard.json /etc/grafana/provisioning/dashboards/my-dashboard.json

# 데이터 소스 및 대시보드 구성
COPY datasources.yaml /etc/grafana/provisioning/datasources/datasources.yaml
COPY dashboards.yaml /etc/grafana/provisioning/dashboards/dashboards.yaml

# 환경 변수 추가하여 기본 홈 대시보드 설정
ENV GF_DASHBOARDS_DEFAULT_HOME_DASHBOARD_UID=cdglnnaexineoa

# 환경 변수를 추가하여 익명 접속을 활성화 

ENV GF_AUTH_ANONYMOUS_ENABLED=true
ENV GF_AUTH_ANONYMOUS_ORG_ROLE=Admin

