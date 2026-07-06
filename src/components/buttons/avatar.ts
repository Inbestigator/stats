import type { MessageComponentInteraction } from "dressed";
import { ConfigPage, getEncodedInfo } from "../../commands/configure.ts";

export const pattern = "config-avatar";

export default function (interaction: MessageComponentInteraction) {
  const info = getEncodedInfo(interaction.message);

  info.config.avatar = !info.config.avatar;

  return interaction.update({ components: ConfigPage(info) });
}
