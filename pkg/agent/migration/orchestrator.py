import json
from dataclasses import dataclass, field
from typing import List, Dict, Any

@dataclass
class TopologyConfig:
    type: str  # "ONE_TO_ONE", "ONE_TO_MANY", "MANY_TO_ONE"
    sources: List[str]
    targets: List[str]

@dataclass
class MigrationState:
    stage: str
    topology: TopologyConfig
    status: str
    report_path: str = ""

class ValidationGate:
    """Intervention Gate that requires explicit Human Approval"""
    
    @staticmethod
    def prompt(stage: str, report_file: str, secret_phrase: str = None) -> bool:
        print(f"\n[GATE] Reached Checkpoint: {stage}")
        print(f"       Review Artifact: {report_file}")
        
        user_input = input(f"       Type '{secret_phrase if secret_phrase else 'APPROVE'}' to proceed: ")
        
        if secret_phrase and user_input.strip() == secret_phrase:
            return True
        elif not secret_phrase and user_input.strip() == "APPROVE":
            return True
            
        print(f"       [ABORT] User input '{user_input}' matched REJECTION criteria.")
        return False

class MigrationOrchestrator:
    """
    Orchestrates the 5-Stage Migration with strict Human-in-the-Loop gates.
    Supports Multi-Topology Logic.
    """
    def __init__(self):
        self.state = None
        
    def execute_workflow(self, topology: TopologyConfig):
        self.state = MigrationState(
            stage="INIT", 
            topology=topology,
            status="PENDING"
        )
        
        print(f"Initializing Migration: Type {topology.type}")
        print(f"Sources: {topology.sources} -> Targets: {topology.targets}")
        
        # --- STAGE 1: MAPPING VERIFICATION ---
        self.state.stage = "1_TOPOLOGY_CHECK"
        report = f"reports/MAPPING_{topology.type}.md"
        # GATE
        if not ValidationGate.prompt("TOPOLOGY_VERIFICATION", report, "CONFIRM MAPPING"):
            return self._abort("Human Rejected Mapping")
            
        # --- STAGE 2: TRANSFER (The Move) ---
        self.state.stage = "2_TRANSFER"
        
        if topology.type == "ONE_TO_MANY":
             print(">> SPLITTING REPO: git filter-repo execution...")
        elif topology.type == "MANY_TO_ONE":
             print(">> FUSING REPOS: git subtree merge execution...")
        else:
             print(">> DIRECT LIFT: git push mirror execution...")

        report = f"reports/TRANSFER_HASH.md"
        # GATE
        if not ValidationGate.prompt("TRANSFER_CONFIRMATION", report, "CONFIRM TRANSFER"):
            return self._abort("Human Rejected Transfer")
            
        # --- STAGE 3: UAT (The Test) ---
        self.state.stage = "3_VERIFICATION"
        print(">> Running UAT on NEW Target(s)...")
        report = f"reports/TARGET_UAT.md"
        # GATE
        if not ValidationGate.prompt("UAT_ACCEPTANCE", report, "APPROVE TARGET"):
            return self._abort("Human Rejected Target UAT")
            
        # --- STAGE 4: RETROFIT (The Polish) ---
        self.state.stage = "4_RETROFIT"
        print(">> Injecting 'geobserver.online' branding...")
        report = f"reports/RETROFIT_LOG.md"
        # GATE
        if not ValidationGate.prompt("RETROFIT_FINALIZATION", report, "FINALIZE RETROFIT"):
            return self._abort("Human Rejected Retrofit")
            
        # --- STAGE 5: CLEANUP (DANGER ZONE) ---
        self.state.stage = "5_CLEANUP"
        print("\n!!! DANGER: SOURCE REMOVAL PHASE !!!")
        
        # GATE (High Security)
        # For N:1 or 1:N, we list all sources being deleted
        sources_str = ", ".join(topology.sources)
        secret = f"DELETE SOURCE {sources_str}"
        print(f"Target(s) verified safe. Ready to delete: {sources_str}")
        
        if not ValidationGate.prompt("SOURCE_DELETION", report, secret):
            return self._abort("Human Saved Source Repo")
            
        print(f"$$$ ORCHESTRATOR: DELETING SOURCES {sources_str} $$$")
        self.state.status = "MIGRATED"
        
        return {"status": "SUCCESS", "final_state": self.state}

    def _abort(self, reason):
        print(f"\n[ABORT] Migration Halted: {reason}")
        self.state.status = "ABORTED"
        return {"status": "ABORTED", "reason": reason}

if __name__ == "__main__":
    # Test Run: Split Scenario
    cfg = TopologyConfig(
        type="ONE_TO_MANY",
        sources=["GADOS Universe"],
        targets=["GADOS-Core", "GADOS-Agents"]
    )
    orch = MigrationOrchestrator()
    orch.execute_workflow(cfg)
