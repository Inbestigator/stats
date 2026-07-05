# GitHub Stats Discord Bot

A Discord bot built with [Dressed](https://dressed.js.org) that displays GitHub statistics in a widget and allows users to link and manage their GitHub accounts.

## Features

- Link your GitHub account to Discord with an easy to follow flow
- Sync data between GitHub and Discord
- Manage preferences for the widget layout

## Commands

- `/configure`: Link and configure your GitHub account
- `/deauth`: Disconnect your GitHub account
- `/ping`: Checks the API latency
- `/sync`: Sync your GitHub data

## Setup

The bot uses LibSQL for persisting linked GitHub accounts. By default it writes to a local file database at `./local.db`, but you can also point it to Turso by setting `DB_URL` and `DB_AUTH_TOKEN`.

1. Install dependencies:

   ```sh
   bun install
   ```

2. Set up environment variables:
   - Discord token and application ID
   - GitHub OAuth credentials
   - Database URL (optional)

3. Register the commands:

   ```sh
   bun register
   ```

4. Run the bot:
   ```sh
   bun start
   ```

To use the bot locally, you'll need to forward a port for the Discord interactions endpoint. VSCode's built-in port forwarding or Cloudflare Tunnel are good options.

## Deploying

Deploy to Vercel using the `vercel.json` configuration. See [the Dressed deploying guides](https://dressed.js.org/docs/guide/deploying) for more information.
