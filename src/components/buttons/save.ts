import abseil from "abseil";
import type { MessageComponentInteraction } from "dressed";
import { ConfigPage, getEncodedInfo } from "../../commands/configure.ts";
import { setUserConfig } from "../../db.ts";

export const pattern = "config-save";

export default async function (interaction: MessageComponentInteraction) {
  const info = getEncodedInfo(interaction.message);

  await setUserConfig(interaction.user.id, info.config);

  info.originalConfig = info.config;

  const components = ConfigPage(info);

  abseil(components).initial("Container").last("Section")?.accessory("Button").update({ label: "Saved" });

  return interaction.update({ components });
}
