import type { AnyAgentTool, OpenCogPluginApi } from "../../src/plugins/types.js";
import { createLlmTaskTool } from "./src/llm-task-tool.js";

export default function register(api: OpenCogPluginApi) {
  api.registerTool(createLlmTaskTool(api) as unknown as AnyAgentTool, { optional: true });
}
