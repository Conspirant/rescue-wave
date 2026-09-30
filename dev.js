import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isWindows = process.platform === "win32";
const npmCmd = isWindows ? "npm.cmd" : "npm";

console.log("\x1b[36m%s\x1b[0m", "==================================================");
console.log("\x1b[36m%s\x1b[0m", "  Starting RescueWave Local Development");
console.log("\x1b[36m%s\x1b[0m", "==================================================");
console.log("  Backend:  http://localhost:5000");
console.log("  Frontend: http://localhost:3000\n");

function startProcess(name, command, args, cwd, color) {
  const child = spawn(command, args, {
    cwd: path.resolve(__dirname, cwd),
    stdio: ["inherit", "pipe", "pipe"],
    shell: true,
  });

  child.stdout.on("data", (data) => {
    process.stdout.write(`${color}[${name}]\x1b[0m ${data}`);
  });

  child.stderr.on("data", (data) => {
    process.stderr.write(`${color}[${name} ERR]\x1b[0m ${data}`);
  });

  child.on("exit", (code) => {
    console.log(`${color}[${name}]\x1b[0m process exited with code ${code}`);
  });

  return child;
}

const backend = startProcess("BACKEND", "node", ["server.js"], "backend", "\x1b[33m");
const frontend = startProcess("FRONTEND", npmCmd, ["run", "dev"], "frontend", "\x1b[32m");

function cleanup() {
  console.log("\nShutting down dev servers...");
  try {
    if (isWindows) {
      if (backend.pid) spawn("taskkill", ["/pid", backend.pid.toString(), "/f", "/t"]);
      if (frontend.pid) spawn("taskkill", ["/pid", frontend.pid.toString(), "/f", "/t"]);
    } else {
      backend.kill("SIGTERM");
      frontend.kill("SIGTERM");
    }
  } catch (err) {
    // Ignore cleanup errors on exit
  }
  process.exit();
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
process.on("exit", cleanup);
