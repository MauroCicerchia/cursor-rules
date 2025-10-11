// scripts/next-version.mjs
import { createRequire } from "node:module";
import { readFile, appendFile } from "node:fs/promises";
import { execSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { Bumper } from "conventional-recommended-bump";

const require = createRequire(import.meta.url);
const semver = require("semver");

async function getCurrentVersion() {
  let tags = [];
  try {
    const tagOutput = execSync("git tag --sort=-v:refname", {
      encoding: "utf8",
    }).trim();
    if (tagOutput) {
      tags = tagOutput
        .split("\n")
        .map((tag) => tag.trim())
        .filter(Boolean);
    }
  } catch {}

  const validTags = tags
    .map((tag) => semver.valid(tag))
    .filter(Boolean);

  if (validTags.length > 0) {
    return validTags[0];
  }

  const pkgPath = path.resolve(process.cwd(), "package.json");
  const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
  return pkg.version;
}

async function runRecommendedBump(opts) {
  return await new Promise((resolve, reject) => {
    const bumper = new Bumper();
    if (opts.preset) {
      bumper.loadPreset(opts.preset);
    }
    try {
      const recommendation = bumper.bump();
      resolve(recommendation);
    } catch (e) {
      reject(e);
    }
  });
}

async function main() {
  try {
    execSync("git fetch --tags origin main", { stdio: "ignore" });
  } catch {}

  const current = await getCurrentVersion();

  let bump;
  try {
    bump = await runRecommendedBump({ preset: "conventionalcommits" });
  } catch (e) {
    bump = await runRecommendedBump({});
  }

  const type = bump.releaseType || "none";
  const next = bump.releaseType
    ? semver.inc(current, bump.releaseType)
    : "no-release (sin cambios feat/fix/breaking)";
  const reason = bump.reason || "";

  const out = process.env.GITHUB_OUTPUT;
  const payload =
    `current=${current}\n` +
    `next=${next}\n` +
    `type=${type}\n` +
    `reason<<__END__\n${reason}\n__END__\n`;

  if (out) {
    await appendFile(out, payload);
  } else {
    console.log(JSON.stringify({ current, next, type, reason }));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
