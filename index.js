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

for (const name of ["xoa", "themrole", "xoarole", "autorole"]) {
  client.commands.set(name, require(path.join(__dirname, "commands", name + ".js")));
}

client.once("ready", c => {
  console.log("SkyRush-SeverRoot online as " + c.user.tag);
  console.log("Servers: " + c.guilds.cache.size);
});

client.on("guildMemberAdd", async member => {
  try {
    const data = config.autorole[member.guild.id];
    if (!data?.enabled || !data.roleId) return;

    const role = member.guild.roles.cache.get(data.roleId);
    if (!role || !role.editable) return;

    await member.roles.add(role, "SkyRush-SeverRoot Auto Role");
  } catch (error) {
    console.error("Auto Role error:", error);
  }
});

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

  if (!["ban", "kick", "hanche", "bohanche"].includes(command)) return;

  if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return message.reply("❌ Bạn cần quyền Administrator để dùng lệnh này.");
  }

  const target = message.mentions.members.first();
  if (!target) return message.reply("❌ Hãy mention thành viên.");

  try {
    if (command === "ban") {
      const reason = args.slice(1).join(" ") || "Không có lý do";
      if (!target.bannable) return message.reply("❌ Bot không thể ban thành viên này.");
      await target.ban({ reason });
      return message.reply("🔨 Đã ban " + target.user.tag + ". Lý do: " + reason);
    }

    if (command === "kick") {
      const reason = args.slice(1).join(" ") || "Không có lý do";
      if (!target.kickable) return message.reply("❌ Bot không thể kick thành viên này.");
      await target.kick(reason);
      return message.reply("👢 Đã kick " + target.user.tag + ". Lý do: " + reason);
    }

    if (command === "hanche") {
      const duration = parseDuration(args[1]);
      if (!duration) {
        return message.reply("❌ Thời gian phải dạng 10s, 5m, 2h hoặc 1d (tối đa 28d).");
      }

      const reason = args.slice(2).join(" ") || "Không có lý do";
      if (!target.moderatable) return message.reply("❌ Bot không thể hạn chế thành viên này.");

      await target.timeout(duration, reason);
      return message.reply(
        "🔇 Đã hạn chế " + target.user.tag + " trong " + args[1] + ". Lý do: " + reason
      );
    }

    if (command === "bohanche") {
      if (!target.moderatable) return message.reply("❌ Bot không thể bỏ hạn chế thành viên này.");

      await target.timeout(null, "Bỏ hạn chế bởi SkyRush-SeverRoot");
      return message.reply("🔊 Đã bỏ hạn chế " + target.user.tag + ".");
    }
  } catch (error) {
    console.error(error);
    return message.reply("❌ Không thể thực hiện lệnh. Kiểm tra quyền của bot và thứ tự role.");
  }
});

client.on("interactionCreate", async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, { config, saveConfig });
    } catch (error) {
      console.error(error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: "❌ Có lỗi xảy ra.", ephemeral: true });
      }
    }
    return;
  }

  if (interaction.isButton() || interaction.isRoleSelectMenu()) {
    const command = client.commands.get("autorole");
    if (!command?.handleComponent) return;

    try {
      await command.handleComponent(interaction, { config, saveConfig });
    } catch (error) {
      console.error(error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: "❌ Có lỗi xảy ra.", ephemeral: true });
      }
    }
  }
});

if (!process.env.DISCORD_TOKEN) {
  console.error("❌ Thiếu DISCORD_TOKEN trong file .env");
  process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);
