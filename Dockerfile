# Stage 1: React 앱 빌드
FROM node:14 AS react-build
WORKDIR /app
COPY client/package.json client/package-lock.json ./client/
RUN npm --prefix ./client install
COPY client/ ./client/
RUN npm --prefix ./client run build

# Stage 2: Express 서버 설정
FROM node:14
WORKDIR /app

# Express 서버의 package.json 및 package-lock.json 복사
COPY server/package*.json ./
# 의존성 설치
RUN npm install

# React 앱의 빌드 결과물과 server 디렉토리의 나머지 파일들을 복사
COPY --from=react-build /app/client/build ./client/build
COPY server/ ./

# 포트 노출
EXPOSE 3001

# 서버 실행
CMD ["node", "server.js"]

