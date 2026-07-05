import { editWebhookMessage } from "dressed";
import { botEnv } from "dressed/utils";
import { LinkPage } from "../src/commands/sync.ts";
import { deletePendingInit, getPendingInit, upsertUser } from "../src/db.ts";
import sync from "../src/sync.ts";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (code && state) {
    const [res, pendingInit] = await Promise.all([
      fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      }),
      getPendingInit(state),
    ]);

    if (res.ok && pendingInit) {
      const { access_token } = (await res.json()) as { access_token: string };
      const userRes = await fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const userData = (await userRes.json()) as { login: string };
      if (userRes.ok) {
        await Promise.all([
          upsertUser(pendingInit.discord_id, userData.login, access_token),
          sync(pendingInit.discord_id, userData.login, access_token),
          deletePendingInit(state),
          editWebhookMessage(
            botEnv.DISCORD_APP_ID,
            pendingInit.interaction_token,
            "@original",
            LinkPage(pendingInit.state, 3),
          ),
        ]);
      }
    }
  }

  return Response.redirect("https://gstats-widget.vercel.app/success.html");
}
