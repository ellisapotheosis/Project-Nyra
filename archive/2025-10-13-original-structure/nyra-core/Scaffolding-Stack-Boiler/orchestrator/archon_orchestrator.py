import os, asyncio, json, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
TASKS = ROOT / "orchestrator" / "tasks.json"
DEEPCODE_DIR = ROOT / "deepcode"
INSTANCE_DIR = ROOT / "run" / "deepcode_instances"
MEMORY_DIR = ROOT / "memory" / "chroma"

def env(key, default=None): return os.environ.get(key, default)
BASE_PORT = int(env("DEEPCODE_BASE_PORT", "8601"))

def read_tasks():
    if TASKS.exists():
        return json.loads(TASKS.read_text("utf-8"))
    return []

def ensure_dirs():
    INSTANCE_DIR.mkdir(parents=True, exist_ok=True)
    MEMORY_DIR.mkdir(parents=True, exist_ok=True)

def make_instance_config(idx, task):
    inst = INSTANCE_DIR / f"dc_{idx:02d}"
    inst.mkdir(parents=True, exist_ok=True)
    for name in ("mcp_agent.config.yaml", "mcp_agent.secrets.yaml"):
        src = DEEPCODE_DIR / name
        dst = inst / name
        if src.exists():
            text = src.read_text("utf-8")
            port = BASE_PORT + idx
            text = text.replace("${DEEPCODE_PORT}", str(port))
            text = text.replace("${TASK_NAME}", task.get("name", f"task-{idx:02d}"))
            dst.write_text(text, encoding="utf-8")
    (inst / "TASK_PROMPT.txt").write_text(task.get("prompt", ""), encoding="utf-8")
    return inst

async def start_deepcode_instance(idx, inst):
    port = BASE_PORT + idx
    log = inst / "deepcode.log"
    cmd_variants = [
        ["deepcode", "--config", "mcp_agent.config.yaml", "--secrets", "mcp_agent.secrets.yaml", "--port", str(port)],
        [sys.executable, "-m", "deepcode", "--config", "mcp_agent.config.yaml", "--secrets", "mcp_agent.secrets.yaml", "--port", str(port)]
    ]
    for cmd in cmd_variants:
        try:
            proc = await asyncio.create_subprocess_exec(
                *cmd, cwd=str(inst),
                stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.STDOUT
            )
            print(f"[archon] DeepCode {idx} @ {port} PID={proc.pid}")
            async def pump():
                with open(log, "wb") as f:
                    while True:
                        line = await proc.stdout.readline()
                        if not line: break
                        f.write(line)
                rc = await proc.wait()
                print(f"[archon] DeepCode {idx} exited rc={rc}")
            asyncio.create_task(pump())
            return
        except FileNotFoundError:
            continue
    print(f"[archon] DeepCode not found in Rye env for instance {idx}")

async def main():
    ensure_dirs()
    tasks = read_tasks()
    if not tasks:
        print("[archon] No tasks; run: rye run deepcode-seed")
        return
    max_instances = int(env("DEEPCODE_INSTANCES", str(len(tasks))))
    tasks = tasks[:max_instances]
    jobs = []
    for i, task in enumerate(tasks, start=1):
        inst = make_instance_config(i, task)
        jobs.append(start_deepcode_instance(i, inst))
    await asyncio.gather(*jobs)
    print("[archon] Supervising DeepCode instances. Ctrl+C to stop.")
    try:
        while True: await asyncio.sleep(60)
    except KeyboardInterrupt:
        print("[archon] Bye.")

if __name__ == "__main__":
    asyncio.run(main())
