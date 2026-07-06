import pg from 'pg';
import { config } from '../config.js';

const { Pool } = pg;

// EC2 등에서 실행 중인 PostgreSQL 에 연결.
// DATABASE_URL 이 있으면 그것을, 없으면 PG* 개별 설정을 사용합니다.
export const pool = config.db.url
  ? new Pool({ connectionString: config.db.url, ssl: config.db.ssl })
  : new Pool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      ssl: config.db.ssl,
    });

pool.on('error', (err) => {
  console.error('[pg] idle client error:', err);
});

// 스키마 초기화 (테이블이 없으면 생성). 앱 시작 시 1회 호출.
export async function initDb() {
  await pool.query(`
    create table if not exists users (
      discord_id text        primary key,
      username   text        not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  `);
  console.log('🗄️  PostgreSQL 연결 및 스키마 확인 완료');
}

// discord_id 로 유저 조회. 없으면 null.
export async function getUser(discordId) {
  const { rows } = await pool.query(
    'select username from users where discord_id = $1',
    [discordId]
  );
  return rows[0] ?? null;
}

// 코드네임 등록/갱신.
export async function upsertUser(discordId, username) {
  await pool.query(
    `insert into users (discord_id, username, updated_at)
     values ($1, $2, now())
     on conflict (discord_id) do update set
       username   = excluded.username,
       updated_at = now()`,
    [discordId, username]
  );
}
