import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["esm"],
  dts: false,
  sourcemap: true,
  clean: true,
  bundle: true,
  noExternal: ["smart-fetch-core"],
  splitting: false,
  treeshake: true,
  external: [
    "@sinclair/typebox",
    "wreq-js",
    "defuddle",
    "linkedom",
    "mime-types",
    "lodash",
  ],
  banner: {
    js: "#!/usr/bin/env node",
  },
});
