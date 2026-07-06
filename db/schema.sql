-- PostgreSQL 스키마.
-- 봇은 시작 시 initDb() 로 이 테이블을 자동 생성하지만,
-- 수동으로 만들려면 psql 로 실행하세요:
--   psql "postgres://user:pass@host:5432/dbname" -f db/schema.sql

create table if not exists users (
  discord_id text        primary key,   -- 디스코드 유저 ID
  username   text        not null,       -- 코드네임
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
