# syntax=docker/dockerfile:1
FROM node:22-alpine

WORKDIR /app

# 의존성 먼저 설치 (레이어 캐시 활용)
COPY package*.json ./
RUN npm install --omit=dev

COPY src ./src

ENV NODE_ENV=production

# 비루트 사용자로 실행
USER node

# 시작 시 슬래시 명령을 먼저 등록한 뒤 봇을 실행
CMD ["sh", "-c", "node src/deploy-commands.js && node src/index.js"]
