import type { OpenCogPluginApi } from "opencog/plugin-sdk";
import { emptyPluginConfigSchema } from "opencog/plugin-sdk";
import { whatsappPlugin } from "./src/channel.js";
import { setWhatsAppRuntime } from "./src/runtime.js";

const plugin = {
  id: "whatsapp",
  name: "WhatsApp",
  description: "WhatsApp channel plugin",
  configSchema: emptyPluginConfigSchema(),
  register(api: OpenCogPluginApi) {
    setWhatsAppRuntime(api.runtime);
    api.registerChannel({ plugin: whatsappPlugin });
  },
};

export default plugin;
