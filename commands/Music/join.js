const Music = require("../../modules/Music");

module.exports = class Join extends Music {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: false,
      botOwnerOnly: false,
      nsfw: false,
      cooldown: 5,
      description: () => `Join your voice channel.`,
      usage: msg => [`${msg.this.client.user.id}`, `${msg.author.username}`],
      aliases: [],
      userPermissions: [],
      botPermissions: ["CONNECT", "SPEAK"],
      runIn: ["text"]
    });
  }

  run(msg) {
    const voiceChannel = msg.member.voiceChannel;

    if (!voiceChannel) return msg.fail(`You must join a voice channel first before executing this command!`);
    if (msg.guild.queue && voiceChannel.id === msg.guild.queue.channelId) return msg.fail(`I am already in your voice channel!`);
    if (voiceChannel.full) return msg.fail(`#${voiceChannel.name} is currently full!`);
    if (!voiceChannel.joinable) return msg.fail(`I do not have the permissions to join #${voiceChannel.name}!`);

    this.join(msg);

    msg.guild.player = {
      queue: [],
      channelId: msg.member.voiceChannel.id,
      playing: false,
      paused: false,
      volume: 75
    };

    return msg.success(`I have successfully joined #${voiceChannel.name}!`);
  }
};