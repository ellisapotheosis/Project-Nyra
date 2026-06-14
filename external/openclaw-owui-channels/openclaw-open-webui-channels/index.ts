import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";
import { openWebUIPlugin } from "./src/channel.js";
import { setOpenWebUIRuntime } from "./src/runtime.js";

const plugin = {
  id: "open-webui",
  name: "Open WebUI",
  description: "Open WebUI channels plugin",
  configSchema: emptyPluginConfigSchema(),
  register(api: OpenClawPluginApi) {
    setOpenWebUIRuntime(api.runtime);
    api.registerChannel({ plugin: openWebUIPlugin });
  },
};

export default plugin;
