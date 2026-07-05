import { botEnv, callDiscord } from "dressed/utils";
import { DEFAULT_SYNC_STATS, type SyncConfig } from "./db.ts";
import { getGitHubStats } from "./stats.ts";

export const statDefinitions = {
  followers: { title: "Followers", value: (data) => data.followers.toString() },
  following: { title: "Following", value: (data) => data.following.toString() },
  contributions: {
    title: "Contributions this year",
    value: (data) => data.contributions.toString(),
  },
  stars: { title: "Stars", value: (data) => data.stars.toString() },
  repositories: {
    title: "Repositories",
    value: (data) => data.repositories.toString(),
  },
  favourite_language: {
    title: "Favourite language",
    value: (data) => data.topLanguage,
  },
  most_starred: {
    title: "Most starred",
    value: (data) => data.highestStarRepo,
  },
} satisfies Record<
  string,
  {
    title: string;
    value: (data: Awaited<ReturnType<typeof getGitHubStats>>) => string | undefined;
  }
>;

export default async function sync(
  userId: string,
  login: string,
  token: string,
  selectedStats: SyncConfig = [...DEFAULT_SYNC_STATS],
) {
  const data = await getGitHubStats(login, token);
  const dynamic: { type: number; name: string; value: string | number }[] = [
    { type: 1, name: "login", value: data.login },
  ];

  if (data.name) {
    dynamic.push({ type: 1, name: "name", value: data.name });
  }

  if (data.bio) {
    dynamic.push({ type: 1, name: "bio", value: data.bio });
  }

  for (const [index, stat] of selectedStats.entries()) {
    if (!stat) continue;

    const definition = statDefinitions[stat];
    dynamic.push({
      type: 1,
      name: `stat${index + 1}-label`,
      value: definition.title,
    });
    const value = definition.value(data);
    if (value) {
      dynamic.push({
        name: `stat${index + 1}-value`,
        type: 1,
        value,
      });
    }
  }

  await callDiscord(`/applications/${botEnv.DISCORD_APP_ID}/users/${userId}/identities/0/profile`, {
    method: "PATCH",
    body: { data: { dynamic } },
  });
}
