import type { OpenCogPluginApi } from "opencog/plugin-sdk";
import { emptyPluginConfigSchema } from "opencog/plugin-sdk";
import { createDiagnosticsOtelService } from "./src/service.js";

const plugin = {
  id: "diagnostics-otel",
  name: "Diagnostics OpenTelemetry",
  description: "Export diagnostics events to OpenTelemetry",
  configSchema: emptyPluginConfigSchema(),
  register(api: OpenCogPluginApi) {
    api.registerService(createDiagnosticsOtelService());
  },
};

export default plugin;
