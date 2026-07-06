import { Discord, GitHub } from "arctic";
import { botEnv } from "dressed/utils";

export const discord = new Discord(botEnv.DISCORD_APP_ID, null, new URL("/api/ds", process.env.API_BASE).href);

export const github = new GitHub(
  process.env.GITHUB_CLIENT_ID!,
  process.env.GITHUB_CLIENT_SECRET!,
  new URL("/api/gh", process.env.API_BASE).href,
);
