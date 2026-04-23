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

class SovereignScanner:
    """
    Simulates the GADOS V2 Sovereign Invariant Scanner.
    Audits PR content for structural and security integrity.
    """
    def scan_pr(self, pr_data: Dict[str, Any]) -> Dict[str, Any]:
        # Check for 'GHOST_COMPONENT' invariant
        body = pr_data.get('body', '').upper()
        additions = pr_data.get('additions', 0)
        
        if "NO_AUDIT" in body:
            return {"status": "DENIED", "reason": "Sovereign Invariant Breach: Unauthorized Audit Bypass attempt."}
        
        if additions > 500:
            return {"status": "CAUTION", "reason": "Structural Depth: PR size requires Multi-Sig ratification."}
            
        return {"status": "APPROVED", "reason": "Compliant with Sovereign Logic Baseline."}

scanner = SovereignScanner()

@app.post("/api/audit/verify-merge")
async def verify_merge(pr_data: Dict[str, Any]):
    """
    The GADOS V2 Audit Gate for PR Merges.
    """
    result = scanner.scan_pr(pr_data)
    
    # Log the verification attempt in the Bitemporal Graph
    audit_logger.log_mutation(
        source="AGENT-WARDEN-V2",
        target=f"PR-{pr_data.get('number', 'UNK')}",
        predicate="VERIFIED" if result['status'] == "APPROVED" else "BLOCKED",
        properties={"status": result['status'], "reason": result['reason']}
    )
    
    if result['status'] == "DENIED":
        raise HTTPException(status_code=403, detail=result['reason'])
        
    return result

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
