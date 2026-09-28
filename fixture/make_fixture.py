"""Generate the synthetic fixture pack handed to task candidates.

  uv run python 06-task/fixture/make_fixture.py

Everything here is invented: projects, people, companies, titles. No client, no colleague, no real
meeting and nothing from the live ledger or from tests/fixtures/golden/ (which is unsanitised).
The shape matches the real v4 ledger so the work transfers, and the seeded defects are the ones the
missions ask candidates to surface.
"""
from __future__ import annotations

import json
import random
from datetime import date, timedelta
from pathlib import Path

HERE = Path(__file__).resolve().parent
random.seed(4242)

PROJECTS = [
    {"id": "northwind", "name": "Northwind Supply", "type": "client", "keywords": ["northwind", "supply portal", "invoice sync"], "domains": ["northwind.example"], "emails": ["dana@northwind.example"], "active": True},
    {"id": "harborline", "name": "Harborline Freight", "type": "client", "keywords": ["harborline", "freight", "manifest"], "domains": ["harborline.example"], "emails": ["ivo@harborline.example"], "active": True},
    {"id": "quill", "name": "Quill (internal product)", "type": "product", "keywords": ["quill", "editor", "drafting"], "domains": [], "emails": [], "active": True},
    {"id": "atlas", "name": "Atlas Permits", "type": "client", "keywords": ["atlas", "permit", "inspection"], "domains": ["atlaspermits.example"], "emails": ["rue@atlaspermits.example"], "active": True},
    {"id": "studio_ops", "name": "Studio Ops", "type": "internal", "keywords": ["standup", "retro", "hiring", "ops"], "domains": [], "emails": [], "active": True},
]
PEOPLE = ["dana@northwind.example", "ivo@harborline.example", "rue@atlaspermits.example", "sam@studio.example",
          "kit@studio.example", "noor@studio.example", "tam@quillusers.example", "bo@harborline.example"]
TITLES = {
    "northwind": ["Northwind invoice sync kickoff", "Northwind supply portal walkthrough", "Invoice sync — error states", "Portal handover check"],
    "harborline": ["Harborline manifest import", "Freight manifest edge cases", "Harborline weekly sync", "Manifest import retro"],
    "quill": ["Quill editor shaping", "Quill drafting flow review", "Quill — what ships first"],
    "atlas": ["Atlas permit intake", "Inspection scheduling walkthrough", "Atlas permits — data questions"],
    "studio_ops": ["Weekly standup", "Hiring sync", "Ops retro"],
}
UNROUTED = ["Catch-up with the new team", "Thursday call", "Follow-up on the thing we discussed",
            "Quick sync", "Product review (external)", "Intro call"]


def norm(t: str) -> str:
    return "".join(c if c.isalnum() else "_" for c in t.lower()).strip("_")[:48]


def make():
    start = date(2026, 7, 6)
    signals, runlog = [], []
    idx = 0
    for day_offset in range(0, 63):
        d = start + timedelta(days=day_offset)
        if d.weekday() >= 5:
            continue
        for _ in range(random.choice([0, 1, 1, 2, 2, 3])):
            idx += 1
            routed = random.random() > 0.14
            pid = random.choice(list(TITLES)) if routed else None
            title = random.choice(TITLES[pid]) if routed else random.choice(UNROUTED)
            attendees = random.sample(PEOPLE, k=random.randint(2, 4))
            projects = [pid] if routed else ["internal_unsorted"]
            sig = {
                "id": f"{d.isoformat()}_{norm(title)}",
                "match_key": norm(title),
                "type": "meeting",
                "date": d.isoformat(),
                "time": f"{random.randint(9, 17):02d}:{random.choice(['00', '15', '30'])}",
                "title": title,
                "detected_on": (d + timedelta(days=1)).isoformat(),
                "attendees": attendees,
                "projects": projects,
                "summary": None,
                "expected_files": [],
                "notes": None,
                "status": {},
                "sources": {
                    "granola_note": f"sources/granola/{d.isoformat()}-{norm(title)}.md" if random.random() > 0.2 else None,
                    "transcript": f"sources/transcripts/{d.isoformat()}-{norm(title)}.txt" if random.random() > 0.35 else None,
                    "recording": f"sources/recordings/{d.isoformat()}-{norm(title)}.mp4" if random.random() > 0.6 else None,
                },
            }
            if routed and random.random() > 0.45:
                analysed = random.random() > 0.25
                sig["status"][pid] = {
                    "state": "analyzed" if analysed else "pending",
                    "analyzed_at": (d + timedelta(days=2)).isoformat() if analysed else None,
                    "files_reviewed": [v for v in sig["sources"].values() if v] if analysed else [],
                    "analysis_ref": f"run-{random.randint(40, 90)}" if analysed else None,
                }
            signals.append(sig)

    # Seeded defects the missions ask candidates to find.
    analysed = [s for s in signals if any(v.get("state") == "analyzed" for v in s["status"].values())]
    for s in analysed[:6]:                                  # analysed but no handoff summary exists
        s["notes"] = None
    for s in analysed[6:9]:                                  # dangling analysis_ref
        for v in s["status"].values():
            v["analysis_ref"] = "run-999"
    twin = dict(analysed[9]) if len(analysed) > 9 else dict(signals[3])
    twin = json.loads(json.dumps(twin))
    twin["id"] = twin["id"] + "_dup"
    twin["title"] = twin["title"] + " (rescheduled)"
    twin["attendees"] = twin["attendees"][:-1]
    signals.append(twin)                                     # near-duplicate identity
    for s in signals[:4]:                                    # a feed that went quiet
        s["sources"]["granola_note"] = None

    signals.sort(key=lambda s: (s["date"], s["time"]))

    # Run log: one row per weekday, with a 9-day dark stretch for one feed and two failed runs.
    for day_offset in range(0, 63):
        d = start + timedelta(days=day_offset)
        if d.weekday() >= 5:
            continue
        failed = day_offset in (31, 44)
        dark = 20 <= day_offset <= 29
        runlog.append({
            "run": 100 + day_offset,
            "started_at": f"{d.isoformat()}T06:05:00Z",
            "status": "fail" if failed else "ok",
            "error": "FileNotFoundError: feed directory missing" if failed else None,
            "counts": {"seen": 0 if failed else random.randint(0, 6),
                       "new": 0 if failed else random.randint(0, 3),
                       "routed": 0 if failed else random.randint(0, 3),
                       "unrouted": 0 if failed else random.randint(0, 2)},
            "feeds": {"granola": {"last_file": (d - timedelta(days=9 if dark else 0)).isoformat(), "files_seen": 0 if dark else random.randint(0, 4)},
                      "meet": {"last_file": d.isoformat(), "files_seen": random.randint(0, 3)},
                      "dropzone": {"last_file": (d - timedelta(days=random.randint(0, 12))).isoformat(), "files_seen": random.randint(0, 2)}},
        })

    (HERE / "signal-ledger.json").write_text(json.dumps({"version": 4, "signals": signals}, indent=2) + "\n")
    (HERE / "run-log.jsonl").write_text("".join(json.dumps(r) + "\n" for r in runlog))
    (HERE / "config.json").write_text(json.dumps({
        "projects": PROJECTS,
        "internal_domains": ["studio.example"],
        "fallbacks": {"unrouted": "internal_unsorted", "unknown_project": "unclassified"},
        "feed_freshness_threshold_days": 3,
    }, indent=2) + "\n")
    (HERE / "routing-hints.json").write_text(json.dumps([
        {"type": "keyword", "match": "manifest", "project": "harborline", "note": "freight manifests", "by": "ops", "on": "2026-07-20"},
        {"type": "domain", "match": "atlaspermits.example", "project": "atlas", "note": "", "by": "ops", "on": "2026-08-02"},
        {"type": "keyword", "match": "drafting", "project": "quil", "note": "typo in project id - currently dropped silently", "by": "ops", "on": "2026-08-11"},
    ], indent=2) + "\n")
    print(json.dumps({"signals": len(signals), "runlog": len(runlog),
                      "unrouted": sum(1 for s in signals if s["projects"] == ["internal_unsorted"]),
                      "analysed": sum(1 for s in signals if any(v.get("state") == "analyzed" for v in s["status"].values()))}, indent=2))


if __name__ == "__main__":
    make()
