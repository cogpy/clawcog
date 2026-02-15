import path from "node:path";
import type { OpenCogConfig } from "../config/config.js";
import type {
  MediaUnderstandingCapability,
  MediaUnderstandingConfig,
  MediaUnderstandingModelConfig,
} from "../config/types.tools.js";
import type {
  MediaUnderstandingAttachmentDecision,
  MediaUnderstandingDecision,
  MediaUnderstandingModelDecision,
  MediaUnderstandingProvider,
} from "./types.js";
import { resolveApiKeyForProvider } from "../agents/model-auth.js";
import {
  AUTO_AUDIO_KEY_PROVIDERS,
  AUTO_IMAGE_KEY_PROVIDERS,
  AUTO_VIDEO_KEY_PROVIDERS,
  DEFAULT_IMAGE_MODELS,
} from "./defaults.js";
import { getMediaUnderstandingProvider, normalizeMediaProviderId } from "./providers/index.js";
import { fileExists, hasBinary } from "./runner.binary.js";
import { probeGeminiCli } from "./runner.cli.js";

export type ActiveMediaModel = {
  provider: string;
  model?: string;
};

type ProviderRegistry = Map<string, MediaUnderstandingProvider>;
type ProviderQuery = Record<string, string | number | boolean>;

async function resolveLocalWhisperCppEntry(): Promise<MediaUnderstandingModelConfig | null> {
  if (!(await hasBinary("whisper-cli"))) {
    return null;
  }
  const envModel = process.env.WHISPER_CPP_MODEL?.trim();
  const defaultModel = "/opt/homebrew/share/whisper-cpp/for-tests-ggml-tiny.bin";
  const modelPath = envModel && (await fileExists(envModel)) ? envModel : defaultModel;
  if (!(await fileExists(modelPath))) {
    return null;
  }
  return {
    type: "cli",
    command: "whisper-cli",
    args: ["-m", modelPath, "-otxt", "-of", "{{OutputBase}}", "-np", "-nt", "{{MediaPath}}"],
  };
}

async function resolveLocalWhisperEntry(): Promise<MediaUnderstandingModelConfig | null> {
  if (!(await hasBinary("whisper"))) {
    return null;
  }
  return {
    type: "cli",
    command: "whisper",
    args: [
      "--model",
      "turbo",
      "--output_format",
      "txt",
      "--output_dir",
      "{{OutputDir}}",
      "--verbose",
      "False",
      "{{MediaPath}}",
    ],
  };
}

async function resolveSherpaOnnxEntry(): Promise<MediaUnderstandingModelConfig | null> {
  if (!(await hasBinary("sherpa-onnx-offline"))) {
    return null;
  }
  const modelDir = process.env.SHERPA_ONNX_MODEL_DIR?.trim();
  if (!modelDir) {
    return null;
  }
  const tokens = path.join(modelDir, "tokens.txt");
  const encoder = path.join(modelDir, "encoder.onnx");
  const decoder = path.join(modelDir, "decoder.onnx");
  const joiner = path.join(modelDir, "joiner.onnx");
  if (!(await fileExists(tokens))) {
    return null;
  }
  if (!(await fileExists(encoder))) {
    return null;
  }
  if (!(await fileExists(decoder))) {
    return null;
  }
  if (!(await fileExists(joiner))) {
    return null;
  }
  return {
    type: "cli",
    command: "sherpa-onnx-offline",
    args: [
      `--tokens=${tokens}`,
      `--encoder=${encoder}`,
      `--decoder=${decoder}`,
      `--joiner=${joiner}`,
      "{{MediaPath}}",
    ],
  };
}

async function resolveLocalAudioEntry(): Promise<MediaUnderstandingModelConfig | null> {
  const sherpa = await resolveSherpaOnnxEntry();
  if (sherpa) {
    return sherpa;
  }
  const whisperCpp = await resolveLocalWhisperCppEntry();
  if (whisperCpp) {
    return whisperCpp;
  }
  return await resolveLocalWhisperEntry();
}

async function resolveGeminiCliEntry(
  _capability: MediaUnderstandingCapability,
): Promise<MediaUnderstandingModelConfig | null> {
  if (!(await probeGeminiCli())) {
    return null;
  }
  return {
    type: "cli",
    command: "gemini",
    args: [
      "--output-format",
      "json",
      "--allowed-tools",
      "read_many_files",
      "--include-directories",
      "{{MediaDir}}",
      "{{Prompt}}",
      "Use read_many_files to read {{MediaPath}} and respond with only the text output.",
    ],
  };
}

async function resolveKeyEntry(params: {
  cfg: OpenCogConfig;
  agentDir?: string;
  providerRegistry: ProviderRegistry;
  capability: MediaUnderstandingCapability;
  activeModel?: ActiveMediaModel;
}): Promise<MediaUnderstandingModelConfig | null> {
  const { cfg, agentDir, providerRegistry, capability } = params;
  const checkProvider = async (
    providerId: string,
    model?: string,
  ): Promise<MediaUnderstandingModelConfig | null> => {
    const provider = getMediaUnderstandingProvider(providerId, providerRegistry);
    if (!provider) {
      return null;
    }
    if (capability === "audio" && !provider.transcribeAudio) {
      return null;
    }
    if (capability === "image" && !provider.describeImage) {
      return null;
    }
    if (capability === "video" && !provider.describeVideo) {
      return null;
    }
    try {
      await resolveApiKeyForProvider({ provider: providerId, cfg, agentDir });
      return { type: "provider" as const, provider: providerId, model };
    } catch {
      return null;
    }
  };

  if (capability === "image") {
    const activeProvider = params.activeModel?.provider?.trim();
    if (activeProvider) {
      const activeEntry = await checkProvider(activeProvider, params.activeModel?.model);
      if (activeEntry) {
        return activeEntry;
      }
    }
    for (const providerId of AUTO_IMAGE_KEY_PROVIDERS) {
      const model = DEFAULT_IMAGE_MODELS[providerId];
      const entry = await checkProvider(providerId, model);
      if (entry) {
        return entry;
      }
    }
    return null;
  }

  if (capability === "video") {
    const activeProvider = params.activeModel?.provider?.trim();
    if (activeProvider) {
      const activeEntry = await checkProvider(activeProvider, params.activeModel?.model);
      if (activeEntry) {
        return activeEntry;
      }
    }
    for (const providerId of AUTO_VIDEO_KEY_PROVIDERS) {
      const entry = await checkProvider(providerId, undefined);
      if (entry) {
        return entry;
      }
    }
    return null;
  }

  const activeProvider = params.activeModel?.provider?.trim();
  if (activeProvider) {
    const activeEntry = await checkProvider(activeProvider, params.activeModel?.model);
    if (activeEntry) {
      return activeEntry;
    }
  }
  for (const providerId of AUTO_AUDIO_KEY_PROVIDERS) {
    const entry = await checkProvider(providerId, undefined);
    if (entry) {
      return entry;
    }
  }
  return null;
}

export async function resolveAutoEntries(params: {
  cfg: OpenCogConfig;
  agentDir?: string;
  providerRegistry: ProviderRegistry;
  capability: MediaUnderstandingCapability;
  activeModel?: ActiveMediaModel;
}): Promise<MediaUnderstandingModelConfig[]> {
  const activeEntry = await resolveActiveModelEntry(params);
  if (activeEntry) {
    return [activeEntry];
  }
  if (params.capability === "audio") {
    const localAudio = await resolveLocalAudioEntry();
    if (localAudio) {
      return [localAudio];
    }
  }
  const gemini = await resolveGeminiCliEntry(params.capability);
  if (gemini) {
    return [gemini];
  }
  const keys = await resolveKeyEntry(params);
  if (keys) {
    return [keys];
  }
  return [];
}

export async function resolveAutoImageModel(params: {
  cfg: OpenCogConfig;
  agentDir?: string;
  activeModel?: ActiveMediaModel;
}): Promise<ActiveMediaModel | null> {
  const providerRegistry = new Map<string, MediaUnderstandingProvider>();
  const toActive = (entry: MediaUnderstandingModelConfig | null): ActiveMediaModel | null => {
    if (!entry || entry.type === "cli") {
      return null;
    }
    const provider = entry.provider;
    if (!provider) {
      return null;
    }
    const model = entry.model ?? DEFAULT_IMAGE_MODELS[provider];
    if (!model) {
      return null;
    }
    return { provider, model };
  };
  const activeEntry = await resolveActiveModelEntry({
    cfg: params.cfg,
    agentDir: params.agentDir,
    providerRegistry,
    capability: "image",
    activeModel: params.activeModel,
  });
  const resolvedActive = toActive(activeEntry);
  if (resolvedActive) {
    return resolvedActive;
  }
  const keyEntry = await resolveKeyEntry({
    cfg: params.cfg,
    agentDir: params.agentDir,
    providerRegistry,
    capability: "image",
    activeModel: params.activeModel,
  });
  return toActive(keyEntry);
}

export async function resolveActiveModelEntry(params: {
  cfg: OpenCogConfig;
  agentDir?: string;
  providerRegistry: ProviderRegistry;
  capability: MediaUnderstandingCapability;
  activeModel?: ActiveMediaModel;
}): Promise<MediaUnderstandingModelConfig | null> {
  const activeProviderRaw = params.activeModel?.provider?.trim();
  if (!activeProviderRaw) {
    return null;
  }
  const providerId = normalizeMediaProviderId(activeProviderRaw);
  if (!providerId) {
    return null;
  }
  const provider = getMediaUnderstandingProvider(providerId, params.providerRegistry);
  if (!provider) {
    return null;
  }
  if (params.capability === "audio" && !provider.transcribeAudio) {
    return null;
  }
  if (params.capability === "image" && !provider.describeImage) {
    return null;
  }
  if (params.capability === "video" && !provider.describeVideo) {
    return null;
  }
  try {
    await resolveApiKeyForProvider({
      provider: providerId,
      cfg: params.cfg,
      agentDir: params.agentDir,
    });
  } catch {
    return null;
  }
  return {
    type: "provider",
    provider: providerId,
    model: params.activeModel?.model,
  };
}

function normalizeProviderQuery(
  options?: Record<string, string | number | boolean>,
): ProviderQuery | undefined {
  if (!options) {
    return undefined;
  }
  const query: ProviderQuery = {};
  for (const [key, value] of Object.entries(options)) {
    if (value === undefined) {
      continue;
    }
    query[key] = value;
  }
  return Object.keys(query).length > 0 ? query : undefined;
}

function buildDeepgramCompatQuery(options?: {
  detectLanguage?: boolean;
  punctuate?: boolean;
  smartFormat?: boolean;
}): ProviderQuery | undefined {
  if (!options) {
    return undefined;
  }
  const query: ProviderQuery = {};
  if (typeof options.detectLanguage === "boolean") {
    query.detect_language = options.detectLanguage;
  }
  if (typeof options.punctuate === "boolean") {
    query.punctuate = options.punctuate;
  }
  if (typeof options.smartFormat === "boolean") {
    query.smart_format = options.smartFormat;
  }
  return Object.keys(query).length > 0 ? query : undefined;
}

function normalizeDeepgramQueryKeys(query: ProviderQuery): ProviderQuery {
  const normalized = { ...query };
  if ("detectLanguage" in normalized) {
    normalized.detect_language = normalized.detectLanguage as boolean;
    delete normalized.detectLanguage;
  }
  if ("smartFormat" in normalized) {
    normalized.smart_format = normalized.smartFormat as boolean;
    delete normalized.smartFormat;
  }
  return normalized;
}

export function resolveProviderQuery(params: {
  providerId: string;
  config?: MediaUnderstandingConfig;
  entry: MediaUnderstandingModelConfig;
}): ProviderQuery | undefined {
  const { providerId, config, entry } = params;
  const mergedOptions = normalizeProviderQuery({
    ...config?.providerOptions?.[providerId],
    ...entry.providerOptions?.[providerId],
  });
  if (providerId !== "deepgram") {
    return mergedOptions;
  }
  let query = normalizeDeepgramQueryKeys(mergedOptions ?? {});
  const compat = buildDeepgramCompatQuery({ ...config?.deepgram, ...entry.deepgram });
  for (const [key, value] of Object.entries(compat ?? {})) {
    if (query[key] === undefined) {
      query[key] = value;
    }
  }
  return Object.keys(query).length > 0 ? query : undefined;
}

export function buildModelDecision(params: {
  entry: MediaUnderstandingModelConfig;
  entryType: "provider" | "cli";
  outcome: MediaUnderstandingModelDecision["outcome"];
  reason?: string;
}): MediaUnderstandingModelDecision {
  if (params.entryType === "cli") {
    const command = params.entry.command?.trim();
    return {
      type: "cli",
      provider: command ?? "cli",
      model: params.entry.model ?? command,
      outcome: params.outcome,
      reason: params.reason,
    };
  }
  const providerIdRaw = params.entry.provider?.trim();
  const providerId = providerIdRaw ? normalizeMediaProviderId(providerIdRaw) : undefined;
  return {
    type: "provider",
    provider: providerId ?? providerIdRaw,
    model: params.entry.model,
    outcome: params.outcome,
    reason: params.reason,
  };
}

export function formatDecisionSummary(decision: MediaUnderstandingDecision): string {
  const total = decision.attachments.length;
  const success = decision.attachments.filter(
    (entry: MediaUnderstandingAttachmentDecision) => entry.chosen?.outcome === "success",
  ).length;
  const chosen = decision.attachments.find(
    (entry: MediaUnderstandingAttachmentDecision) => entry.chosen,
  )?.chosen;
  const provider = chosen?.provider?.trim();
  const model = chosen?.model?.trim();
  const modelLabel = provider ? (model ? `${provider}/${model}` : provider) : undefined;
  const reason = decision.attachments
    .flatMap((entry: MediaUnderstandingAttachmentDecision) =>
      entry.attempts
        .map((attempt: MediaUnderstandingModelDecision) => attempt.reason)
        .filter(Boolean),
    )
    .find(Boolean);
  const shortReason = reason ? reason.split(":")[0]?.trim() : undefined;
  const countLabel = total > 0 ? ` (${success}/${total})` : "";
  const viaLabel = modelLabel ? ` via ${modelLabel}` : "";
  const reasonLabel = shortReason ? ` reason=${shortReason}` : "";
  return `${decision.capability}: ${decision.outcome}${countLabel}${viaLabel}${reasonLabel}`;
}
