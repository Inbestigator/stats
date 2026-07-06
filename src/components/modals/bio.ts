import type { ModalSubmitInteraction } from "dressed";
import { ConfigPage, getEncodedInfo } from "../../commands/configure.ts";
import { DEFAULT_USER_CONFIG } from "../../db.ts";

export const pattern = "config-bio";

export default function (interaction: ModalSubmitInteraction) {
  const info = getEncodedInfo(interaction.message!);

  info.config.bio = interaction.getField("value", false)?.textInput() ?? DEFAULT_USER_CONFIG.bio;

  return interaction.update({ components: ConfigPage(info) });
}
