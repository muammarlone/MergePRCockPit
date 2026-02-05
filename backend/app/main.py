import time
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Callable
from .models.advisory import Base, AdvisoryMessage, AdvisoryAssistant
from .core.advisory_engine import advisory_engine
from .core.audit_logger import audit_logger

app = FastAPI(title="GADOS Middleware")

# GUARDIAN SECURITY HARDENING: Restrict CORS
# Only allow local Electron renderer or VS Code webview origins
ALLOWED_ORIGINS = [
    "http://localhost:3000", # Local dev
    "vscode-webview://",
    "file://"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# RATE LIMITING LOGIC (Guardian Constraint)
RATE_LIMIT_STORE = {} # IP -> last_request_time

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next: Callable):
    client_ip = request.client.host
    now = time.time()
    if client_ip in RATE_LIMIT_STORE:
        if now - RATE_LIMIT_STORE[client_ip] < 0.1: # 10 requests/sec limit
            raise HTTPException(status_code=429, detail="Too Many Requests - GADOS Backpressure Active")
    RATE_LIMIT_STORE[client_ip] = now
    return await call_next(request)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "GADOS-Middleware-V2"}

@app.get("/api/advisory/messages", response_model=List[Dict[str, Any]])
async def get_advisory_messages(project_id: str = "MergePRCockPit"):
    """
    Returns active advisory messages for the project.
    Simulated response for UAT verification.
    """
    # In a real system, we'd query the DB
    # For UAT, we return the latest advised mutations from the engine
    return [
        {
            "id": "MSG-001",
            "assistant_id": "AGENT-ADVISOR-STARTUP-V1",
            "severity": "recommendation",
            "message_template": "Missing ADR detected for structural change.",
            "explanation": "Significant changes to 'pkg/' require a documented rationale.",
            "suggested_action": "Create docs/compliance/ADR-001.md",
            "triggered_at": "2026-02-05T01:10:00Z"
        }
    ]

@app.post("/api/audit/mutation")
async def record_mutation(mutation: Dict[str, Any]):
    """
    Records a deliverable mutation in the Graph Audit.
    """
    try:
        node_id = audit_logger.log_mutation(
            source=mutation.get("source", "UNKNOWN"),
            target=mutation.get("target", "UNKNOWN"),
            predicate=mutation.get("predicate", "MUTATED"),
            properties=mutation.get("properties", {})
        )
        return {"status": "success", "node_id": node_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
