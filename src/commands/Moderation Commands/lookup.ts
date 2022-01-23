/** @format */

import { MessageEmbed } from "discord.js";
import { Command, toPascalCase } from "fero-dc";
import { Log, ILog } from "../../models/Log";
import { Guild, IGuild } from "../../models/Guild";
import { LogEnum } from "../../scripts/log";

export default new Command({
  name: "lookup",
  description: "Lookup a user or a log",
  category: "Moderation",
  options: [
    {
      name: "user",
      description: "Lookup a user and see their logs",
      type: "SUB_COMMAND",
      options: [
        {
          name: "user",
          description: "The user to lookup",
          type: "USER",
          required: true
        }
      ]
    },
    {
      name: "log",
      description: "Lookup a log and see its information",
      type: "SUB_COMMAND",
      options: [
        {
          name: "log",
          description: "The log to lookup",
          type: "INTEGER",
          required: true
        }
      ]
    }
  ],
  guildIDs: ["759068727047225384"],
  run: async context => {
    if (!context.interaction || !context.guild || !context.member) return;

    const subCommand = context.interaction.options.getSubcommand(true);

    if (subCommand === "user") {
      const user = context.interaction.options.getUser("user", true);

      const logModels: ILog[] = await Log.find(
        {
          guildID: context.guild.id,
          targetID: user.id
        },
        "type reason logID"
      );

      const embed = new MessageEmbed();

      embed
        .setTitle("Delta: User Logs")
        .setAuthor({
          name: context.author.username || "",
          iconURL: context.author.avatarURL({ dynamic: true }) || ""
        })
        .setDescription(`${user.tag} has ${logModels.length} entries!`)
        .setColor("BLURPLE")
        .addFields([
          {
            name: "Currently Banned",
            value: (await context.guild.bans.cache.get(user.id)) ? "Yes" : "No",
            inline: false
          },
          ...logModels.map(v => ({
            name: `${v.logID} - ${toPascalCase(LogEnum[v.type] as string)}`,
            value: v.reason,
            inline: false
          }))
        ])
        .setTimestamp()
        .setFooter({
          text: "Delta, The Wings of Fire Moderation Bot",
          iconURL: context.client.user?.avatarURL({ dynamic: true }) || ""
        });

      return context.interaction.followUp({ embeds: [embed] });
    } else if (subCommand === "log") {
      const logID = context.interaction.options.getInteger("log", true);

      const logModel: ILog = await Log.findOne({
        guildID: context.guild.id,
        logID
      });

      const guildModel: IGuild = await Guild.findOne({
        _id: context.guild.id
      });

      const logsChannel = context.guild.channels.cache.get(
        guildModel.channelIDs.logs
      );

      if (!logsChannel || !logsChannel.isText()) return;

      const embedMessage = await logsChannel.messages.fetch(logModel.embedID);

      context.interaction.followUp({
        embeds: [embedMessage.embeds[0] as MessageEmbed]
      });
    }

    return;
  }
});