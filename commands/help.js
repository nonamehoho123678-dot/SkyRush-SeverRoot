const { SlashCommandBuilder } = require("discord.js");

function getHelpText() {
  return [
    "⚡ **SkyRush-SeverRoot — Trợ giúp**",
    "",
    "**🛡️ Quản trị**",
    "`!ban @user [lý do]`",
    "`!kick @user [lý do]`",
    "`!hanche @user [10s/5m/2h/1d] [lý do]`",
    "`!bohanche @user`",
    "`/xoa [so_luong]`",
    "`/themrole @user @role`",
    "`/xoarole @user @role`",
    "",
    "**⛓️ Nhà tù**",
    "`!nhatu role @role #kenh 3` → chọn role, kênh và số lần cần !laudon.",
    "`!nhatu tao #kenh 3` → bot tự tạo role nhà tù.",
    "`!nhatu info` → xem cấu hình.",
    "`!phattu @user [số lần lao động] [lý do]` → tống thành viên vào nhà tù.",
    "`!laudon` → lao động để giảm án.",
    "",
    "**🎭 Auto Role**",
    "`/autorole` → mở bảng điều khiển Auto Role.",
    "",
    "ℹ️ Lệnh quản trị yêu cầu quyền phù hợp."
  ].join("\n");
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Hiển thị hướng dẫn sử dụng bot"),

  async execute(interaction) {
    await interaction.reply({
      content: getHelpText(),
      ephemeral: true
    });
  }
};
