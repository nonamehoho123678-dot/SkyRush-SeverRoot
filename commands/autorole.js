const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  RoleSelectMenuBuilder,
  PermissionFlagsBits
} = require("discord.js");

function getPanel(guild, data) {
  const role = data?.roleId ? guild.roles.cache.get(data.roleId) : null;

  return new EmbedBuilder()
    .setTitle("⚙️ SkyRush-SeverRoot | Auto Role")
    .setDescription("Quản lý Auto Role bằng các nút bên dưới.")
    .addFields(
      {
        name: "Trạng thái",
        value: data?.enabled ? "🟢 Đang bật" : "🔴 Đang tắt",
        inline: true
      },
      {
        name: "Role",
        value: role ? role.toString() : "Chưa cài đặt",
        inline: true
      }
    )
    .setFooter({ text: "SkyRush-SeverRoot" })
    .setTimestamp();
}

function getButtons() {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("autorole_select")
        .setLabel("Chọn Role")
        .setEmoji("🎭")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("autorole_on")
        .setLabel("Bật")
        .setEmoji("🟢")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("autorole_off")
        .setLabel("Tắt")
        .setEmoji("🔴")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("autorole_info")
        .setLabel("Thông tin")
        .setEmoji("ℹ️")
        .setStyle(ButtonStyle.Secondary)
    )
  ];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("autorole")
    .setDescription("Mở panel Auto Role")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction, { config }) {
    const data = config.autorole[interaction.guild.id] || {
      enabled: false,
      roleId: null
    };

    await interaction.reply({
      embeds: [getPanel(interaction.guild, data)],
      components: getButtons()
    });
  },

  async handleComponent(interaction, { config, saveConfig }) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({
        content: "❌ Bạn cần quyền Manage Roles.",
        ephemeral: true
      });
    }

    const guildId = interaction.guild.id;
    config.autorole[guildId] ??= { enabled: false, roleId: null };
    const data = config.autorole[guildId];

    if (interaction.customId === "autorole_select") {
      const menu = new RoleSelectMenuBuilder()
        .setCustomId("autorole_role")
        .setPlaceholder("Chọn role Auto Role")
        .setMinValues(1)
        .setMaxValues(1);

      return interaction.update({
        content: "🎭 Chọn role Auto Role:",
        embeds: [],
        components: [new ActionRowBuilder().addComponents(menu)]
      });
    }

    if (interaction.isRoleSelectMenu() && interaction.customId === "autorole_role") {
      const role = interaction.roles.first();

      if (!role) {
        return interaction.reply({ content: "❌ Không tìm thấy role.", ephemeral: true });
      }

      if (!role.editable) {
        return interaction.reply({
          content: "❌ Bot không thể quản lý role này. Hãy đặt role bot cao hơn role này.",
          ephemeral: true
        });
      }

      data.roleId = role.id;
      saveConfig(config);

      return interaction.update({
        content: "",
        embeds: [getPanel(interaction.guild, data)],
        components: getButtons()
      });
    }

    if (interaction.customId === "autorole_on") {
      if (!data.roleId) {
        return interaction.reply({ content: "❌ Hãy chọn role trước.", ephemeral: true });
      }

      const role = interaction.guild.roles.cache.get(data.roleId);

      if (!role?.editable) {
        return interaction.reply({ content: "❌ Bot không thể quản lý role này.", ephemeral: true });
      }

      data.enabled = true;
      saveConfig(config);

      return interaction.update({
        embeds: [getPanel(interaction.guild, data)],
        components: getButtons()
      });
    }

    if (interaction.customId === "autorole_off") {
      data.enabled = false;
      saveConfig(config);

      return interaction.update({
        embeds: [getPanel(interaction.guild, data)],
        components: getButtons()
      });
    }

    if (interaction.customId === "autorole_info") {
      return interaction.reply({
        embeds: [getPanel(interaction.guild, data)],
        ephemeral: true
      });
    }
  }
};
