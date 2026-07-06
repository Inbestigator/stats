import { Label, type MessageComponentInteraction, TextDisplay, TextInput } from "dressed";
import { getEncodedInfo } from "../../commands/configure.ts";
import { DEFAULT_USER_CONFIG } from "../../db.ts";

export const pattern = "config-bio";

export default function (interaction: MessageComponentInteraction) {
  const {
    config: { bio },
  } = getEncodedInfo(interaction.message);
  return interaction.showModal({
    custom_id: "config-bio",
    title: "Edit bio",
    components: [
      Label(
        "Leave empty for default, max 3 lines",
        TextInput({
          custom_id: "value",
          placeholder: DEFAULT_USER_CONFIG.bio,
          value: bio,
          style: "Paragraph",
          required: false,
        }),
      ),
      TextDisplay(
        `
There are some variables you may use within your bio, when adding them you should use the format \`{{<VARIABLE_NAME>}}\`.

\`{{user.name}}\`: Your display name
\`{{user.login}}\`: Your handle
\`{{user.bio}}\`: Your bio text
\`{{user.followers}}\`: How many people follow you
\`{{user.following}}\`: How many people you follow
\`{{user.contributions}}\`: The number of contributions GitHub has counted in your calendar
\`{{user.topLanguage}}\`: Your most-used programming language
\`{{user.createdAt}}\`: The date your GitHub account was created

\`{{repos.count}}\`: Total number of repositories
\`{{repos.stars}}\`: Total stars received across all repositories
\`{{repos.mostStarred}}\`: Your most-starred repository
\`{{repos.forks}}\`: Total forks across all repositories
\`{{repos.watchers}}\`: Total watchers across all repositories
\`{{repos.averageStars}}\`: Average stars per repository
\`{{repos.activeRepos}}\`: Number of active repositories
\`{{repos.languageDiversity}}\`: Number of different programming languages used across your repositories

-# This is an inexhaustive list
`,
      ),
    ],
  });
}
