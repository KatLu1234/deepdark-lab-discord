import { Client, Collection, GatewayIntentBits, Events, MessageFlags } from 'discord.js';
import express from 'express';
import { readdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { config } from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

client.commands = new Collection();
// 모달 customId -> 핸들러(handleModal). 모달 제출 인터랙션 라우팅에 사용.
client.modalHandlers = new Collection();

// commands 폴더에서 슬래시 명령을 동적으로 로드
async function loadCommands() {
  const commandsPath = join(__dirname, 'commands');
  const files = (await readdir(commandsPath)).filter((f) => f.endsWith('.js'));
  for (const file of files) {
    const mod = await import(pathToFileURL(join(commandsPath, file)).href);
    if (mod.data && mod.execute) {
      client.commands.set(mod.data.name, mod);
    } else {
      console.warn(`[WARN] ${file} 에 data 또는 execute 가 없습니다.`);
    }
    // 모달을 사용하는 명령은 modalId + handleModal 을 함께 등록
    if (mod.modalId && mod.handleModal) {
      client.modalHandlers.set(mod.modalId, mod.handleModal);
    }
  }
  console.log(
    `Loaded ${client.commands.size} command(s), ${client.modalHandlers.size} modal handler(s).`
  );
}

client.once(Events.ClientReady, (c) => {
  console.log(`✅ Logged in as ${c.user.tag}`);
});

async function safeErrorReply(interaction) {
  const reply = { content: '명령 처리 중 오류가 발생했습니다.', flags: MessageFlags.Ephemeral };
  if (interaction.replied || interaction.deferred) {
    await interaction.followUp(reply).catch(() => {});
  } else {
    await interaction.reply(reply).catch(() => {});
  }
}

client.on(Events.InteractionCreate, async (interaction) => {
  // 모달 제출 처리
  if (interaction.isModalSubmit()) {
    const handler = client.modalHandlers.get(interaction.customId);
    if (!handler) return;
    try {
      await handler(interaction);
    } catch (err) {
      console.error(`Error in modal ${interaction.customId}:`, err);
      await safeErrorReply(interaction);
    }
    return;
  }

  // 슬래시 명령 처리
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`Error in /${interaction.commandName}:`, err);
    await safeErrorReply(interaction);
  }
});

// 헬스체크 / 웹훅용 HTTP 서버 (Nginx가 프록시)
function startHttpServer() {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      bot: client.isReady() ? client.user.tag : 'connecting',
      uptime: process.uptime(),
    });
  });

  // 공통 에러 핸들러
  app.use((err, _req, res, _next) => {
    console.error('[API error]', err);
    res.status(500).json({ error: err.message ?? 'internal server error' });
  });

  app.listen(config.app.port, () => {
    console.log(`🌐 HTTP server listening on :${config.app.port}`);
  });
}

async function main() {
  await loadCommands();
  startHttpServer();
  await client.login(config.discord.token);
}

main().catch((err) => {
  console.error('Fatal error during startup:', err);
  process.exit(1);
});
