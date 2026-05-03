#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import readline from "node:readline/promises";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = path.join(__dirname, "template");

const RENAMES = {
  _gitignore: ".gitignore",
  "_env.example": ".env.example",
  _github: ".github",
};

const BOOLEAN_FLAGS = new Set(["no-prompt"]);

function parseArgs(argv) {
  const args = { positional: [], flags: {} };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const eq = a.indexOf("=");
      if (eq >= 0) {
        args.flags[a.slice(2, eq)] = a.slice(eq + 1);
      } else {
        const key = a.slice(2);
        if (BOOLEAN_FLAGS.has(key)) {
          args.flags[key] = true;
        } else {
          args.flags[key] = argv[++i];
        }
      }
    } else {
      args.positional.push(a);
    }
  }
  return args;
}

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function applyReplacements(content, replacements) {
  let result = content;
  for (const [k, v] of Object.entries(replacements)) {
    result = result.split(k).join(v);
  }
  return result;
}

async function copyDir(src, dst, replacements) {
  await fs.mkdir(dst, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const renamed = RENAMES[entry.name] ?? entry.name;
    const dstPath = path.join(dst, renamed);
    if (entry.isDirectory()) {
      await copyDir(srcPath, dstPath, replacements);
    } else {
      const buf = await fs.readFile(srcPath);
      const looksBinary = buf.includes(0);
      if (looksBinary) {
        await fs.writeFile(dstPath, buf);
      } else {
        await fs.writeFile(dstPath, applyReplacements(buf.toString("utf8"), replacements));
      }
    }
  }
}

async function main() {
  const args = parseArgs(process.argv);
  const targetArg = args.positional[0];
  if (!targetArg) {
    console.error("Usage: npm create @instacodeio/mcp-server <target-dir> [--name <pkg>] [--bin <name>] [--description <desc>]");
    process.exit(1);
  }

  const target = path.resolve(process.cwd(), targetArg);
  if (await pathExists(target)) {
    const contents = await fs.readdir(target);
    if (contents.length > 0) {
      console.error(`Target ${target} already exists and is not empty.`);
      process.exit(1);
    }
  }

  const defaultBin = path.basename(target);
  const interactive = process.stdin.isTTY && !args.flags["no-prompt"];

  let binName = args.flags.bin ?? defaultBin;
  let pkgName = args.flags.name ?? `@instacodeio/${binName}`;
  let description = args.flags.description ?? "An MCP server";
  let repoOwner = args.flags["repo-owner"] ?? "InstaCode";
  let repoName = args.flags["repo-name"] ?? binName;
  let authorName = args.flags["author-name"] ?? "Jason Edstrom";
  let authorEmail = args.flags["author-email"] ?? "jason@instacode.io";

  if (interactive) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ask = async (q, def) => {
      const a = await rl.question(`${q}${def ? ` (${def})` : ""}: `);
      return a.trim() || def;
    };
    binName = await ask("Bin name", binName);
    pkgName = await ask("Package name", `@instacodeio/${binName}`);
    description = await ask("Description", description);
    repoOwner = await ask("GitHub owner", repoOwner);
    repoName = await ask("GitHub repo name", binName);
    authorName = await ask("Author name", authorName);
    authorEmail = await ask("Author email", authorEmail);
    rl.close();
  }

  const replacements = {
    __PKG_NAME__: pkgName,
    __BIN_NAME__: binName,
    __DESCRIPTION__: description,
    __REPO_OWNER__: repoOwner,
    __REPO_NAME__: repoName,
    __AUTHOR_NAME__: authorName,
    __AUTHOR_EMAIL__: authorEmail,
    __YEAR__: String(new Date().getFullYear()),
  };

  await fs.mkdir(target, { recursive: true });
  await copyDir(TEMPLATE_DIR, target, replacements);

  spawnSync("git", ["init", "--quiet"], { cwd: target, stdio: "inherit" });

  const rel = path.relative(process.cwd(), target) || ".";
  console.log("");
  console.log(`Scaffolded ${pkgName} in ${target}`);
  console.log("");
  console.log("Next:");
  console.log(`  cd ${rel}`);
  console.log("  npm install");
  console.log("  npm run build");
  console.log("  npm run inspect");
  console.log("");
  console.log("Add your real tools in src/tools/, then update .github/expected-tools.json.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
