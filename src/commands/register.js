import {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  MessageFlags,
} from 'discord.js';
import { getUser, upsertUser } from '../lib/db.js';

// 이 명령이 띄우는 모달의 customId. index.js 가 이 값으로 제출을 라우팅합니다.
export const modalId = 'register-modal';

export const data = new SlashCommandBuilder()
  .setName('등록하기')
  .setDescription('코드네임을 등록합니다.');

// 슬래시 명령 실행 → 모달 표시
export async function execute(interaction) {
  // showModal 은 인터랙션 수신 후 3초 안에 호출해야 합니다(deferReply 불가).
  // 기존값이 있으면 입력란에 채워 줍니다. DB 조회 실패해도 모달은 그대로 띄웁니다.
  let existing = null;
  try {
    existing = await getUser(interaction.user.id);
  } catch (err) {
    console.warn('기존 유저 조회 실패:', err.message);
    existing = null;
  }

  const usernameInput = new TextInputBuilder()
    .setCustomId('username')
    .setLabel('코드네임')
    .setPlaceholder('예: Falcon')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(50);

  if (existing?.username) {
    usernameInput.setValue(existing.username);
  }

  const modal = new ModalBuilder()
    .setCustomId(modalId)
    .setTitle('코드네임 등록')
    .addComponents(new ActionRowBuilder().addComponents(usernameInput));

  await interaction.showModal(modal);
}

// 모달 제출 처리 → PostgreSQL upsert
export async function handleModal(interaction) {
  const username = interaction.fields.getTextInputValue('username').trim();

  if (!username) {
    return interaction.reply({
      content: '코드네임을 입력해 주세요.',
      flags: MessageFlags.Ephemeral,
    });
  }

  await upsertUser(interaction.user.id, username);

  // 서버에서 유저의 닉네임을 코드네임으로 변경
  let nickNote = '';
  if (interaction.inGuild() && interaction.member) {
    try {
      await interaction.member.setNickname(username, '코드네임 등록');
    } catch (err) {
      // 권한(닉네임 관리) 부족 또는 역할 서열 문제 등
      console.warn(`닉네임 변경 실패 (${interaction.user.id}):`, err.message);
      nickNote =
        '\n⚠️ 닉네임 변경에는 실패했습니다. (봇 권한 또는 역할 서열을 확인해 주세요)';
    }
  }

  await interaction.reply({
    content: `✅ 등록 완료! 코드네임: **${username}**${nickNote}`,
    flags: MessageFlags.Ephemeral,
  });
}
