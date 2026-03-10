#!/usr/bin/env python3
import argparse
import datetime as dt
import json
import os
import re
import subprocess
import tempfile
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from pathlib import Path

ERROR_PATTERNS = re.compile(
    r"(##\[error\]|ERR_[A-Z0-9_]+|Error:|fatal:|FAILED|AssertionError|No such file|not found|Permission denied|exit code [0-9]+)",
    re.IGNORECASE,
)


def run_cmd(cmd: list[str], allow_fail: bool = False) -> str:
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if proc.returncode != 0 and not allow_fail:
        stderr = proc.stderr.strip()
        if "401" in stderr or "Bad credentials" in stderr:
            raise RuntimeError(
                "GitHub API authentication failed while collecting CI data. "
                "Ensure GH_TOKEN is set to a valid token with Actions read access.\n"
                f"{stderr}"
            )
        raise RuntimeError(f"Command failed ({proc.returncode}): {' '.join(cmd)}\n{stderr}")
    return proc.stdout


def iso_to_dt(value: str) -> dt.datetime:
    return dt.datetime.fromisoformat(value.replace("Z", "+00:00"))


def get_runs(limit: int) -> list[dict]:
    out = run_cmd([
        "gh",
        "run",
        "list",
        "--limit",
        str(limit),
        "--json",
        "databaseId,workflowName,displayTitle,event,status,conclusion,createdAt,updatedAt,url,headBranch,headSha",
    ])
    return json.loads(out)


def get_failed_jobs(run_id: int) -> list[str]:
    out = run_cmd(["gh", "run", "view", str(run_id), "--json", "jobs"], allow_fail=True)
    if not out.strip():
        return []
    data = json.loads(out)
    return [job.get("name", "(unknown)") for job in data.get("jobs", []) if job.get("conclusion") == "failure"]


def get_error_snippets(run_id: int, max_lines: int = 3) -> list[str]:
    log = run_cmd(["gh", "run", "view", str(run_id), "--log-failed"], allow_fail=True)
    if not log.strip():
        return []
    lines = []
    for raw in log.splitlines():
        if ERROR_PATTERNS.search(raw):
            compact = re.sub(r"\s+", " ", raw).strip()
            lines.append(compact)
            if len(lines) >= max_lines:
                break
    return lines


def parse_junit_dir(path: Path, status_map: dict[str, set[str]]) -> None:
    for xml_path in path.rglob("*.xml"):
        try:
            tree = ET.parse(xml_path)
            root = tree.getroot()
        except ET.ParseError:
            continue

        cases = root.findall(".//testcase") if root.tag != "testcase" else [root]
        if not cases:
            continue

        for case in cases:
            name = case.attrib.get("name") or "(unnamed)"
            classname = case.attrib.get("classname") or case.attrib.get("file") or "(unknown)"
            key = f"{classname}::{name}"
            failed = case.find("failure") is not None or case.find("error") is not None
            status_map[key].add("failed" if failed else "passed")


def collect_artifact_test_data(run_ids: list[int], max_runs: int = 30) -> tuple[dict[str, set[str]], int]:
    status_map: dict[str, set[str]] = defaultdict(set)
    processed = 0

    with tempfile.TemporaryDirectory(prefix="ci-artifacts-") as tmp:
        tmp_path = Path(tmp)
        for run_id in run_ids[:max_runs]:
            dest = tmp_path / str(run_id)
            dest.mkdir(parents=True, exist_ok=True)
            _ = run_cmd(["gh", "run", "download", str(run_id), "-D", str(dest)], allow_fail=True)
            parse_junit_dir(dest, status_map)
            processed += 1

    return status_map, processed


def build_report(runs: list[dict], window_hours: int) -> str:
    cutoff = dt.datetime.now(dt.timezone.utc) - dt.timedelta(hours=window_hours)
    window = [r for r in runs if iso_to_dt(r["createdAt"]) >= cutoff]
    window.sort(key=lambda r: r["createdAt"], reverse=True)

    by_conclusion = Counter((r.get("conclusion") or "unknown") for r in window)
    by_status = Counter((r.get("status") or "unknown") for r in window)
    durations_min = []
    for r in window:
        created = r.get("createdAt")
        updated = r.get("updatedAt")
        if not created or not updated:
            continue
        try:
            start = iso_to_dt(created)
            end = iso_to_dt(updated)
        except Exception:
            continue
        durations_min.append(max((end - start).total_seconds() / 60.0, 0.0))
    failed_runs = [r for r in window if r.get("conclusion") in {"failure", "timed_out", "cancelled"}]

    failed_by_workflow = Counter(r.get("workflowName") or "(unknown)" for r in failed_runs if r.get("conclusion") == "failure")

    run_ids = [int(r["databaseId"]) for r in window if r.get("databaseId")]
    status_map, processed = collect_artifact_test_data(run_ids)
    flaky = sorted([test for test, statuses in status_map.items() if {"passed", "failed"}.issubset(statuses)])

    lines = []
    lines.append("# Nightly CI Report")
    lines.append("")
    lines.append(f"Window: last {window_hours}h")
    lines.append(f"Total runs: {len(window)}")
    lines.append(f"Conclusions: " + ", ".join(f"{k}={v}" for k, v in sorted(by_conclusion.items())))
    lines.append("")
    lines.append("## Runner / queue telemetry")
    lines.append("Status counts: " + ", ".join(f"{k}={v}" for k, v in sorted(by_status.items())))
    if durations_min:
        avg = sum(durations_min) / len(durations_min)
        p95 = sorted(durations_min)[int(max(len(durations_min) * 0.95 - 1, 0))]
        lines.append(f"Run duration avg: {avg:.1f}m")
        lines.append(f"Run duration p95: {p95:.1f}m")
    else:
        lines.append("Run duration telemetry unavailable.")
    lines.append("")

    lines.append("## Failure clusters (observed)")
    if failed_by_workflow:
        for wf, count in failed_by_workflow.most_common(10):
            lines.append(f"- {wf}: {count} failure run(s)")
    else:
        lines.append("- No failing runs observed.")
    lines.append("")

    lines.append("## Representative failing runs (observed)")
    if failed_runs:
        for run in failed_runs[:12]:
            run_id = int(run["databaseId"])
            lines.append(f"- [{run.get('workflowName','(unknown)')} #{run_id}]({run.get('url','')}) - {run.get('conclusion')} - {run.get('displayTitle','')}")
            jobs = get_failed_jobs(run_id)
            if jobs:
                lines.append(f"  - Failed jobs: {', '.join(jobs[:6])}")
            snippets = get_error_snippets(run_id)
            for snip in snippets:
                lines.append(f"  - Log: `{snip[:220]}`")
    else:
        lines.append("- None.")
    lines.append("")

    lines.append("## Flaky tests")
    lines.append(f"- Parsed artifacts from {processed} run(s)")
    if flaky:
        for test in flaky[:40]:
            lines.append(f"- {test}")
    else:
        lines.append("- No flaky test signatures observed in available JUnit artifacts.")
    lines.append("")

    lines.append("## Suggested top fixes")
    lines.append("- Fix deterministic infra/config errors first (token wiring, host resolution, missing paths).")
    lines.append("- Ensure private registry auth is configured for all jobs that run `pnpm install`.")
    lines.append("- Keep flaky detection artifact-driven by always uploading JUnit XML on test jobs.")
    lines.append("")

    return "\n".join(lines) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate a nightly CI report from GitHub Actions runs.")
    parser.add_argument("--window-hours", type=int, default=24)
    parser.add_argument("--limit", type=int, default=200)
    parser.add_argument("--output", default="ci-nightly-report.md")
    args = parser.parse_args()

    runs = get_runs(args.limit)
    report = build_report(runs, args.window_hours)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(report, encoding="utf-8")
    print(f"Wrote report: {output_path}")


if __name__ == "__main__":
    main()
