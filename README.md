# Agent Smart Fetch

Better web fetching for agents.

This monorepo contains two public packages that wrap browser-like transport fingerprints with Defuddle-powered content extraction:

- [`pi-smart-fetch`](./packages/pi-smart-fetch/README.md) for pi.dev
- [`openclaw-smart-fetch`](./packages/openclaw-smart-fetch/README.md) for OpenClaw

![pi Smart Fetch](packages/pi-smart-fetch/demo.gif)

## What it does

Agent Smart Fetch is for pages where plain server-side `fetch()` is not enough.

It combines:
- browser-like TLS and HTTP fingerprints via Thinkscape's maintained `@thinkscape/wreq-js` fork
- Defuddle for readable extraction and richer page metadata

That makes it useful for:
- docs, blog posts, articles, and knowledge-base pages
- Reddit posts and comments when you want a readable text view instead of noisy page chrome
- X/Twitter posts where extraction quality and metadata matter more than raw HTML
- pages with heavy sidebars, nav, share widgets, comment rails, and other clutter
- bot-defended sites that degrade or block generic HTTP clients

## Shared highlights

Across both public packages, the core experience is the same:

### Fetching
- Browser-like transport fingerprints for better results on bot-defended sites
- Lower overhead than browser automation when you do not need JS execution
- Single-URL and batch fetching tools
- Bounded batch concurrency

### Extraction
- Defuddle turns noisy pages into readable article-style content
- Removes common chrome such as nav, sidebars, footers, share widgets, and similar clutter
- Can include site-specific replies/comments when supported
- Returns `markdown`, `html`, `text`, or `json`

### Metadata and files
- Extracts useful metadata like title, author, site, published date, language, and word count when available
- Handles attachment and binary responses by saving them to temp files instead of forcing text extraction
- Returns file metadata for downloads and attachments

### Practical limits
- Does not execute JavaScript
- Does not solve interactive anti-bot or login flows
- Use browser automation when you need clicks, scrolling, form submission, or a live session

## Why Defuddle helps

Defuddle is the cleanup layer in this project.

In practice, that means:
- Reddit: better extraction of post text and comment threads, with less UI noise
- X/Twitter: cleaner readable output and metadata than raw page HTML usually provides
- docs/blog/article pages: the main content is easier to pass to an agent without wasting tokens on headers, sidebars, related links, or footer junk
- general readability: content comes back in a form that is easier to summarize, quote, or search
- metadata extraction: title, author, date, site, language, and other fields are surfaced when available

It is especially helpful when the source page is technically fetchable but messy.

## Packages

### [pi-smart-fetch](./packages/pi-smart-fetch/README.md)

Registers:
- `web_fetch`
- `batch_web_fetch`

Use it when you want Smart Fetch integrated directly into pi.dev, including pi-specific output formatting and TUI behavior.

### [openclaw-smart-fetch](./packages/openclaw-smart-fetch/README.md)

Registers:
- `smart_fetch`
- `batch_smart_fetch`

Use it when you want the same fetching and extraction behavior in OpenClaw without replacing its built-in `web_fetch` tool.

## Monorepo commands

Install dependencies:

```bash
bun install
```

Run the full workspace:

```bash
bun run test
bun run build
bun run check
```

Run per package:

```bash
bun run test:core
bun run test:pi
bun run test:openclaw

bun run build:core
bun run build:pi
bun run build:openclaw
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

Bump all package versions together:

```bash
bun run version:patch
bun run version:minor
bun run version:major
```

Create a release commit and tag:

```bash
bun run release
```

Local manual publish commands:

```bash
bun run publish:pi
bun run publish:openclaw
bun run publish:all
```

Note: day-to-day development in this repo uses Bun, but package publishing still goes through `npm publish` in CI so npm Trusted Publishing can be used.

## Repository

- GitHub: `https://github.com/Thinkscape/agent-smart-fetch`
