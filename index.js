require("dotenv").config();
const fs = require("fs-extra");
const path = require("path");
const {
  Client,
  GatewayIntentBits,
  Collection,
  PermissionFlagsBits
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const configPath = path.join(__dirname, "config.json");

const C = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  blue: "\x1b[34m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  bold: "\x1b[1m"
};

function line(char = "═", width = 54) {
  return char.repeat(width);
}

function logTime() {
  return new Date().toLocaleTimeString("vi-VN", { hour12: false });
}

function logInfo(icon, message, color = C.cyan) {
  console.log(color + "[" + logTime() + "] " + icon + " " + message + C.reset);
}

function showStartup(c) {
  console.clear();

  console.log(C.cyan + C.bold + "╔" + line() + "╗" + C.reset);
  console.log(C.cyan + C.bold + "║" + "              ⚡ SKYRUSH-SERVEROOT ⚡              " + "║" + C.reset);
  console.log(C.cyan + C.bold + "║" + "              Discord Management Bot              " + "║" + C.reset);
  console.log(C.cyan + C.bold + "╠" + line() + "╣" + C.reset);
  console.log(C.white + "║  🤖 Bot       : " + C.bold + c.user.tag.padEnd(35) + C.reset + C.white + "║" + C.reset);
  console.log(C.white + "║  🟢 Status    : " + C.green + "ONLINE".padEnd(35) + C.reset + C.white + "║" + C.reset);
  console.log(C.white + "║  🌐 Servers   : " + String(c.guilds.cache.size).padEnd(35) + "║" + C.reset);
  console.log(C.white + "║  📡 Gateway   : " + C.green + "CONNECTED".padEnd(35) + C.reset + C.white + "║" + C.reset);
  console.log(C.cyan + "╠" + line() + "╣" + C.reset);
  console.log(C.magenta + "║  📋 COMMANDS                                         ║" + C.reset);
  console.log(C.white + "║  /help  !ban  !kick  !hanche  !bohanche              ║" + C.reset);
  console.log(C.white + "║  /nhatu  !phattu  !laudon  !thatu                    ║" + C.reset);
  console.log(C.white + "║  /xoa  /themrole  /xoarole  /autorole               ║" + C.reset);
  console.log(C.cyan + "╚" + line() + "╝" + C.reset);
  console.log("");
  logInfo("✓", "Bot đã kết nối Discord", C.green);
  logInfo("✓", "Đang hoạt động bình thường", C.green);
}

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch {
    return { autorole: {} };
  }
}

function saveConfig(data) {
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2), "utf8");
}

const config = loadConfig();

client.commands = new Collection();

for (const name of ["xoa", "themrole", "xoarole", "autorole", "help", "nhatu", "counter"]) {
  client.commands.set(name, require(path.join(__dirname, "commands", name + ".js")));
}

client.once("clientReady", async () => {
  showStartup(client);
  for (const guild of client.guilds.cache.values()) {
    try {
      await client.commands.get("counter")?.updateCounter(guild, config);
    } catch (error) {
      console.error(C.red + "Counter startup error:" + C.reset, error);
    }
  }
});

client.on("guildCreate", guild => {
  logInfo("➕", "Bot đã vào server: " + guild.name, C.green);
});

client.on("guildDelete", guild => {
  logInfo("➖", "Bot đã rời server: " + guild.name, C.yellow);
});

client.on("guildMemberAdd", async member => {
  try {
    const data = config.autorole[member.guild.id];
    if (data?.enabled && data.roleId) {
      const role = member.guild.roles.cache.get(data.roleId);
      if (!role || !role.editable) {
        logInfo("⚠", "Không thể cấp Auto Role cho " + member.user.tag, C.yellow);
      } else {
        await member.roles.add(role, "SkyRush-SeverRoot Auto Role");
        logInfo("🎭", "Auto Role → " + member.user.tag + " → " + role.name, C.green);
      }
    }

    await client.commands.get("counter")?.updateCounter(member.guild, config);
  } catch (error) {
    console.error(C.red + "Auto Role error:" + C.reset, error);
  }
});



async function setupJailRolePermissions(guild, jailRole, jailChannel) {
  const channels = guild.channels.cache.filter(channel =>
    channel.isTextBased() && !channel.isThread()
  );

  for (const channel of channels.values()) {
    if (!channel.manageable) continue;

    if (channel.id === jailChannel.id) {
      await channel.permissionOverwrites.edit(jailRole, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true
      }, { reason: "SkyRush-SeverRoot Nhà tù" });
    } else {
      await channel.permissionOverwrites.edit(jailRole, {
        ViewChannel: false,
        SendMessages: false
      }, { reason: "SkyRush-SeverRoot Nhà tù" });
    }
  }
}

function getJailConfig(guildId) {
  if (!config.jail) config.jail = {};
  if (!config.jail[guildId]) {
    config.jail[guildId] = {
      roleId: null,
      channelId: null,
      requiredEscapes: 3,
      prisoners: {}
    };
  }
  return config.jail[guildId];
}

function getHelpText() {
  return [
    "⚡ **SkyRush-SeverRoot — Trợ giúp**",
    "",
    "**🛡️ Quản trị**",
    "`!ban @user [lý do]`",
    "`!kick @user [lý do]`",
    "`!hanche @user [10s/5m/2h/1d] [lý do]`",
    "`!bohanche @user`",
    "`!xoa` là slash command: `/xoa [so_luong]`",
    "",
    "**⛓️ Nhà tù**",
    "`/nhatu setup [role] [kenh] [so_lan]` → cấu hình nhà tù.",
    "`/nhatu info` → xem cấu hình nhà tù.",
    "`!phattu @user [số lần lao động] [lý do]` → tống thành viên vào nhà tù.",
    "`!laudon` → người bị tù dùng để tăng số lần lao động.",
    "`!thatu @user` → quản trị viên thả tù ngay và khôi phục role cũ.",
    "",
    "**🎭 Auto Role**",
    "`/autorole` → mở bảng điều khiển Auto Role.",
    "",
    "ℹ️ Các lệnh quản trị cần quyền Administrator. Nhà tù cần Manage Roles + Manage Channels."
  ].join("\\n");
}

function parseDuration(input) {
  const match = /^(\d+)(s|m|h|d)$/i.exec(String(input || ""));
  if (!match) return null;

  const value = Number(match[1]);
  const multiplier = {
    s: 1000,
    m: 60000,
    h: 3600000,
    d: 86400000
  }[match[2].toLowerCase()];

  const ms = value * multiplier;
  return ms > 0 && ms <= 28 * 86400000 ? ms : null;
}

client.on("messageCreate", async message => {
  if (message.author.bot || !message.guild || !message.content.startsWith("!")) return;
  const args = message.content.trim().split(/\s+/);
  const command = args.shift().slice(1).toLowerCase();
  if (command === "laudon") {
    const jail = getJailConfig(message.guild.id); const prisoner = jail.prisoners?.[message.author.id];
    if (!prisoner) return message.reply("❌ Bạn hiện không ở trong nhà tù.");
    if (message.channel.id !== jail.channelId) return message.reply("❌ Bạn chỉ có thể dùng `!laudon` trong kênh nhà tù.");
    prisoner.workCount = Number(prisoner.workCount || 0) + 1;
    const required = Number(prisoner.requiredEscapes || jail.requiredEscapes || 3);
    const remaining = Math.max(0, required - prisoner.workCount);
    if (remaining > 0) { saveConfig(config); return message.reply("⛏️ **Lao động thành công!**\n📊 Tiến độ: **" + prisoner.workCount + "/" + required + "**\n🔓 Còn **" + remaining + "** lần nữa để được thả."); }
    try {
      const member = await message.guild.members.fetch(message.author.id); const jailRole = message.guild.roles.cache.get(jail.roleId);
      if (jailRole && member.roles.cache.has(jailRole.id)) await member.roles.remove(jailRole, "Hoàn thành án tù");
      const restoreRoles = (prisoner.roles || []).map(id => message.guild.roles.cache.get(id)).filter(role => role && role.editable && role.id !== message.guild.id);
      if (restoreRoles.length) await member.roles.add(restoreRoles, "Khôi phục role sau khi ra tù");
      delete jail.prisoners[message.author.id]; saveConfig(config);
      return message.reply("🎉 **Bạn đã được ra tù!**\n🔓 Đã hoàn thành đủ " + required + " lần lao động và role cũ đã được khôi phục.");
    } catch (error) { console.error(C.red + "Release error:" + C.reset, error); return message.reply("❌ Không thể xử lý ra tù. Hãy báo quản trị viên."); }
  }
  if (command === "thatu") {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply("❌ Bạn cần quyền Administrator để dùng lệnh này.");

    const target = message.mentions.members.first();
    if (!target) return message.reply("❌ Dùng: `!thatu @user`");

    const jail = getJailConfig(message.guild.id);
    const prisoner = jail.prisoners?.[target.id];
    if (!prisoner) return message.reply("❌ Thành viên này hiện không ở trong nhà tù.");

    const jailRole = jail.roleId ? message.guild.roles.cache.get(jail.roleId) : null;

    try {
      if (jailRole && target.roles.cache.has(jailRole.id)) {
        await target.roles.remove(jailRole, "Thả tù bởi quản trị viên");
      }

      const restoreRoles = (prisoner.roles || [])
        .map(id => message.guild.roles.cache.get(id))
        .filter(role => role && role.editable && role.id !== message.guild.id && role.id !== jailRole?.id);

      if (restoreRoles.length) {
        await target.roles.add(restoreRoles, "Khôi phục role sau khi được thả tù");
      }

      delete jail.prisoners[target.id];
      saveConfig(config);

      return message.reply(
        "🔓 **Đã thả tù " + target.user.tag + "!**\\n" +
        "🎭 Đã khôi phục các role trước khi bị tù."
      );
    } catch (error) {
      console.error(C.red + "Manual release error:" + C.reset, error);
      return message.reply("❌ Không thể thả tù. Kiểm tra quyền Manage Roles và thứ tự role của bot.");
    }
  }

  if (command === "phattu") {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply("❌ Bạn cần quyền Administrator để dùng lệnh này.");
    const target = message.mentions.members.first(); const required = Number(args[1]);
    if (!target) return message.reply("❌ Dùng: `!phattu @user [số lần lao động] [lý do]`");
    if (!Number.isInteger(required) || required < 1 || required > 100) return message.reply("❌ Số lần lao động phải từ **1 đến 100**.");
    const jail = getJailConfig(message.guild.id); const jailRole = jail.roleId ? message.guild.roles.cache.get(jail.roleId) : null; const jailChannel = jail.channelId ? message.guild.channels.cache.get(jail.channelId) : null;
    if (!jailRole || !jailChannel) return message.reply("❌ Nhà tù chưa được cấu hình. Dùng `/nhatu setup`.");
    if (!jailRole.editable || !target.manageable) return message.reply("❌ Bot không thể quản lý role hoặc thành viên này.");
    const reason = args.slice(2).join(" ") || "Không có lý do";
    const oldRoles = target.roles.cache.filter(role => role.id !== message.guild.id && role.editable && role.id !== jailRole.id).map(role => role.id);
    try {
      await target.roles.remove(oldRoles, "Tống vào nhà tù: " + reason); await target.roles.add(jailRole, "Tống vào nhà tù: " + reason);
      jail.prisoners ||= {}; jail.prisoners[target.id] = { roles: oldRoles, workCount: 0, requiredEscapes: required, jailedAt: Date.now(), reason }; saveConfig(config);
      return message.reply("⛓️ **Đã tống " + target.user.tag + " vào nhà tù!**\n🔒 Kênh: " + jailChannel + "\n⛏️ Cách ra tù: dùng `!laudon` **" + required + " lần**.\n📊 Tiến độ: **0/" + required + "**\n📝 Lý do: " + reason);
    } catch (error) { console.error(C.red + "Jail error:" + C.reset, error); return message.reply("❌ Không thể tống tù. Kiểm tra quyền Manage Roles và thứ tự role."); }
  }
  if (!["ban", "kick", "hanche", "bohanche"].includes(command)) return;
  if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply("❌ Bạn cần quyền Administrator để dùng lệnh này.");
  const target = message.mentions.members.first(); if (!target) return message.reply("❌ Hãy mention thành viên.");
  try {
    if (command === "ban") { const reason = args.slice(1).join(" ") || "Không có lý do"; if (!target.bannable) return message.reply("❌ Bot không thể ban thành viên này."); await target.ban({ reason }); return message.reply("🔨 Đã ban " + target.user.tag + ". Lý do: " + reason); }
    if (command === "kick") { const reason = args.slice(1).join(" ") || "Không có lý do"; if (!target.kickable) return message.reply("❌ Bot không thể kick thành viên này."); await target.kick(reason); return message.reply("👢 Đã kick " + target.user.tag + ". Lý do: " + reason); }
    if (command === "hanche") { const duration = parseDuration(args[1]); if (!duration) return message.reply("❌ Thời gian phải dạng 10s, 5m, 2h hoặc 1d (tối đa 28d)."); const reason = args.slice(2).join(" ") || "Không có lý do"; if (!target.moderatable) return message.reply("❌ Bot không thể hạn chế thành viên này."); await target.timeout(duration, reason); return message.reply("🔇 Đã hạn chế " + target.user.tag + " trong " + args[1] + ". Lý do: " + reason); }
    if (command === "bohanche") { if (!target.moderatable) return message.reply("❌ Bot không thể bỏ hạn chế thành viên này."); await target.timeout(null, "Bỏ hạn chế bởi SkyRush-SeverRoot"); return message.reply("🔊 Đã bỏ hạn chế " + target.user.tag + "."); }
  } catch (error) { console.error(C.red + "Command error:" + C.reset, error); return message.reply("❌ Không thể thực hiện lệnh. Kiểm tra quyền của bot và thứ tự role."); }
});
client.on("interactionCreate", async interaction => {
  if (interaction.isChatInputCommand()) {
    if (interaction.replied || interaction.deferred) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, { config, saveConfig });
      logInfo("⚡", "SLASH → /" + interaction.commandName + " | " + interaction.user.tag, C.blue);
    } catch (error) {
      console.error(C.red + "Interaction error:" + C.reset, error);
      try {
        if (interaction.deferred) {
          await interaction.editReply({ content: "❌ Có lỗi xảy ra." });
        } else if (!interaction.replied) {
          await interaction.reply({ content: "❌ Có lỗi xảy ra.", flags: 64 });
        }
      } catch (replyError) {
        console.error(C.red + "Interaction reply error:" + C.reset, replyError);
      }
    }
    return;
  }

  if (interaction.isButton() || interaction.isRoleSelectMenu() || interaction.isChannelSelectMenu()) {
    if (interaction.replied || interaction.deferred) return;
    const command = client.commands.get("autorole");
    const counter = client.commands.get("counter");
    const componentCommand = interaction.customId?.startsWith("counter_") ? counter : command;
    if (!componentCommand?.handleComponent) return;

    try {
      await componentCommand.handleComponent(interaction, { config, saveConfig });
    } catch (error) {
      console.error(C.red + "Component error:" + C.reset, error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: "❌ Có lỗi xảy ra.", ephemeral: true });
      }
    }
  }
});

if (!process.env.DISCORD_TOKEN) {
  console.error(C.red + "❌ Thiếu DISCORD_TOKEN trong file .env" + C.reset);
  process.exit(1);
}

process.on("unhandledRejection", error => {
  console.error(C.red + "❌ Unhandled Rejection:" + C.reset, error);
});

process.on("uncaughtException", error => {
  console.error(C.red + "❌ Uncaught Exception:" + C.reset, error);
});

client.login(process.env.DISCORD_TOKEN).catch(error => {
  console.error(C.red + "❌ Không thể đăng nhập Discord:" + C.reset, error.message);
  process.exit(1);
});
