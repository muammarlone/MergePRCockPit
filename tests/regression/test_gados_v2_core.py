import pytest
import json
from pathlib import Path
from backend.app.core.audit_logger import GraphAuditLogger
from backend.app.core.advisory_engine import AdvisoryEngine

@pytest.fixture
def audit_logger(tmp_path):
    return GraphAuditLogger(audit_dir=str(tmp_path / "audit"))

@pytest.fixture
def advisory_engine():
    return AdvisoryEngine()

def test_audit_causality_chain(audit_logger):
    """
    FORWARD TEST ENGINEER: Validate Graph Audit causality links.
    """
    # 1. First mutation
    node1 = audit_logger.log_mutation("USER-001", "PR-1", "CREATED")
    
    # 2. Second mutation (linked to PR-1)
    node2 = audit_logger.log_mutation("AGENT-001", "PR-1", "REVIEWED")
    
    # Verify causality
    mutation_file = Path(audit_logger.audit_dir) / f"mutation_{node2}.json"
    with open(mutation_file, "r") as f:
        data = json.load(f)
        assert data["causality_link"] == node1
        assert data["target"] == "PR-1"

def test_startup_champion_missing_adr(advisory_engine):
    """
    FORWARD TEST ENGINEER: Validate Advisory Engine logic for missing ADRs.
    """
    context = {
        "pr_id": "123",
        "is_significant_change": True,
        "has_adr": False,
        "risk_level": "medium"
    }
    
    signals = advisory_engine.evaluate_context(context)
    triggers = [s["trigger"] for s in signals]
    
    assert "architecture_decision_detected" in triggers
    assert any("ADR" in s["template"] for s in signals)

def test_startup_champion_high_risk(advisory_engine):
    """
    FORWARD TEST ENGINEER: Validate High Risk detection.
    """
    context = {
        "pr_id": "456",
        "risk_level": "high"
    }
    
    signals = advisory_engine.evaluate_context(context)
    triggers = [s["trigger"] for s in signals]
    
    assert "high_risk_detected" in triggers
