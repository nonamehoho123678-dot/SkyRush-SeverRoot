require("dotenv").config();
const { REST, Routes } = require("discord.js");

const commands = [
  require("./commands/xoa").data,
  require("./commands/themrole").data,
  require("./commands/xoarole").data,
  require("./commands/autorole").data
];

if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
  console.error("❌ Thiếu DISCORD_TOKEN hoặc CLIENT_ID trong file .env");
  process.exit(1);
}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    const route = process.env.GUILD_ID
      ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
      : Routes.applicationCommands(process.env.CLIENT_ID);

    await rest.put(route, { body: commands.map(command => command.toJSON()) });
    console.log("✅ Slash commands deployed.");
  } catch (error) {
    console.error("❌ Deploy commands thất bại:", error);
  }
})();
