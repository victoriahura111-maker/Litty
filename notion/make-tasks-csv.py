#!/usr/bin/env python3
"""Build a Notion-database CSV from the Notion-ready checklist markdown.

Usage:  python3 notion/make-tasks-csv.py
Reads:  notion/Litty-Improvement-Checklist.md
Writes: notion/Litty-Tasks.csv
"""

import csv
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "Litty-Improvement-Checklist.md"
OUT = ROOT / "Litty-Tasks.csv"

PRIORITY = {
    0: "P0",
    1: "P1",
    2: "P1",
    3: "P1",
    4: "P1",
    5: "P2",
    6: "P1",
    7: "P2",
    8: "P3",
    9: "Deferred",
    10: "Release gate",
}

SKIP_SECTIONS = {"If you only do ten things", "Already in place — don't redo"}

CHECKBOX = re.compile(r"^( *)- \[ \] (.+)$")
HEADING = re.compile(r"^## (.+)$")


def clean(text: str) -> str:
    text = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", text)  # links -> label
    text = text.replace("**", "").replace("`", "")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def main() -> None:
    rows = []
    section = None
    section_num = None
    stack = {}  # depth -> task text
    counters = {}

    for raw in SRC.read_text(encoding="utf-8").splitlines():
        heading = HEADING.match(raw)
        if heading:
            title = heading.group(1).strip()
            section_num = None
            section = title
            m = re.match(r"^(\d+)\.", title)
            if m:
                section_num = int(m.group(1))
            stack = {}
            continue

        box = CHECKBOX.match(raw)
        if not box:
            continue
        if section in SKIP_SECTIONS or section_num is None:
            continue

        depth = len(box.group(1)) // 2
        text = clean(box.group(2))
        stack[depth] = text
        for d in list(stack):
            if d > depth:
                del stack[d]

        counters[section_num] = counters.get(section_num, 0) + 1
        task_id = f"{section_num}.{counters[section_num]:02d}"

        rows.append(
            {
                "ID": task_id,
                "Task": text,
                "Section": section,
                "Priority": PRIORITY.get(section_num, ""),
                "Parent": stack.get(depth - 1, "") if depth > 0 else "",
                "Done": "false",
            }
        )

    with OUT.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(
            fh,
            fieldnames=["ID", "Task", "Section", "Priority", "Parent", "Done"],
            quoting=csv.QUOTE_MINIMAL,
        )
        writer.writeheader()
        writer.writerows(rows)

    print(f"wrote {OUT.name}: {len(rows)} tasks")


if __name__ == "__main__":
    main()
