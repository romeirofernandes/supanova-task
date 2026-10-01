from typing import Optional

from pydantic import BaseModel, Field


class Health(BaseModel):
    ok: bool
    fixture_signals: int


class Weights(BaseModel):
    recency: float = Field(ge=0, le=100)
    needsAttention: float = Field(ge=0, le=100)
    evidence: float = Field(ge=0, le=100)
    projectMatch: float = Field(ge=0, le=100)


class PreviewRequest(BaseModel):
    weights: Weights
    as_of: Optional[str] = None
    top_n: int = Field(default=15, ge=1, le=77)


class SaveRequest(BaseModel):
    weights: Weights
    note: Optional[str] = None
