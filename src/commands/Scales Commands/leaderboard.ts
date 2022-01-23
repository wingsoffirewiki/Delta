/** @format */

import { MessageEmbed } from "discord.js";
import { Command } from "fero-dc";
import { User, IUser } from "../../models/User";

export default new Command({
  name: "leaderboard",
  description: "Get a list of the top 10 people in the economy",
  category: "Scales",
  guildIDs: ["759068727047225384"],
  run: async context => {
    if (!context.interaction || !context.guild || !context.member) return;

    const userModels: IUser[] = await User.find({}, "_id scales").sort({
      scales: -1
    });

    const authorModel = userModels.find(
      userModel => userModel._id === context.author.id
    );

    const authorModelIndex = authorModel
      ? userModels.indexOf(authorModel)
      : undefined;

    const embed = new MessageEmbed();

    embed
      .setTitle("Delta: Scales Leaderboard")
      .setAuthor({
        name: context.author.username || "",
        iconURL: context.author.avatarURL({ dynamic: true }) || ""
      })
      .setDescription(
        `The following is the leaderboard for ${context.client.user?.username}`
      )
      .setColor("BLURPLE")
      .addFields([
        ...userModels.slice(0, 10).map((userModel, i) => ({
          name:
            context.client.users.cache.get(userModel._id)?.username ||
            userModel._id,
          value: `${i + 1}: \`${userModel.scales}\` scales.`,
          inline: false
        })),
        {
          name: `${context.author.username} (You)`,
          value: `${(authorModelIndex || userModels.length - 1) + 1}: \`${
            authorModel?.scales || 0
          }\` scales`
        }
      ])
      .setTimestamp()
      .setFooter({
        text: "Delta, The Wings of Fire Moderation Bot",
        iconURL: context.client.user?.avatarURL({ dynamic: true }) || ""
      });

    context.interaction.followUp({ embeds: [embed] });
  }
});