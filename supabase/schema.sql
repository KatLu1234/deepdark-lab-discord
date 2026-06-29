-- Supabase SQL Editor 에서 실행하세요.

-- 유저: 디스코드 아이디를 기본키로, 코드네임(username)을 저장
create table if not exists public.users (
  discord_id text        primary key,   -- 디스코드 유저 ID
  username   text        not null,       -- 코드네임
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 봇은 service_role 키로 접근하므로 RLS를 우회합니다.
-- 추후 클라이언트(앱/웹)에서 직접 접근한다면 RLS를 켜고 정책을 추가하세요.
-- alter table public.users enable row level security;
