import { editWebhookMessage } from "dressed";
import { botEnv } from "dressed/utils";
import { github } from "../src/auth.ts";
import { LinkPage } from "../src/commands/sync.ts";
import { deletePendingInit, getPendingInit, upsertUser } from "../src/db.ts";
import sync from "../src/sync.ts";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (code && state) {
    const [tokens, pendingInit] = await Promise.allSettled([
      github.validateAuthorizationCode(code),
      getPendingInit(state),
    ]);

    if (tokens.status === "fulfilled" && pendingInit.status === "fulfilled" && pendingInit.value) {
      const access_token = tokens.value.accessToken();
      const userRes = await fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const userData = (await userRes.json()) as { login: string };
      if (userRes.ok) {
        const { discord_id, interaction_token, state } = pendingInit.value;
        const [upsertRes] = await Promise.allSettled([
          upsertUser(discord_id, userData.login, access_token).then(() =>
            sync(discord_id, userData.login, access_token, undefined, true),
          ),
          deletePendingInit(state),
          editWebhookMessage(botEnv.DISCORD_APP_ID, interaction_token, "@original", LinkPage(state, 3)),
        ]);
        if (upsertRes.status === "rejected") {
          return Response.redirect(
            `https://stat-widget.vercel.app/error.html?m=${encodeURIComponent("There was an error saving your details or syncing your stats. Please try again")}`,
          );
        }
        return Response.redirect("https://stat-widget.vercel.app/success.html");
      }
    } else if (pendingInit) {
      await deletePendingInit(state);
      return Response.redirect(
        `https://stat-widget.vercel.app/error.html?m=${encodeURIComponent("There was an error fetching your access token. Please run `/sync` to try again")}`,
      );
    }
  } else if (state) {
    await deletePendingInit(state);
  }

  return Response.redirect(
    `https://stat-widget.vercel.app/error.html?m=${encodeURIComponent("Your session has expired. Please run `/sync` to try again")}`,
  );
}
