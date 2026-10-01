import json
import os
import tempfile
from pathlib import Path
from typing import Any, Dict

PROFILES_PATH = Path(__file__).resolve().parent / "profiles.json"


def read_store() -> Dict[str, Any]:
    if not PROFILES_PATH.exists():
        return {"profiles": {}}
    with open(PROFILES_PATH) as f:
        return json.load(f)


def write_store_atomic(data: Dict[str, Any]) -> None:
    PROFILES_PATH.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=str(PROFILES_PATH.parent), suffix=".tmp")
    try:
        with os.fdopen(fd, "w") as f:
            json.dump(data, f, indent=2)
            f.write("\n")
        os.replace(tmp, PROFILES_PATH)
    finally:
        try:
            if os.path.exists(tmp):
                os.remove(tmp)
        except OSError:
            pass
