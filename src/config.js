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
    // 로컬 SQLite 파일 경로. 기본값은 ./data/study-bot.db (도커에서는 볼륨 마운트).
    path: process.env.DB_PATH || './data/study-bot.db',
  },
  app: {
    port: Number(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
};
