const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  ChannelType
} = require("discord.js");

function getData(config, guildId) {
  config.counter ??= {};
  config.counter[guildId] ??= {
    enabled: false,
    channelId: null
  };
  return config.counter[guildId];
}

function getPanel(guild, data) {
  const channel = data?.channelId ? guild.channels.cache.get(data.channelId) : null;
  const members = guild.memberCount;

  return new EmbedBuilder()
    .setTitle("📊 SkyRush-SeverRoot | Member Counter")
    .setDescription("Quản lý bộ đếm thành viên bằng các nút bên dưới.")
    .addFields(
      {
        name: "Trạng thái",
        value: data?.enabled ? "🟢 Đang bật" : "🔴 Đang tắt",
        inline: true
      },
      {
        name: "Kênh bộ đếm",
        value: channel ? channel.toString() : "Chưa tạo",
        inline: true
      },
      {
        name: "Thành viên hiện tại",
        value: "👥 **" + members + "**",
        inline: true
      }
    )
    .setFooter({ text: "SkyRush-SeverRoot • Member Counter" })
    .setTimestamp();
}

function getButtons() {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("counter_setup")
        .setLabel("Tạo bộ đếm")
        .setEmoji("📊")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("counter_on")
        .setLabel("Bật")
        .setEmoji("🟢")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("counter_off")
        .setLabel("Tắt")
        .setEmoji("🔴")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("counter_refresh")
        .setLabel("Cập nhật")
        .setEmoji("🔄")
        .setStyle(ButtonStyle.Secondary)
    )
  ];
}

async function updateCounter(guild, config) {
  const data = config.counter?.[guild.id];
  if (!data?.enabled || !data.channelId) return;

  const channel = guild.channels.cache.get(data.channelId);
  if (!channel) return;

  try {
    await channel.setName("👥 Members: " + guild.memberCount, "SkyRush-SeverRoot Member Counter");
  } catch (error) {
    console.error("Counter update error:", error);
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("counter")
    .setDescription("Mở panel bộ đếm member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction, { config }) {
    const data = getData(config, interaction.guild.id);

    await interaction.reply({
      embeds: [getPanel(interaction.guild, data)],
      components: getButtons()
    });
  },

  async handleComponent(interaction, { config, saveConfig }) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({
        content: "❌ Bạn cần quyền **Manage Channels**.",
        ephemeral: true
      });
    }

    const data = getData(config, interaction.guild.id);

    if (interaction.customId === "counter_setup") {
      let channel = data.channelId
        ? interaction.guild.channels.cache.get(data.channelId)
        : null;

      if (!channel) {
        channel = await interaction.guild.channels.create({
          name: "👥 Members: " + interaction.guild.memberCount,
          type: ChannelType.GuildVoice,
          permissionOverwrites: [
            {
              id: interaction.guild.roles.everyone.id,
              deny: ["Connect"]
            }
          ],
          reason: "SkyRush-SeverRoot Member Counter"
        });

        data.channelId = channel.id;
      }

      data.enabled = true;
      saveConfig(config);
      await updateCounter(interaction.guild, config);

      return interaction.update({
        embeds: [getPanel(interaction.guild, data)],
        components: getButtons()
      });
    }

    if (interaction.customId === "counter_on") {
      if (!data.channelId) {
        return interaction.reply({
          content: "❌ Hãy bấm **Tạo bộ đếm** trước.",
          ephemeral: true
        });
      }

      data.enabled = true;
      saveConfig(config);
      await updateCounter(interaction.guild, config);

      return interaction.update({
        embeds: [getPanel(interaction.guild, data)],
        components: getButtons()
      });
    }

    if (interaction.customId === "counter_off") {
      data.enabled = false;
      saveConfig(config);

      return interaction.update({
        embeds: [getPanel(interaction.guild, data)],
        components: getButtons()
      });
    }

    if (interaction.customId === "counter_refresh") {
      if (!data.channelId) {
        return interaction.reply({
          content: "❌ Chưa có bộ đếm. Hãy bấm **Tạo bộ đếm**.",
          ephemeral: true
        });
      }

      await updateCounter(interaction.guild, config);

      return interaction.update({
        embeds: [getPanel(interaction.guild, data)],
        components: getButtons()
      });
    }
  },

  updateCounter
};
