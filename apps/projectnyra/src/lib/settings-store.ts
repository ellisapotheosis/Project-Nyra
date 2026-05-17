import { promises as fs } from "node:fs";
import path from "node:path";

import {
  defaultSettings,
  nexusUiSettingsSchema,
  type NexusUiSettings,
} from "@/lib/settings";

function settingsPath() {
  const configured =
    process.env.NEXUS_UI_SETTINGS_PATH ?? "./config/nexus-ui.settings.json";

  return path.isAbsolute(configured)
    ? configured
    : path.join(process.cwd(), configured);
}

export async function readSettings(): Promise<NexusUiSettings> {
  const filePath = settingsPath();

  try {
    const raw = await fs.readFile(filePath, "utf8");

    return nexusUiSettingsSchema.parse(JSON.parse(raw));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return defaultSettings;
    }

    throw error;
  }
}

export async function writeSettings(settings: NexusUiSettings) {
  const parsed = nexusUiSettingsSchema.parse(settings);
  const filePath = settingsPath();

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");

  return parsed;
}
