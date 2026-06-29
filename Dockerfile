# syntax=docker/dockerfile:1
FROM node:22-alpine

WORKDIR /app

# better-sqlite3 는 네이티브 모듈이라 빌드 도구가 필요합니다.
RUN apk add --no-cache python3 make g++

# 의존성 먼저 설치 (레이어 캐시 활용)
COPY package*.json ./
RUN npm install --omit=dev

COPY src ./src

# SQLite 파일이 저장될 디렉터리 (compose 에서 볼륨 마운트). node 유저가 쓸 수 있게 권한 부여.
RUN mkdir -p /app/data && chown -R node:node /app/data

ENV NODE_ENV=production

# 비루트 사용자로 실행
USER node

# 시작 시 슬래시 명령을 먼저 등록한 뒤 봇을 실행
CMD ["sh", "-c", "node src/deploy-commands.js && node src/index.js"]
