import type { FetchToolConfig } from "smart-fetch-core";

export type PluginConfig = FetchToolConfig;

/**
 * WebFetch provider plugin shape — subset of OpenClaw's WebFetchProviderPlugin
 * that we need for registration. Defined locally to avoid importing from the
 * openclaw plugin SDK (which may not be installed in all environments).
 */
export interface WebFetchProvider {
  id: string;
  label: string;
  hint: string;
  requiresCredential?: boolean;
  envVars: string[];
  placeholder: string;
  signupUrl: string;
  docsUrl?: string;
  autoDetectOrder?: number;
  credentialPath: string;
  getCredentialValue: (fetchConfig?: Record<string, unknown>) => unknown;
  setCredentialValue: (
    fetchConfigTarget: Record<string, unknown>,
    value: unknown,
  ) => void;
  getConfiguredCredentialValue?: (config?: Record<string, unknown>) => unknown;
  setConfiguredCredentialValue?: (
    configTarget: Record<string, unknown>,
    value: unknown,
  ) => void;
  applySelectionConfig?: (
    config: Record<string, unknown>,
  ) => Record<string, unknown>;
  createTool: (ctx: { config?: Record<string, unknown> }) => {
    description: string;
    parameters: Record<string, unknown>;
    execute: (
      args: Record<string, unknown>,
    ) => Promise<Record<string, unknown>>;
  } | null;
}

export interface ToolRegistrationApi {
  pluginConfig?: PluginConfig;
  registerTool(definition: {
    name: string;
    description: string;
    parameters: unknown;
    execute(
      toolCallId: string,
      params: Record<string, unknown>,
    ): Promise<{
      content: Array<{ type: "text"; text: string }>;
      isError?: boolean;
    }>;
  }): void;
  /** Register a WebFetch provider for the built-in web_fetch fallback pipeline. */
  registerWebFetchProvider?: (provider: WebFetchProvider) => void;
  logger: {
    info(message: string): void;
  };
}
