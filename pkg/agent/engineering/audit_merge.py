import sys
import os
import json
from pathlib import Path
from ...backend.app.core.audit_logger import audit_logger
from ...backend.app.core.advisory_engine import advisory_engine

def audit_and_prepare_merge(pr_data: dict, tenant_id: str = "TENANT-001"):
    """
    Operational script to audit a PR merge request and generate advisory guidance.
    """
    print(f"Auditing PR {pr_data.get('id')} for merge readiness...")
    
    # 1. Log mutation start
    audit_logger.log_mutation(
        source="AGENT-ENGINEER-FORWARD-V2",
        target=f"PR-{pr_data.get('id')}",
        predicate="REVIEWING",
        properties={"pr_title": pr_data.get('title')}
    )
    
    # 2. Re-evaluate context via Advisory Engine
    advisory_engine.distribute_advice(
        context=pr_data,
        project_id="MergePRCockPit",
        tenant_id=tenant_id
    )
    
    # 3. Final readiness check (simulated)
    readiness = "READY"
    if pr_data.get('risk_level') == 'high':
        readiness = "CAUTION_REQUIRED"
        
    return {
        "status": readiness,
        "pr_id": pr_data.get('id'),
        "audit_id": audit_logger._get_latest_node_id(f"PR-{pr_data.get('id')}")
    }

if __name__ == "__main__":
    # Internal CLI for IPC/Subprocess calls
    if len(sys.argv) > 1:
        pr_json = sys.argv[1]
        data = json.loads(pr_json)
        result = audit_and_prepare_merge(data)
        print(json.dumps(result))
