/* eslint no-use-before-define: 0 */
/* eslint no-confusing-arrow: 0 */

const Command = require("../../modules/Command");
const moment = require("moment");

module.exports = class Ping extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      guarded: false,
      botOwnerOnly: false,
      nsfw: false,
      cooldown: 5,
      description: () => `Ban a member with optional reasoning and days of messages to delete.`,
      usage: msg => [`${msg.this.client.user.toString()}`, `${msg.author.toString()} 7`, `${msg.this.client.user.toString()} 3 this bot sucks`],
      aliases: [],
      userPermissions: ["BAN_MEMBERS"],
      botPermissions: ["BAN_MEMBERS"],
      runIn: ["text"]
    });
  }

  async run(msg, args) {
    const member = msg.mentions.members.size > 0 ? msg.mentions.members.first() : args[0] !== undefined ? args[0] : null; // eslint-disable-line
    args = args.filter(arg => (member instanceof Object) ? arg !== member.toString() : arg !== member); // Remove member from array of arguments
    const days = args[0] ? this.client.utils.stringToMillis.isValid(args[0]) ? this.client.utils.stringToMillis.convert(args[0]).ms : null : null; // eslint-disable-line
    const reason = days ? args.slice(1).join(" ") : args.join(" ").length > 0 ? args.join(" ") : null; // If days were specified, remove first 2 elements, else remove 1 and then join the whole array.

    if (member) {
      if (msg.guild.members.has(args[0])) { // If it is a user snowflake
        return ban(msg.guild.members.get(args[0]));
      } else if (member instanceof Object) { // If it is a object, then it has to be a mention, since it is the only time "member" is a member object
        ban(member);
      } else { // If it is a username
        const guildMember = msg.guild.findMember(member);

        if (!guildMember.bannable) return msg.fail(`I do not have the privilege to ban ${guildMember.user.tag}!`, `Please make sure that this member's permissions or roles are not higher than me in order for me to ban them!`);

        const message = await msg.channel.send({
          embed: {
            title: `${msg.emojis.pending}Are you sure you want to ban ${guildMember.user.tag}?`,
            description: `User ID: \`${guildMember.id}\`\n\nRespond with **${msg.guild.me.hasPermission("ADD_REACTIONS") ? "👌" : "YES"}** to ban this member or **${msg.guild.me.hasPermission("ADD_REACTIONS") ? "❌" : "NO"}** to cancel the command within **15** seconds`,
            thumbnail: {
              "url": guildMember.user.getAvatar(512)
            },
            color: msg.colors.pending
          }
        });

        const confirmation = await message.prompt(msg.author.id, {
          "emojis": {
            "yes": "👌"
          }
        }).catch(e => ({
          "error": e
        }));

        if (confirmation.error) return msg.cancelledCommand(`${msg.author.toString()} has failed to provide a response within **15** seconds, therefore I have cancelled the command!`);
        if (confirmation) return ban(guildMember);
        return msg.cancelledCommand();
      }
    } else {
      return msg.fail(`Please mention the member or enter their username/ID in order for me to ban them!`);
    }

    async function ban(guildMember) {
      // Put the data into the db first before banning, that way if the database fails, the member doesn't get banned.
      if (guildMember.bannable) {
        if (days) { // Only save it to the database if this is a timed ban.
          const clientData = await this.client.db.get().catch(e => ({
            "error": e
          }));

          if (clientData.error) return msg.error(clientData.error, `ban ${guildMember.user.tag}!`);
          if (!(clientData.bannedMembers instanceof Array)) clientData.bannedMembers = [];

          // If this user is not found in the array of banned members.
          if (clientData.bannedMembers.findIndex(el => el.memberId === guildMember.id) < 0) { // eslint-disable-line
            clientData.bannedMembers.push({
              "memberId": guildMember.id,
              "guildId": msg.guild.id,
              "reason": reason.length > 0 ? reason : null,
              "bannedBy": msg.author.id,
              "bannedOn": Date.now(),
              "bannedUntil": days ? Date.now() + days : null
            });

            try {
              await this.client.db.update({
                "bannedMembers": clientData.bannedMembers
              });
              await this.client.updateCache("bannedMembers", this.client.bannedMembers);
            } catch (error) {
              return msg.error(error, `ban ${guildMember.user.tag}!`);
            }
          }
        }

        return guildMember.ban({
          "reason": reason.length < 1 ? null : reason
        }).then(() => msg.success(`I have successfully banned ${guildMember.user.tag}!`, `Reason: ${reason.length > 0 ? reason : `Not Specified`}\n\n${days ? `Banned Until: ${moment(Date.now() + days).format("dddd, MMMM Do, YYYY, hh:mm:ss A")}` : ``}`))
          .catch(e => {
            // Only revert database if it is a timed ban.
            // Ignoring errors because I can check if this member is actually banned later in my loop
            if (days) {
              this.client.db.get().then(async clientData => {
                const index = clientData.bannedMembers.findIndex(el => el.memberId === guildMember.id);

                if (index > -1) {
                  try {
                    clientData.bannedMembers.splice(index, 1);
                    await this.client.db.update({
                      "bannedMembers": clientData.bannedMembers
                    });
                    await this.client.updateCache("bannedMembers", clientData.bannedMembers);
                  } catch (error) {
                    // noop
                  }
                }
              }).catch(() => { });
            }

            return msg.error(e, `ban ${guildMember.user.tag}!`); // eslint-disable-line
          });
      } else { // eslint-disable-line
        return msg.fail(`I do not have the privilege to ban ${guildMember.user.tag}!`, `Please make sure that this member's permissions or roles are not higher than me in order for me to ban them!`);
      }
    }
  }
};