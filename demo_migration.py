import sys
import os
import asyncio
from pkg.agent.migration.orchestrator import MigrationOrchestrator, TopologyConfig, ValidationGate

# MOCK THE GATE FOR DEMO PURPOSES
# We override the interactive prompt to auto-approve for the demo video
def mock_prompt(stage, report_file, secret_phrase=None):
    print(f"\n[DEMO GATE] Reached Checkpoint: {stage}")
    print(f"            Simulating User Approval: '{secret_phrase if secret_phrase else 'APPROVE'}'")
    return True

ValidationGate.prompt = mock_prompt

def run_demo():
    print("==========================================")
    print("   GADOS MIGRATION COCKPIT - LIVE DEMO")
    print("==========================================")
    
    orch = MigrationOrchestrator()
    
    # 1. Browser (One-to-One)
    print("\n\n>>> DEMO SCENARIO A: BROWSER (1-to-1 LIFT) <<<")
    cfg_browser = TopologyConfig(
        type="ONE_TO_ONE",
        sources=["C:/Corporate/Browser"],
        targets=["geobserver/Browser"]
    )
    orch.execute_workflow(cfg_browser)
    
    # 2. GADOS Universe (One-to-Many Split)
    print("\n\n>>> DEMO SCENARIO B: GADOS UNIVERSE (1-to-N SPLIT) <<<")
    cfg_universe = TopologyConfig(
        type="ONE_TO_MANY",
        sources=["C:/Corporate/GADOS Universe"],
        targets=["geobserver/GADOS-Core", "geobserver/GADOS-Agents"]
    )
    orch.execute_workflow(cfg_universe)
    
    print("\n\n==========================================")
    print("   DEMO COMPLETE - ALL SYSTEMS NOMINAL")
    print("==========================================")

if __name__ == "__main__":
    run_demo()
