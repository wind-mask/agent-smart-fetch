# openclaw-smart-fetch

`openclaw-smart-fetch` adds smarter fetching tools to OpenClaw.

It registers:
- `smart_fetch`
- `batch_smart_fetch`

OpenClaw keeps separate tool names here instead of replacing its built-in `web_fetch`.

## Why use it

Use this when the built-in `web_fetch` is not enough.

It combines:
- browser-like transport fingerprints via Thinkscape's maintained `@thinkscape/wreq-js` fork
- Defuddle for readable extraction and richer page metadata

## Highlights

### Fetching
- Browser-like transport fingerprints for better results on bot-defended sites
- Lower overhead than browser automation when you do not need JS execution
- Single-URL and batch fetching tools
- Bounded batch concurrency with a default of `8`

### Extraction
- Defuddle turns noisy pages into readable article-style content
- Removes common chrome such as nav, sidebars, footers, share widgets, and similar clutter
- Can include site-specific replies/comments when supported
- Returns `markdown`, `html`, `text`, or `json`

### Metadata and files
- Extracts useful metadata like title, author, site, published date, language, and word count when available
- Handles attachment and binary responses by saving them to temp files instead of forcing text extraction
- Returns file metadata such as path, size, and MIME type

### Practical limits
- Does not execute JavaScript
- Does not solve interactive anti-bot or login flows
- Use browser automation when you need clicks, scrolling, form submission, or a live session

## How Defuddle helps

Defuddle is what makes the output easier for downstream agents and tools to use.

Typical improvements:
- Reddit posts/comments: cleaner readable text with less surrounding UI noise
- X/Twitter posts: better readability and metadata than raw page HTML usually provides
- docs, blogs, and article pages: the main content is easier to summarize without wasting tokens on chrome
- noisy sites in general: sidebars, related links, comments rails, headers, and footers are often stripped away
- metadata extraction: title, author, date, site, language, and similar fields are surfaced when available

This is especially useful when a page is fetchable but the raw HTML is a poor input for an agent.

## Built-in `web_fetch` vs `smart_fetch`

A practical rule of thumb:
- use OpenClaw's built-in `web_fetch` for simple pages
- use `smart_fetch` when pages are blocked, noisy, or extraction quality matters
- use `batch_smart_fetch` when you need the same smarter fetch behavior over many URLs

## Install

From npm:

```bash
openclaw plugins install openclaw-smart-fetch
```

From a local checkout:

```bash
openclaw plugins install -l /absolute/path/to/agent-smart-fetch/packages/openclaw-smart-fetch
```

## Core use cases

Use `smart_fetch` when you want to:
- fetch one page with a browser-like network fingerprint
- turn an article, doc page, Reddit thread, or X post into readable content
- reduce token waste from noisy page chrome
- keep useful metadata with the content
- handle attachment or binary responses cleanly

Use `batch_smart_fetch` when you want to:
- fetch many URLs in one tool call
- keep results mapped to input order
- collect mixed successes and failures without losing per-item errors
- run bounded-concurrency fetches instead of firing everything at once

## Tool synopsis

```text
smart_fetch(url, browser?, os?, headers?, maxChars?, timeoutMs?, format?, removeImages?, includeReplies?, proxy?)
batch_smart_fetch(requests)
```

For `batch_smart_fetch`, `requests` is an array of objects, and each item accepts the same parameters as `smart_fetch`.

## Example output

### `smart_fetch`

```text
> URL: https://example.com/blog/some-article
> Title: Some Article
> Author: Jane Doe
> Published: 2026-03-12
> Site: Example Blog
> Language: en
> Words: 1284
> Browser: chrome_145/windows

# Some Article

This is the cleaned readable content extracted from the page.
```

### Attachment or binary output

```text
> URL: https://example.com/download/report
> File size: 999999
> Mime type: application/pdf
> File path: /absolute/path/to/temp/report.pdf
```

### `batch_smart_fetch`

```text
> Requests: 2
> Succeeded: 1
> Failed: 1
> Concurrency: 8

## [1/2] https://example.com/blog/some-article
> URL: https://example.com/blog/some-article
> Title: Some Article
> Author: Jane Doe
> Published: 2026-03-12
> Site: Example Blog
> Language: en
> Words: 1284
> Browser: chrome_145/windows

# Some Article

This is the cleaned readable content extracted from the page.

## [2/2] https://blocked.example/post
> URL: https://blocked.example/post
> Status: error
> Error: HTTP 403 Forbidden for https://blocked.example/post
```

## Parameters

### `smart_fetch`

| Parameter | Type | Default | Description |
|---|---|---:|---|
| `url` | string | required | URL to fetch |
| `browser` | string | `chrome_145` | Browser profile used for transport fingerprinting |
| `os` | string | `windows` | OS profile: `windows`, `macos`, `linux`, `android`, `ios` |
| `headers` | object | auto | Extra request headers |
| `maxChars` | number | `50000` | Maximum returned characters |
| `timeoutMs` | number | `15000` | Request timeout in milliseconds |
| `format` | `markdown` \| `html` \| `text` \| `json` | `markdown` | Output format |
| `removeImages` | boolean | `false` | Strip image references from output |
| `includeReplies` | boolean \| `extractors` | `extractors` | Include replies/comments |
| `proxy` | string | none | Proxy URL |

### `batch_smart_fetch`

| Parameter | Type | Default | Description |
|---|---|---:|---|
| `requests` | array of objects | required | Array of fetch requests; each item accepts the same parameters as `smart_fetch` |

## OpenClaw config

See `openclaw.plugin.json` for config defaults and schema.

Key options:
- `maxChars`
- `timeoutMs`
- `browser`
- `os`
- `removeImages`
- `includeReplies`
- `batchConcurrency`
- `tempDir`

Notes:
- `batchConcurrency` defaults to `8`
- `tempDir` controls where attachment and binary downloads are written before absolute file paths are returned

## When not to use it

Do not use these tools when:
- the page requires JS rendering
- you need login or session flows
- you need clicks, scrolling, or form submission
- you need a fully interactive browser session

In those cases, use browser automation instead.

## Dev and publishing note

This repo uses Bun for local development, tests, and workspace scripts. Package publishing still goes through npm in CI so npm Trusted Publishing can be used.
