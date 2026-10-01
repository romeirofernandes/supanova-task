from datetime import date
from typing import Any, Dict, List


def score_recency(signal_date: str, as_of: str) -> float:
    age = (date.fromisoformat(as_of) - date.fromisoformat(signal_date)).days
    return max(0.0, 1.0 - age / 30.0)


def score_needs_attention(signal: Dict[str, Any]) -> float:
    status = signal.get("status") or {}
    if not status:
        return 1.0
    v = next(iter(status.values()))
    if v.get("state") == "pending":
        return 1.0
    files = v.get("files_reviewed") or []
    if files and v.get("analysis_ref") != "run-999":
        return 0.3
    return 0.8


def score_evidence(signal: Dict[str, Any]) -> float:
    n = sum(1 for v in (signal.get("sources") or {}).values() if v)
    if n == 0:
        return 0.0
    if n == 1:
        return 0.5
    return 1.0


def score_project_match(signal: Dict[str, Any], project_id: str) -> float:
    if project_id in (signal.get("projects") or []):
        return 1.0
    return 0.2


def final_score(
    signal: Dict[str, Any], weights: Dict[str, float], project_id: str, as_of: str
) -> float:
    total = sum(weights.values())
    if total <= 0:
        return 0.0
    return (
        score_recency(signal["date"], as_of) * weights["recency"] / total
        + score_needs_attention(signal) * weights["needsAttention"] / total
        + score_evidence(signal) * weights["evidence"] / total
        + score_project_match(signal, project_id) * weights["projectMatch"] / total
    )


def rank_signals(
    signals: List[Dict[str, Any]],
    weights: Dict[str, float],
    project_id: str,
    as_of: str,
) -> List[Dict[str, Any]]:
    scored = [(final_score(s, weights, project_id, as_of), s) for s in signals]
    scored.sort(key=lambda t: t[1]["id"])
    scored.sort(key=lambda t: t[1]["date"] + "T" + t[1].get("time", "00:00"), reverse=True)
    scored.sort(key=lambda t: -t[0])
    counts: Dict[str, int] = {}
    for s in signals:
        counts[s["id"]] = counts.get(s["id"], 0) + 1
    index_by_obj = {id(o): i for i, o in enumerate(signals)}
    out = []
    for rank, (sc, s) in enumerate(scored, start=1):
        if counts[s["id"]] > 1:
            key = f"{s['id']}@{index_by_obj[id(s)]}"
        else:
            key = s["id"]
        out.append(
            {
                "key": key,
                "id": s["id"],
                "title": s["title"],
                "date": s["date"],
                "time": s.get("time"),
                "projects": s.get("projects", []),
                "score": round(sc, 4),
                "rank": rank,
                "breakdown": {
                    "recency": round(score_recency(s["date"], as_of), 3),
                    "needsAttention": score_needs_attention(s),
                    "evidence": score_evidence(s),
                    "projectMatch": score_project_match(s, project_id),
                },
            }
        )
    return out


def founder_sentence(
    old_w: Dict[str, float],
    new_w: Dict[str, float],
    old_rank: Dict[str, int],
    new_rank: Dict[str, int],
    top_n: int = 10,
) -> str:
    deltas = {k: new_w[k] - old_w[k] for k in new_w}
    if all(abs(d) < 0.001 for d in deltas.values()):
        return "Weights match the saved profile. Adjust a slider to preview a change."
    top_dim = max(deltas, key=lambda k: abs(deltas[k]))
    delta = deltas[top_dim]
    names = {
        "recency": "Recency",
        "needsAttention": "Needs Attention",
        "evidence": "Evidence",
        "projectMatch": "Project Match",
    }
    old_top = {sid for sid, r in old_rank.items() if r <= top_n}
    new_top = {sid for sid, r in new_rank.items() if r <= top_n}
    entered = len(new_top - old_top)
    direction = "increased" if delta > 0 else "decreased"
    return (
        f"{names.get(top_dim, top_dim)} {direction} "
        f"from {old_w[top_dim]:.0f}% to {new_w[top_dim]:.0f}%. "
        f"{entered} signal(s) entered the top {top_n} as a result."
    )
