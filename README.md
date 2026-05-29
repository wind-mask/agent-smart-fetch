# Agent Smart Fetch

Better web fetching for agents.

## Features

- 🔐 **Browser-like TLS/SSL + HTTP fingerprints** — better success on bot-defended pages
- 🧹 **Defuddle extraction** — clean readable content instead of noisy HTML
- 🧠 **Useful metadata** — title, author, site, language, published date when available
- 📦 **Downloads + large file support** — stream attachments and binaries to temp files
- 🔁 **Client-side `<meta>` redirects** — follows sane meta refresh redirects with loop limits
- 🔗 **Alternate content fallback** — when extraction produces no/thin content, follows qualified `<link rel="alternate" type="...">` entries in `<head>` that match the requested output format
- ⚡ **Batch fetch** — fetch many URLs with bounded concurrency
- 📝 **Multiple output formats** — `markdown`, `html`, `text`, `json`, `raw`

## [@thinkscape/smart-fetch](./packages/smart-fetch/README.md)

Smart Fetch CLI. Install globally and use `smart-fetch` (or `sf`) from the terminal.

```bash
npm install -g @thinkscape/smart-fetch
sf https://example.com
```

## [pi-smart-fetch](./packages/pi-smart-fetch/README.md)

Smart Fetch for pi.dev.

Registers:
- `web_fetch`
- `batch_web_fetch`

## [openclaw-smart-fetch](./packages/openclaw-smart-fetch/README.md)

Smart Fetch for OpenClaw.

Registers:
- `smart_fetch`
- `batch_smart_fetch`

![pi Smart Fetch](https://raw.githubusercontent.com/Thinkscape/agent-smart-fetch/main/packages/pi-smart-fetch/demo.gif)

## Development

This repo is a Bun monorepo.

Install dependencies:

```bash
bun install
```

Run the workspace:

```bash
bun run test
bun run build
bun run check
```

Run package-specific commands:

```bash
bun run test:core
bun run test:pi
bun run test:openclaw
bun run test:cli

bun run build:core
bun run build:pi
bun run build:openclaw
bun run build:cli
```

Integration tests:

```bash
bun run test:integration
```

Install the local pre-commit hook:

```bash
bun run hooks:install
```

## Versioning and publishing

Versioning is global across the monorepo.

Every merged PR to `main` is released automatically. The default release type is
`patch`. To request a `minor` or `major` release, add a `.changeset/*.md` file to
the PR:

```md
minor

Add batch request timeout controls.
```

Dependency update PRs are opened by Renovate. They also release as `patch` by
default unless a changeset overrides the bump level.

Bump all package versions together manually:

```bash
bun run version:patch
bun run version:minor
bun run version:major
```

Create a local release commit and tag from changesets:

```bash
bun run release
```

Local manual publish commands:

```bash
bun run publish:pi
bun run publish:openclaw
bun run publish:cli
bun run publish:all
```

Note: development uses Bun, but CI publishing still uses `npm publish` so npm Trusted Publishing works correctly.

## Repository

- GitHub: `https://github.com/Thinkscape/agent-smart-fetch`
