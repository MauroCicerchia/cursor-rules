#!/usr/bin/env node
import { fileURLToPath } from "url";
import path from "node:path";
import fs from "node:fs/promises";

type Flags = {
  all?: boolean;
  frontend?: boolean;
  backend?: boolean;
  react?: boolean;
  typescript?: boolean;
  general?: boolean;
  list?: boolean;
  force?: boolean;
  "dry-run"?: boolean;
  help?: boolean;
  h?: boolean;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATEGORIES = ["frontend", "backend", "react", "typescript", "general"] as const;
type Category = typeof CATEGORIES[number];

function parseArgs(argv: string[]): Flags {
  const flags: Flags = {};
  for (const arg of argv.slice(2)) {
    if (!arg.startsWith("-")) continue;
    const name = arg.replace(/^--?/, "");
    if (name === "help" || name === "h") flags.help = true;
    else if (name === "all") flags.all = true;
    else if (name === "frontend") flags.frontend = true;
    else if (name === "backend") flags.backend = true;
    else if (name === "react") flags.react = true;
    else if (name === "typescript") flags.typescript = true;
    else if (name === "general") flags.general = true;
    else if (name === "list") flags.list = true;
    else if (name === "force") flags.force = true;
    else if (name === "dry-run") flags["dry-run"] = true;
  }
  return flags;
}

function help() {
  console.log(`
Usage: cursor-rules [--all] [--frontend] [--backend] [--react] [--typescript] [--general] [--force] [--dry-run] [--list]

Examples:
  cursor-rules --all
  cursor-rules --react --typescript
  cursor-rules --list

Options:
  --all           Install all categories
  --frontend      Install frontend rules
  --backend       Install backend rules
  --react         Install react rules
  --typescript    Install typescript rules
  --general       Install general rules
  --force         Overwrite existing files
  --dry-run       Simulate installation without writing
  --list          Show available categories
  -h, --help      Show this help
  `);
}

async function listCategories(rootDir: string) {
  const rulesRoot = path.resolve(rootDir, "rules");
  const entries = await fs.readdir(rulesRoot, { withFileTypes: true });
  for (const dirent of entries) {
    if (dirent.isDirectory()) {
      const cat = dirent.name;
      const files = await fs.readdir(path.join(rulesRoot, cat));
      const mdc = files.filter(f => f.endsWith(".mdc"));
      console.log(`- ${cat}: ${mdc.length} rule(s)`);
    }
  }
}

async function copyCategory(cat: Category, pkgRoot: string, targetDir: string, opts: { force?: boolean; dry?: boolean }) {
  const srcDir = path.join(pkgRoot, "rules", cat);
  const files = (await fs.readdir(srcDir)).filter(f => f.endsWith(".mdc"));

  await fs.mkdir(targetDir, { recursive: true });
  for (const f of files) {
    const src = path.join(srcDir, f);
    const dst = path.join(targetDir, f);
    if (!opts.force) {
      try {
        await fs.access(dst);
        console.log(`⚠️  ${dst} already exists. Use --force to overwrite`);
        continue;
      } catch {}
    }
    console.log(`${opts.dry ? "👉 (dry)" : "👉"} copying ${cat}/${f} -> .cursor/rules/${f}`);
    if (!opts.dry) {
      const buff = await fs.readFile(src);
      await fs.writeFile(dst, buff);
    }
  }
}

async function main() {
  const flags = parseArgs(process.argv);
  if (flags.help) return help();

  const pkgRoot = path.resolve(__dirname, "..");
  const targetDir = path.resolve(process.cwd(), ".cursor", "rules");

  if (flags.list) {
    console.log("Available categories:");
    await listCategories(pkgRoot);
    return;
  }

  const selected: Category[] = flags.all
    ? [...CATEGORIES]
    : (CATEGORIES.filter((c) => (flags as any)[c]) as Category[]);

  if (selected.length === 0) {
    console.log("Choose a category: --all --frontend --backend --react --typescript --general");
    console.log("Or use --list to see available ones. Use --help to see help.");
    process.exit(1);
  }

  for (const cat of selected) {
    await copyCategory(cat, pkgRoot, targetDir, { force: !!flags.force, dry: !!flags["dry-run"] });
  }
  console.log("✅ Done");
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
