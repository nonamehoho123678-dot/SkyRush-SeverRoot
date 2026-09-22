const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
function getJailConfig(config, guildId) {
  if (!config.jail) config.jail = {};
  if (!config.jail[guildId]) config.jail[guildId] = { roleId: null, channelId: null, requiredEscapes: 3, prisoners: {} };
  return config.jail[guildId];
}
async function setup(guild, role, channel) {
  const channels = guild.channels.cache.filter(c => c.isTextBased() && !c.isThread());
  for (const c of channels.values()) if (c.manageable) await c.permissionOverwrites.edit(role, c.id === channel.id ? { ViewChannel: true, SendMessages: true, ReadMessageHistory: true } : { ViewChannel: false, SendMessages: false }, { reason: "SkyRush-SeverRoot Nhà tù" });
}
module.exports = {
  data: new SlashCommandBuilder().setName("nhatu").setDescription("Cấu hình nhà tù").setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(s => s.setName("setup").setDescription("Thiết lập nhà tù").addChannelOption(o => o.setName("kenh").setDescription("Kênh nhà tù").addChannelTypes(ChannelType.GuildText).setRequired(true)).addRoleOption(o => o.setName("role").setDescription("Role tù nhân; bỏ trống để tự tạo").setRequired(false)).addIntegerOption(o => o.setName("so_lan").setDescription("Số lần !laudon mặc định").setMinValue(1).setMaxValue(100).setRequired(false)))
    .addSubcommand(s => s.setName("info").setDescription("Xem cấu hình nhà tù")),
  async execute(interaction, { config, saveConfig }) {
    const jail = getJailConfig(config, interaction.guild.id); const sub = interaction.options.getSubcommand();
    if (sub === "info") { const role = jail.roleId ? interaction.guild.roles.cache.get(jail.roleId) : null; const channel = jail.channelId ? interaction.guild.channels.cache.get(jail.channelId) : null; return interaction.reply({ content: "⛓️ **Cấu hình Nhà tù**\n🎭 Role: " + (role || "Chưa chọn") + "\n🔒 Kênh: " + (channel || "Chưa chọn") + "\n⛏️ Số lần !laudon mặc định: **" + (jail.requiredEscapes || 3) + "**", ephemeral: true }); }
    const roleOption = interaction.options.getRole("role"); const channel = interaction.options.getChannel("kenh"); const required = interaction.options.getInteger("so_lan") || 3;
    let role = roleOption; if (!role) role = await interaction.guild.roles.create({ name: "⛓️ Tù nhân", permissions: [], reason: "SkyRush-SeverRoot Nhà tù" });
    if (!role.editable) return interaction.reply({ content: "❌ Bot không thể quản lý role này. Hãy kéo role bot lên cao hơn role nhà tù.", ephemeral: true });
    jail.roleId = role.id; jail.channelId = channel.id; jail.requiredEscapes = required; jail.prisoners ||= {}; await setup(interaction.guild, role, channel); saveConfig(config);
    return interaction.reply({ content: "✅ **Đã thiết lập Nhà tù!**\n🎭 Role: " + role + "\n🔒 Kênh: " + channel + "\n⛏️ Số lần !laudon mặc định: **" + required + "**\n" + (!roleOption ? "🆕 Đã tạo role `⛓️ Tù nhân`.\n" : "") + "Dùng `/nhatu info` để xem lại.", ephemeral: true });
  }
};