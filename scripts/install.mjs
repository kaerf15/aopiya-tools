#!/usr/bin/env node
/**
 * 全局安装 aopiya CLI（~/.local/share）并注册 Skills（~/.agents/skills）。
 *
 * 用法（在 aopiya-tools 仓库根）：
 *   pnpm aopiya:install
 *   node scripts/install.mjs --skip-build
 */
import { cp, mkdir, chmod, symlink, rm, readFile, writeFile, access } from "node:fs/promises";
import { execSync } from "node:child_process";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const toolsRoot = repoRoot;

const skipBuild = process.argv.includes("--skip-build");
const home = os.homedir();

const targetRoot = path.join(home, ".local", "share", "aopiya-tools");
const configDir = path.join(home, ".config", "aopiya");
const skillsTarget = path.join(home, ".agents", "skills");
const localBin = path.join(home, ".local", "bin");

function run(cmd, cwd = repoRoot) {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd, stdio: "inherit" });
}

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function copyDir(src, dest) {
  await mkdir(path.dirname(dest), { recursive: true });
  await cp(src, dest, { recursive: true, force: true });
}

async function deployCliSdk() {
  const cliDist = path.join(toolsRoot, "cli", "dist", "cli.js");
  if (!skipBuild) {
    run("pnpm sdk:build && pnpm cli:build");
  }

  if (!(await exists(cliDist))) {
    throw new Error("cli/dist/cli.js 不存在，请先在仓库根执行 pnpm sdk:build && pnpm cli:build");
  }

  await rm(targetRoot, { recursive: true, force: true });
  await mkdir(targetRoot, { recursive: true });
  await copyDir(path.join(toolsRoot, "bin"), path.join(targetRoot, "bin"));

  const sdkDest = path.join(targetRoot, "sdk");
  await mkdir(sdkDest, { recursive: true });
  await copyDir(path.join(toolsRoot, "sdk", "dist"), path.join(sdkDest, "dist"));
  const sdkPkg = JSON.parse(await readFile(path.join(toolsRoot, "sdk", "package.json"), "utf8"));
  await writeFile(path.join(sdkDest, "package.json"), JSON.stringify(sdkPkg, null, 2) + "\n");

  const cliDest = path.join(targetRoot, "cli");
  await mkdir(cliDest, { recursive: true });
  await copyDir(path.join(toolsRoot, "cli", "dist"), path.join(cliDest, "dist"));
  const cliPkg = JSON.parse(await readFile(path.join(toolsRoot, "cli", "package.json"), "utf8"));
  cliPkg.dependencies["@aopiya/sdk"] = "file:../sdk";
  delete cliPkg.devDependencies;
  await writeFile(path.join(cliDest, "package.json"), JSON.stringify(cliPkg, null, 2) + "\n");

  run("npm install --omit=dev", cliDest);

  if (os.platform() !== "win32") {
    await chmod(path.join(targetRoot, "bin", "aopiya"), 0o755);
  }
}

async function linkSkills() {
  await mkdir(skillsTarget, { recursive: true });
  const links = [
    ["aopiya-content", path.join(toolsRoot, "skills", "aopiya-content")],
    ["aopiya-analytics", path.join(toolsRoot, "skills", "aopiya-analytics")],
  ];
  for (const [name, src] of links) {
    const dest = path.join(skillsTarget, name);
    await rm(dest, { recursive: true, force: true });
    if (os.platform() === "win32") {
      await copyDir(src, dest);
    } else {
      await symlink(src, dest);
    }
  }
}

async function registerBin() {
  if (os.platform() === "win32") {
    const binDir = path.join(targetRoot, "bin");
    const userPath = process.env.Path ?? process.env.PATH ?? "";
    if (!userPath.toLowerCase().includes(binDir.toLowerCase())) {
      console.log("\n请将以下目录加入用户 PATH（系统设置 → 环境变量）：");
      console.log(`  ${binDir}`);
    }
    return;
  }

  await mkdir(localBin, { recursive: true });
  const wrapperPath = path.join(localBin, "aopiya");
  await rm(wrapperPath, { force: true });
  await writeFile(
    wrapperPath,
    `#!/usr/bin/env bash\nset -euo pipefail\nexec "${path.join(targetRoot, "bin", "aopiya")}" "$@"\n`,
    "utf8",
  );
  await chmod(wrapperPath, 0o755);

  const pathVar = process.env.PATH ?? "";
  if (!pathVar.split(path.delimiter).includes(localBin)) {
    console.log("\n建议将 ~/.local/bin 加入 PATH（zsh 示例）：");
    console.log('  echo \'export PATH="$HOME/.local/bin:$PATH"\' >> ~/.zshrc && source ~/.zshrc');
  }
}

async function printNextSteps() {
  const envFile = path.join(configDir, "env.sh");
  const envPs1 = path.join(configDir, "env.ps1");

  console.log("\n✓ 安装完成");
  console.log(`  CLI:    ${targetRoot}`);
  console.log(`  Skills: ${skillsTarget}`);
  if (os.platform() !== "win32") {
    console.log(`  命令:   ${path.join(localBin, "aopiya")}`);
  }

  console.log("\n下一步：把 Key 交给 Agent，写入凭证并探活：");
  console.log(`  凭证: ${os.platform() === "win32" ? envPs1 : envFile}`);
  console.log("  详见 aopiya-tools/README.md →「配置凭证」");
}

async function main() {
  console.log("全局安装 CLI → ~/.local/share/aopiya-tools");
  console.log("注册 Skills → ~/.agents/skills");
  await deployCliSdk();
  await linkSkills();
  await registerBin();
  await printNextSteps();
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
