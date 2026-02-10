import type { OpenCogPluginApi } from "opencog/plugin-sdk";
import { emptyPluginConfigSchema } from "opencog/plugin-sdk";
import { registerLineCardCommand } from "./src/card-command.js";
import { linePlugin } from "./src/channel.js";
import { setLineRuntime } from "./src/runtime.js";

const plugin = {
  id: "line",
  name: "LINE",
  description: "LINE Messaging API channel plugin",
  configSchema: emptyPluginConfigSchema(),
  register(api: OpenCogPluginApi) {
    setLineRuntime(api.runtime);
    api.registerChannel({ plugin: linePlugin });
    registerLineCardCommand(api);
  },
};

export default plugin;
