import { generateState } from "arctic";
import { ActionRow, Button, type CommandConfig, type CommandInteraction } from "dressed";
import { discord, github } from "../auth.ts";
import { getUser, getUserConfig, insertPendingInit } from "../db.ts";
import sync from "../sync.ts";

export const config = {
  description: "Sync your GitHub profile",
} satisfies CommandConfig;

export default async function (interaction: CommandInteraction<typeof config>) {
  const [user, userConfig] = await Promise.all([
    getUser(interaction.user.id),
    getUserConfig(interaction.user.id),
    interaction.deferReply({ ephemeral: true }),
  ]);
  if (!user) {
    const state = generateState();
    await insertPendingInit(state, interaction.user.id, interaction.token);
    return interaction.editReply(LinkPage(state));
  }
  await sync(
    interaction.user.id,
    user.github_login,
    user.github_token,
    userConfig,
    Date.now() - (user.cached_stats?.savedAt ?? 0) > 30 * 60 * 1000,
  );
  return interaction.editReply("Your stats have been synced");
}

export function LinkPage(state: string, stage = 1) {
  if (stage === 3) {
    return {
      content: "Your GitHub account was successfully linked and your stats have been synced",
      components: [],
    };
  }
  return {
    content: "Your GitHub account hasn't been linked yet, click these links to setup your widget",
    components: [
      ActionRow(
        Button({
          url: discord.createAuthorizationURL(state, null, ["openid", "sdk.social_layer"]).href,
          label: "Authorize",
          disabled: stage !== 1,
        }),
        Button({ url: github.createAuthorizationURL(state, []).href, label: "Link GitHub", disabled: stage !== 2 }),
      ),
    ],
  };
}
