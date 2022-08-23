import { PermissionResolvable } from "discord.js";
import { IGuild } from "discordx";
import { TypeCategory } from "./category";

export type TypeCommand = { name: string, category: TypeCategory, description: string, permissions: PermissionResolvable | null, guilds?: IGuild[] };