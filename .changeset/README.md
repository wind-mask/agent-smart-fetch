# Changesets

This repo uses a lightweight changeset convention that matches our locked-step
monorepo release process.

Every merged PR releases a new version. If a PR has no changeset, the release is
`patch` by default and the changelog entry is generated from the merge commit.

## Add or override a changeset

Create a new `.md` file in `.changeset/`:

```md
patch

Fix crash when parsing empty HTML documents.
```

The first line is the bump level: `patch`, `minor`, or `major`.
Everything after the first line is the changelog message. Markdown is allowed.

If multiple changesets are present, the highest bump level wins:

`major` > `minor` > `patch`

## Renovate PRs

Renovate dependency update PRs can normally be merged without adding a changeset;
they release as `patch` by default. If a dependency update should be treated as a
feature or breaking change, add a changeset with `minor` or `major` as the first
line before merging.
