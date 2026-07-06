import type { Params } from "@dressed/matcher";
import type { MessageComponentInteraction } from "dressed";
import { ConfigPage, getEncodedInfo } from "../../commands/configure.ts";

export const pattern = "config-stat-:index";

export default function (interaction: MessageComponentInteraction, props: Params<typeof pattern>) {
  const info = getEncodedInfo(interaction.message);
  const index = Number(props.index);
  const curr = info.config.stats[index];

  if (curr) info.config.stats[index] = undefined;

  return interaction.update({
    components: ConfigPage(info, !curr ? index : undefined),
  });
}
