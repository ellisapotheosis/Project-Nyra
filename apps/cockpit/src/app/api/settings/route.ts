import { NextResponse } from "next/server";

import { nexusUiSettingsSchema } from "@/lib/settings";
import { readSettings, writeSettings } from "@/lib/settings-store";

export async function GET() {
  const settings = await readSettings();

  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const settings = nexusUiSettingsSchema.parse(body.settings ?? body);
  const saved = await writeSettings(settings);

  return NextResponse.json({ settings: saved });
}
