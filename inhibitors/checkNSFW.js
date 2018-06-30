module.exports = (client, msg, cmd) => {
  if (msg.channel.type !== "text") return 1;
  if (!msg.channel.nsfw && cmd.command.options.nsfw) {
    return msg.channel.send({
      embed: {
        title: `${msg.emojis.fail}Sorry ${msg.author.username}, I cannot run this command in non-NSFW channels!`,
        color: msg.colors.fail
      }
    });
  } else return 1 // eslint-disable-line
};