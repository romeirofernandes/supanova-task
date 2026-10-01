import json
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from typing import Annotated

from fastapi import APIRouter, HTTPException, Query

from .schemas import Health, PreviewRequest, SaveRequest
from .scoring import founder_sentence, rank_signals
from .store import read_store, write_store_atomic

FIXTURE_DIR = Path(__file__).resolve().parent.parent / "fixture"

DEFAULT_WEIGHTS = {
    "recency": 40,
    "needsAttention": 35,
    "evidence": 15,
    "projectMatch": 10,
}

router = APIRouter(prefix="/api", tags=["calibration"])


def _load_json(name: str) -> Any:
    with open(FIXTURE_DIR / name) as f:
        return json.load(f)


def _fixture_max_date() -> str:
    ledger = _load_json("signal-ledger.json")
    return max(s["date"] for s in ledger["signals"])


def _project_ids() -> List[str]:
    return [p["id"] for p in _load_json("config.json")["projects"]]


def _active_weights(project_id: str) -> Dict[str, float]:
    hist = (read_store().get("profiles") or {}).get(project_id, [])
    if hist:
        return dict(hist[-1]["weights"])
    return dict(DEFAULT_WEIGHTS)


def _require_weights_sum(weights: Dict[str, float]) -> None:
    if abs(sum(weights.values()) - 100.0) > 0.001:
        raise HTTPException(status_code=422, detail="weights must sum to 100")


@router.get("/health", response_model=Health)
def health() -> Health:
    ledger = _load_json("signal-ledger.json")
    return Health(ok=True, fixture_signals=len(ledger["signals"]))


@router.get("/projects")
def list_projects() -> Any:
    return _load_json("config.json")


@router.get("/signals")
def list_signals(
    project: Annotated[Optional[str], Query(description="Filter by project id")] = None,
    limit: Annotated[int, Query(ge=1, le=200)] = 50,
) -> Dict[str, Any]:
    ledger = _load_json("signal-ledger.json")
    signals: List[Dict[str, Any]] = ledger["signals"]
    if project:
        signals = [s for s in signals if project in s.get("projects", [])]
    return {"version": ledger["version"], "total": len(signals), "signals": signals[:limit]}


@router.get("/signals/{signal_id}")
def get_signal(signal_id: str) -> Any:
    for s in _load_json("signal-ledger.json")["signals"]:
        if s["id"] == signal_id:
            return s
    raise HTTPException(status_code=404, detail="signal not found")


@router.get("/projects/{project_id}/profile")
def get_profile(project_id: str, version: Optional[int] = None) -> Dict[str, Any]:
    if project_id not in _project_ids():
        raise HTTPException(status_code=404, detail="unknown project")
    hist = (read_store().get("profiles") or {}).get(project_id, [])
    if not hist:
        return {"project": project_id, "version": 0, "weights": DEFAULT_WEIGHTS, "saved": False}
    if version is None:
        return {"project": project_id, "saved": True, **hist[-1]}
    for h in hist:
        if h["version"] == version:
            return {"project": project_id, "saved": True, **h}
    raise HTTPException(status_code=404, detail="version not found")


@router.get("/projects/{project_id}/profiles")
def list_profiles(project_id: str) -> Dict[str, Any]:
    if project_id not in _project_ids():
        raise HTTPException(status_code=404, detail="unknown project")
    hist = (read_store().get("profiles") or {}).get(project_id, [])
    return {"project": project_id, "versions": hist}


@router.post("/projects/{project_id}/preview")
def preview(project_id: str, body: PreviewRequest) -> Dict[str, Any]:
    if project_id not in _project_ids():
        raise HTTPException(status_code=404, detail="unknown project")
    weights = body.weights.model_dump()
    _require_weights_sum(weights)
    as_of = body.as_of or _fixture_max_date()
    try:
        date.fromisoformat(as_of)
    except ValueError:
        raise HTTPException(status_code=422, detail="as_of must be YYYY-MM-DD")

    signals = _load_json("signal-ledger.json")["signals"]
    active = _active_weights(project_id)
    new_ranked = rank_signals(signals, weights, project_id, as_of)
    old_ranked = rank_signals(signals, active, project_id, as_of)
    old_map = {r["key"]: r["rank"] for r in old_ranked}

    movers = sorted(
        (
            {
                "key": r["key"],
                "id": r["id"],
                "title": r["title"],
                "old_rank": old_map[r["key"]],
                "new_rank": r["rank"],
                "delta": old_map[r["key"]] - r["rank"],
                "score": r["score"],
            }
            for r in new_ranked
        ),
        key=lambda m: (-abs(m["delta"]), m["new_rank"]),
    )[:5]

    return {
        "project": project_id,
        "as_of": as_of,
        "weights_used": weights,
        "active_weights": active,
        "sentence": founder_sentence(active, weights, old_map, {r["key"]: r["rank"] for r in new_ranked}),
        "movers": movers,
        "top": new_ranked[: body.top_n],
        "all": new_ranked,
        "total": len(new_ranked),
    }


@router.post("/projects/{project_id}/profile", status_code=201)
def save_profile(project_id: str, body: SaveRequest) -> Dict[str, Any]:
    if project_id not in _project_ids():
        raise HTTPException(status_code=404, detail="unknown project")
    weights = body.weights.model_dump()
    _require_weights_sum(weights)

    store = read_store()
    hist = store.setdefault("profiles", {}).setdefault(project_id, [])
    entry = {
        "version": len(hist) + 1,
        "weights": weights,
        "as_of": _fixture_max_date(),
        "note": body.note,
        "saved_at": datetime.now(timezone.utc).isoformat(),
    }
    hist.append(entry)
    write_store_atomic(store)
    return {"project": project_id, "saved": True, **entry}
