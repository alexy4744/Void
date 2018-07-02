module.exports.run = (client, msg) => {
  client.LePlayer.clear(msg.guild.id).then(async () => {
    await client.LePlayer.join(msg).catch(async () => { // Leave the voice channel as a fallback
      await client.LePlayer.leave(msg.guild.id).catch(() => {}); // If an error occurs leaving the voice channel, do nothing.
    });

    return msg.channel.send({
      embed: {
        title: `💥${msg.emojis.bar}I have succesfully cleared the queue!`,
        color: msg.colors.success
      }
    });
  }).catch(error => msg.channel.send({
    embed: {
      title: `${msg.emojis.fail}Sorry ${msg.author.username}, I have failed to clear the queue!`,
      description: `\`\`\`js\n${error}\n\`\`\``,
      color: msg.colors.fail
    }
  }));
};

module.exports.options = {
  enabled: true,
  guarded: false, // If the command can be disabled per guild
  description: "Clear the song queue",
  nsfw: false,
  aliases: [],
  botOwnerOnly: false,
  checkVC: true,
  userPermissions: [],
  botPermissions: [],
  runIn: ["text"],
  cooldown: 5
};