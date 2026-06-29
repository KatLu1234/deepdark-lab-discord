import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { config } from '../config.js';

// DB 파일이 들어갈 디렉터리를 보장 (예: ./data)
mkdirSync(dirname(config.db.path), { recursive: true });

export const db = new Database(config.db.path);
db.pragma('journal_mode = WAL');

// 스키마 초기화 (없으면 생성). discord_id 를 기본키로 사용.
db.exec(`
  create table if not exists users (
    discord_id text primary key,
    username   text not null,
    created_at text not null default (datetime('now')),
    updated_at text not null default (datetime('now'))
  );
`);

const selectUserStmt = db.prepare(
  'select username from users where discord_id = ?'
);

const upsertUserStmt = db.prepare(`
  insert into users (discord_id, username, updated_at)
  values (@discord_id, @username, datetime('now'))
  on conflict(discord_id) do update set
    username   = excluded.username,
    updated_at = datetime('now')
`);

// discord_id 로 유저 조회. 없으면 null.
export function getUser(discordId) {
  return selectUserStmt.get(discordId) ?? null;
}

// 코드네임 등록/갱신.
export function upsertUser(discordId, username) {
  upsertUserStmt.run({ discord_id: discordId, username });
}
