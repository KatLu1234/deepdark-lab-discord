import { REST, Routes } from 'discord.js';
import { readdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { config } from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function collectCommands() {
  const commandsPath = join(__dirname, 'commands');
  const files = (await readdir(commandsPath)).filter((f) => f.endsWith('.js'));
  const commands = [];
  for (const file of files) {
    const mod = await import(pathToFileURL(join(commandsPath, file)).href);
    if (mod.data) commands.push(mod.data.toJSON());
  }
  return commands;
}

async function main() {
  const commands = await collectCommands();
  const rest = new REST().setToken(config.discord.token);

  if (config.discord.guildId) {
    await rest.put(
      Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId),
      { body: commands }
    );
    console.log(`✅ 길드(${config.discord.guildId})에 ${commands.length}개 명령 등록 완료.`);
  } else {
    await rest.put(
      Routes.applicationCommands(config.discord.clientId),
      { body: commands }
    );
    console.log(`✅ 글로벌로 ${commands.length}개 명령 등록 완료. (반영까지 최대 1시간)`);
  }
}

main().catch((err) => {
  console.error('명령 등록 실패:', err);
  process.exit(1);
});
