#!/usr/bin/env bun

import { execSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

type ReleaseKind = "patch" | "minor" | "major";
type ReleaseArg = ReleaseKind | "auto";

type Changeset = {
  file: string;
  type: ReleaseKind;
  message: string;
};

const arg = (process.argv[2] as ReleaseArg | undefined) ?? "auto";
if (!["auto", "patch", "minor", "major"].includes(arg)) {
  console.error("Usage: bun run scripts/release.ts [auto|patch|minor|major]");
  process.exit(1);
}

function run(command: string) {
  execSync(command, { stdio: "inherit" });
}

function shell(command: string) {
  return execSync(command, { encoding: "utf8" }).trim();
}

function readChangesets(): Changeset[] {
  const dir = join(process.cwd(), ".changeset");
  if (!existsSync(dir)) return [];

  const changesets: Changeset[] = [];
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".md") || file.toLowerCase() === "readme.md") continue;

    const fullPath = join(dir, file);
    const content = readFileSync(fullPath, "utf-8").trim();
    if (!content) continue;

    const lines = content.split(/\r?\n/);
    const type = lines[0]?.trim().toLowerCase() as ReleaseKind | undefined;
    if (!type || !["patch", "minor", "major"].includes(type)) {
      throw new Error(
        `Invalid changeset ${file}: first line must be patch, minor, or major`,
      );
    }

    const message = lines.slice(1).join("\n").trim();
    if (!message) {
      throw new Error(`Invalid changeset ${file}: missing changelog message`);
    }

    changesets.push({ file, type, message });
  }

  return changesets;
}

function highestBump(changesets: Changeset[]): ReleaseKind {
  if (changesets.some((change) => change.type === "major")) return "major";
  if (changesets.some((change) => change.type === "minor")) return "minor";
  return "patch";
}

function fallbackChange(type: ReleaseKind): Changeset {
  const commitBody = shell("git log -1 --pretty=%B");
  const commitLines = commitBody
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const generated = commitLines[0]?.startsWith("Merge pull request")
    ? commitLines[1]
    : commitLines[0];
  const subject = process.env.RELEASE_CHANGELOG_ENTRY || generated;

  return {
    file: "auto",
    type,
    message: subject || "Dependency and maintenance updates",
  };
}

function updateChangelog(version: string, changesets: Changeset[]) {
  const path = join(process.cwd(), "CHANGELOG.md");
  const existing = existsSync(path) ? readFileSync(path, "utf-8") : "";
  const date = new Date().toISOString().slice(0, 10);
  const entries = changesets
    .map((change) => {
      const message = change.message.replace(/\n/g, "\n  ");
      return `- **${change.type}**: ${message}`;
    })
    .join("\n");

  const next = `# Changelog\n\n## v${version} - ${date}\n\n${entries}\n\n`;
  const body = existing.replace(/^# Changelog\s*/i, "").trimStart();
  writeFileSync(path, `${`${next}${body}`.trimEnd()}\n`);
}

const changesets = readChangesets();
const releaseKind = arg === "auto" ? highestBump(changesets) : arg;
const changelogChanges =
  changesets.length > 0 ? changesets : [fallbackChange(releaseKind)];

run("bun run check");
run("bun run verify:clean-install");
run(`bun run scripts/version.ts ${releaseKind}`);

const version = shell("node -p \"require('./package.json').version\"");
updateChangelog(version, changelogChanges);

const changesetDir = join(process.cwd(), ".changeset");
for (const change of changesets) {
  rmSync(join(changesetDir, change.file), { force: true });
}

run("bun run format");

mkdirSync(changesetDir, { recursive: true });

run("git add -A");
run(`git commit -m "chore: release v${version}"`);
run(`git tag -a "v${version}" -m "Release v${version}"`);
