const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("xoa")
    .setDescription("Xóa tin nhắn")
    .addIntegerOption(option =>
      option.setName("so_luong")
        .setDescription("Số tin nhắn cần xóa (1-100)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const amount = interaction.options.getInteger("so_luong");
    const deleted = await interaction.channel.bulkDelete(amount, true);

    await interaction.reply({
      content: "🧹 Đã xóa " + deleted.size + " tin nhắn.",
      ephemeral: true
    });
  }
};
