from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Health(BaseModel):
    ok: bool


@app.get("/api/health")
def health() -> Health:
    return Health(ok=True)
