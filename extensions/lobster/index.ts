import type {
  AnyAgentTool,
  OpenCogPluginApi,
  OpenCogPluginToolFactory,
} from "../../src/plugins/types.js";
import { createLobsterTool } from "./src/lobster-tool.js";

export default function register(api: OpenCogPluginApi) {
  api.registerTool(
    ((ctx) => {
      if (ctx.sandboxed) {
        return null;
      }
      return createLobsterTool(api) as AnyAgentTool;
    }) as OpenCogPluginToolFactory,
    { optional: true },
  );
}
