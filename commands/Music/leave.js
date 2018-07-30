const Music = require("../../modules/Music");

module.exports = class extends Music {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: false,
      botOwnerOnly: false,
      nsfw: false,
      checkVC: true,
      cooldown: 5,
      description: () => `Leave the voice channel.`,
      aliases: [],
      userPermissions: [],
      botPermissions: [],
      runIn: ["text"]
    });
  }

  run(msg) {
    if (!msg.guild.player || (msg.guild.player && !msg.guild.player.channelId)) return msg.fail(`I am currently not connected to any voice channels!`);

    if (msg.guild.player.queue.length > 0) this.pause(msg.guild);

    this.leave(msg.guild);

    return msg.success(`I have successfully left #${msg.member.voiceChannel.name}!`);
  }
};