import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  buildFetchResponseText,
  executeFetchToolCall,
  isError,
  resolveFetchToolDefaults,
} from "smart-fetch-core";
import type { PluginConfig } from "./types";

export const resolvePluginDefaults = (pluginConfig: PluginConfig = {}) =>
  resolveFetchToolDefaults({
    tempDir: join(tmpdir(), "smart-fetch-openclaw"),
    ...pluginConfig,
  });

/**
 * Create a WebFetch provider that integrates smart_fetch's TLS-fingerprinted
 * fetch + Defuddle extraction into the built-in web_fetch fallback pipeline.
 *
 * When web_fetch's built-in HTTP+Readability extraction fails, OpenClaw calls
 * this provider's execute() with { url, extractMode, maxChars }. The provider
 * runs smart_fetch's full pipeline and returns the result in the payload format
 * that web_fetch's normalizeProviderWebFetchPayload() expects.
 */
export function createSmartFetchWebFetchProvider() {
  return {
    id: "smart-fetch",
    label: "Smart Fetch",
    hint: "TLS-fingerprinted fetch with Defuddle extraction. Fallback for bot-protected sites.",
    requiresCredential: false,
    envVars: [],
    placeholder: "No API key required",
    signupUrl: "https://github.com/Thinkscape/agent-smart-fetch",
    docsUrl: "https://github.com/Thinkscape/agent-smart-fetch#readme",
    autoDetectOrder: 10, // Lower = higher priority than firecrawl (50)
    credentialPath: "",
    getCredentialValue: () => undefined,
    setCredentialValue: () => {},
    getConfiguredCredentialValue: () => undefined,
    setConfiguredCredentialValue: () => {},
    applySelectionConfig: (config: Record<string, unknown>) => config,

    createTool: (ctx: { config?: Record<string, unknown> }) => ({
      description:
        "Fetch a URL using Smart Fetch (TLS fingerprinting + Defuddle extraction).",
      parameters: {},
      execute: async (args: Record<string, unknown>) => {
        const url = typeof args.url === "string" ? args.url : "";
        const extractMode = args.extractMode === "text" ? "text" : "markdown";
        const maxChars =
          typeof args.maxChars === "number" && Number.isFinite(args.maxChars)
            ? Math.floor(args.maxChars)
            : 50_000;

        if (!url) {
          return { text: "" };
        }

        // Read plugin config from OpenClaw config (plugins.entries.smart-fetch.config)
        const pluginConfig = extractPluginConfig(ctx.config);

        const defaults = resolvePluginDefaults(pluginConfig);

        try {
          const result = await executeFetchToolCall(
            {
              url,
              extractMode: extractMode as "markdown" | "text",
              maxChars,
            },
            defaults,
          );

          if (isError(result)) {
            // Provider fallback: returning { text: "" } signals failure to
            // maybeFetchProviderWebFetchPayload, which wraps it. Returning
            // an empty text is safer than throwing — it lets web_fetch try
            // the next fallback or throw its own error.
            return { text: "" };
          }

          // The provider payload format that normalizeProviderWebFetchPayload reads:
          // - text (string): the extracted content
          // - title (string, optional): page title
          // - finalUrl (string, optional): URL after redirects
          // - status (number, optional): HTTP status code
          // - contentType (string, optional): response content type
          // - extractor (string, optional): name of the extractor used
          // - warning (string, optional): any warnings
          // - fetchedAt (string, optional): ISO timestamp
          return {
            text: buildFetchResponseText(result, { verbose: true }),
            title: result.title || undefined,
            finalUrl: result.finalUrl || url,
            extractor: "smart-fetch",
          };
        } catch {
          return { text: "" };
        }
      },
    }),
  };
}

/**
 * Extract the smart-fetch plugin config from the full OpenClaw config object.
 * Path: config.plugins.entries["smart-fetch"].config
 */
function extractPluginConfig(
  config?: Record<string, unknown>,
): PluginConfig | undefined {
  if (!config) return undefined;
  const plugins = config.plugins as Record<string, unknown> | undefined;
  if (!plugins || typeof plugins !== "object") return undefined;
  const entries = plugins.entries as Record<string, unknown> | undefined;
  if (!entries || typeof entries !== "object") return undefined;
  const smartFetch = entries["smart-fetch"] as
    | Record<string, unknown>
    | undefined;
  if (!smartFetch || typeof smartFetch !== "object") return undefined;
  const pluginConfig = smartFetch.config as PluginConfig | undefined;
  return pluginConfig;
}
