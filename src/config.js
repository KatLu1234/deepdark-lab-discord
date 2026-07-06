import 'dotenv/config';

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  discord: {
    token: required('DISCORD_TOKEN'),
    clientId: required('DISCORD_CLIENT_ID'),
    guildId: process.env.DISCORD_GUILD_ID || null,
  },
  db: {
    // DATABASE_URL 이 있으면 우선 사용 (예: postgres://user:pass@host:5432/dbname)
    url: process.env.DATABASE_URL || null,
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT) || 5432,
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    database: process.env.PGDATABASE || 'postgres',
    // 자체 서명 인증서 등으로 SSL 필요 시 PGSSL=true
    ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
  },
  app: {
    port: Number(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
};
