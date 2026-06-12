#!/usr/bin/env node
/**
 * 全局安装 aopiya CLI；Skills 默认复制到项目 .agents/skills/（非软链接）。
 *
 * 用法（在 aopiya-tools 仓库根）：
 *   pnpm aopiya:install -- --project ~/my-workspace   # 默认行为：Skills 进项目
 *   pnpm aopiya:install -- --global-skills            # Skills 进 ~/.agents/skills/
 *   node scripts/install.mjs --skip-build --project <dir>
 */
import { cp, mkdir, chmod, rm, readFile, writeFile, access } from "node:fs/promises";
import { execSync } from "node:child_process";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const toolsRoot = repoRoot;

const argv = process.argv.slice(2);
const skipBuild = argv.includes("--skip-build");
const globalSkills = argv.includes("--global-skills");

let projectDir = process.cwd();
const projectIdx = argv.indexOf("--project");
if (projectIdx !== -1 && argv[projectIdx + 1]) {
  projectDir = path.resolve(argv[projectIdx + 1]);
}

const home = os.homedir();
const targetRoot = path.join(home, ".local", "share", "aopiya-tools");
const configDir = path.join(home, ".config", "aopiya");
const skillsTarget = globalSkills
  ? path.join(home, ".agents", "skills")
  : path.join(projectDir, ".agents", "skills");
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

async function deployAgentsMd() {
  if (globalSkills) return;
  const src = path.join(toolsRoot, "README.md");
  if (!(await exists(src))) return;
  const dest = path.join(projectDir, "AGENTS.md");
  if (await exists(dest)) {
    const alt = path.join(projectDir, "AGENTS.aopiya-tools.md");
    await cp(src, alt, { force: true });
    console.log(`  项目已有 AGENTS.md，调度正文 → ${alt}`);
    return;
  }
  await cp(src, dest, { force: true });
  console.log(`  README.md → ${dest}`);
}

async function linkSkills() {
  await mkdir(skillsTarget, { recursive: true });
  const links = [
    ["aopiya-content", path.join(toolsRoot, "skills", "aopiya-content")],
    ["aopiya-analytics", path.join(toolsRoot, "skills", "aopiya-analytics")],
    ["aopiya-market-intelligence", path.join(toolsRoot, "skills", "aopiya-market-intelligence")],
  ];
  for (const [name, src] of links) {
    const dest = path.join(skillsTarget, name);
    await rm(dest, { recursive: true, force: true });
    await copyDir(src, dest);
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
  console.log("  详见 README.md");
}

async function main() {
  console.log("全局安装 CLI → ~/.local/share/aopiya-tools");
  console.log(
    globalSkills
      ? "复制 Skills（全局）→ ~/.agents/skills"
      : `复制 Skills（项目）→ ${skillsTarget}`,
  );
  await deployCliSdk();
  await linkSkills();
  await deployAgentsMd();
  await registerBin();
  await printNextSteps();
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
