const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("themrole")
    .setDescription("Thêm role cho thành viên")
    .addUserOption(option =>
      option.setName("user").setDescription("Thành viên").setRequired(true)
    )
    .addRoleOption(option =>
      option.setName("role").setDescription("Role").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const role = interaction.options.getRole("role");
    const member = await interaction.guild.members.fetch(user.id);

    if (!role.editable || !member.manageable) {
      return interaction.reply({
        content: "❌ Bot không thể quản lý role hoặc thành viên này.",
        ephemeral: true
      });
    }

    if (member.roles.cache.has(role.id)) {
      return interaction.reply({
        content: "ℹ️ Thành viên đã có role này.",
        ephemeral: true
      });
    }

    await member.roles.add(role, "SkyRush-SeverRoot");
    await interaction.reply("✅ Đã thêm role cho <@" + user.id + ">.");
  }
};