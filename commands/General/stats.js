const os = require("os");
const moment = require("moment");
require("moment-duration-format")(moment);

module.exports.run = async (client, msg) => msg.channel.send({
  embed: {
    fields: [
      {
        "name": `📈${msg.emojis.bar}Statistics`,
        "value": `
**Username**: ${client.user.tag} (\`${client.user.id}\`)\n
**Owner**: ${client.users.get(client.owner).tag} (\`${client.owner}\`)\n
**Created On**: ${moment(client.user.createdAt).format("dddd, MMMM Do YYYY, hh:mm:ss A")}\n
**Uptime**: ${moment.duration(client.uptime).format(" D [days], H [hours], m [minutes], s [seconds]")}\n
**Users**: \`${client.users.size.toLocaleString()}\`\n
**Guilds**: \`${client.guilds.size.toLocaleString()}\`\n
**Channels**: \`${client.channels.size.toLocaleString()}\`\n
**Emojis**: \`${client.emojis.size.toLocaleString()}\`\n
**Commands**: \`${client.commands.size.toLocaleString()}\`\n
**Commands Ran**: \`${client.cache ? client.cache.commandsRan.toLocaleString() : `Still retrieving...`}\`\n\u200B`
      },
      {
        "name": `🖥${msg.emojis.bar}System Information`,
        "value": `
**CPU Model**: ${os.cpus()[0].model}\n
**Architecture**: ${os.arch()}\n
**Memory Usage**: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} / ${(os.totalmem() / 1024 / 1024).toFixed(2)} MB\n
**Free Memory**: ${(os.freemem() / 1024 / 1024).toFixed(2)} MB\n
**Platform**: ${os.platform()}\n\u200B`
      },
      {
        "name": `🔗${msg.emojis.bar}Links`,
        "value": `
**Invite URL**: **${await client.generateInvite().then(link => link.replace("permissions=0", "permissions=8")).catch(() => "Failed to generate an invite link")}**\n
**Github Repository**: **https://github.com/alexy4744/Miyako**`
      }
    ],
    thumbnail: {
      "url": client.user.getAvatar()
    },
    color: msg.colors.default
  }
});

module.exports.options = {
  enabled: true,
  guarded: false,
  botOwnerOnly: false,
  nsfw: false,
  checkVC: false,
  cooldown: 5,
  description: msg => `View the current statistics and system information of ${msg.client.user.toString()}`,
  aliases: ["botinfo", "botstats"],
  userPermissions: [],
  botPermissions: [],
  runIn: []
};