# pi-smart-fetch

`pi-smart-fetch` adds smarter web fetching tools to pi.dev.

It registers:
- `web_fetch`
- `batch_web_fetch`

![pi Smart Fetch](demo.gif)

## Why use it

Use this when plain server-side `fetch()` is too brittle or too noisy.

It combines:
- browser-like transport fingerprints via Thinkscape's maintained `@thinkscape/wreq-js` fork
- Defuddle for readable extraction and richer page metadata

## Highlights

### Fetching
- Browser-like transport fingerprints for better results on bot-defended sites
- Lower overhead than browser automation when you do not need JS execution
- Single-URL and batch fetching tools
- Bounded batch concurrency with a default of `8`
- pi-specific output shaping and TUI behavior

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

Defuddle is what makes the output easier for agents to use.

Typical improvements:
- Reddit posts/comments: cleaner readable text with less surrounding UI noise
- X/Twitter posts: better readability and metadata than raw page HTML usually provides
- docs, blogs, and article pages: the main content is easier to summarize without wasting tokens on chrome
- noisy sites in general: sidebars, related links, comments rails, headers, and footers are often stripped away
- metadata extraction: title, author, date, site, language, and similar fields are surfaced when available

This is especially useful when a page is fetchable but the raw HTML is a poor input for an agent.

## Install

From npm:

```bash
pi install npm:pi-smart-fetch
```

From a local checkout:

```bash
gh repo clone Thinkscape/agent-smart-fetch
pi install agent-smart-fetch/packages/pi-smart-fetch
```

## Core use cases

Use `web_fetch` when you want to:
- fetch one page with a browser-like network fingerprint
- turn an article, doc page, Reddit thread, or X post into readable content
- reduce token waste from noisy page chrome
- keep useful metadata with the content
- handle attachment or binary responses cleanly

Use `batch_web_fetch` when you want to:
- fetch many URLs in one tool call
- keep results mapped to input order
- collect mixed successes and failures without losing per-item errors
- let pi show per-item batch progress in the TUI

## Tool synopsis

```text
web_fetch(url, browser?, os?, headers?, maxChars?, timeoutMs?, format?, removeImages?, includeReplies?, proxy?, verbose?)
batch_web_fetch(requests, verbose?)
```

For `batch_web_fetch`, `requests` is an array of objects, and each item accepts the same parameters as `web_fetch` except `verbose`.

## Output behavior

### `web_fetch`

Agent-facing output includes the full non-empty metadata header plus the extracted body.

In the pi history/backlog preview, metadata stays intentionally brief:
- Title
- Published

The optional `verbose` flag remains for compatibility, but pi currently returns the full metadata header to the agent either way.

### `batch_web_fetch`

Batch output:
- starts with a summary (`Requests`, `Succeeded`, `Failed`, `Concurrency`)
- keeps results in input order
- includes full content for successful items
- includes a clear `Error:` line for failures

In the pi TUI, batch mode also streams per-item progress rows.

## Example outputs

### `web_fetch`

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

### `batch_web_fetch`

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

# Some Article

This is the cleaned readable content extracted from the page.

## [2/2] https://blocked.example/post
> URL: https://blocked.example/post
> Status: error
> Error: HTTP 403 Forbidden for https://blocked.example/post
```

## Parameters

### `web_fetch`

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
| `verbose` | boolean | `false` | Compatibility flag; full metadata is still returned to the agent |

### `batch_web_fetch`

| Parameter | Type | Default | Description |
|---|---|---:|---|
| `requests` | array of objects | required | Array of fetch requests; each item accepts the same parameters as `web_fetch` except `verbose` |
| `verbose` | boolean | `false` | Compatibility flag for batch output |

## pi settings

Optional settings in `~/.pi/agent/settings.json` or `.pi/settings.json`:

```json
{
  "smartFetchVerboseByDefault": false,
  "smartFetchDefaultMaxChars": 12000,
  "smartFetchDefaultTimeoutMs": 15000,
  "smartFetchDefaultBrowser": "chrome_145",
  "smartFetchDefaultOs": "windows",
  "smartFetchDefaultRemoveImages": false,
  "smartFetchDefaultIncludeReplies": "extractors",
  "smartFetchDefaultBatchConcurrency": 8,
  "smartFetchTempDir": "/tmp/smart-fetch-pi"
}
```

Notes:
- project `.pi/settings.json` overrides global `~/.pi/agent/settings.json`
- legacy `webFetch*` aliases are still supported
- `smartFetchTempDir` controls where attachment and binary downloads are written

## When not to use it

Do not use these tools when:
- the site requires JS rendering
- you need login or session flows
- you need clicks, scrolling, or form submission
- you need a fully interactive browser session

In those cases, use browser automation instead.

## Dev and publishing note

This repo uses Bun for local development, tests, and workspace scripts. Package publishing still goes through npm in CI so npm Trusted Publishing can be used.
