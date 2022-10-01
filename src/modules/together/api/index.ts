import { core } from "../../../core/index.js";
import { DiscordTogether } from 'discord-together';

export const together = new DiscordTogether(core.client as any);