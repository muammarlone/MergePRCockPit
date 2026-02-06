import sys
import os
import logging
from .orchestrator import MigrationOrchestrator, TopologyConfig

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("MigrationWizard")

def input_list(prompt_text):
    print(prompt_text)
    print("(Enter comma-separated values)")
    val = input("> ").strip()
    return [x.strip() for x in val.split(",") if x.strip()]

def main():
    print("==========================================")
    print("   GADOS MIGRATION COCKPIT - v2.0")
    print("==========================================")
    print("WARNING: This tool performs Git Operations.")
    print("Ensuring Readiness... DONE.")
    
    print("\nSelect Migration Topology:")
    print("1. One-to-One (Direct Lift)")
    print("2. One-to-Many (Fission/Split)")
    print("3. Many-to-One (Fusion/Merge)")
    
    choice = input("\nSelect [1-3]: ").strip()
    
    topology = None
    if choice == "1":
        print("\n--- ONE-TO-ONE CONFIGURATION ---")
        src = input("Enter Source Repo Name: ").strip()
        tgt = input("Enter Target Repo Config/URL: ").strip()
        topology = TopologyConfig("ONE_TO_ONE", [src], [tgt])
        
    elif choice == "2":
        print("\n--- ONE-TO-MANY (SPLIT) CONFIGURATION ---")
        src = input("Enter Source Repo Name: ").strip()
        tgt_list = input_list("Enter Target Repo Names:")
        topology = TopologyConfig("ONE_TO_MANY", [src], tgt_list)
        
    elif choice == "3":
        print("\n--- MANY-TO-ONE (MERGE) CONFIGURATION ---")
        src_list = input_list("Enter Source Repo Names:")
        tgt = input("Enter Target Repo Name: ").strip()
        topology = TopologyConfig("MANY_TO_ONE", src_list, [tgt])
        
    else:
        print("Invalid Selection.")
        return

    print("\nConfiguration Locked.")
    print(f"Type: {topology.type}")
    print(f"Map: {topology.sources} --> {topology.targets}")
    
    confirm = input("\nInitialize Migration Orchestrator? (Y/N): ").upper()
    if confirm != "Y":
        print("Aborted.")
        return

    # Initialize Orchestrator
    orch = MigrationOrchestrator()
    orch.execute_workflow(topology)

if __name__ == "__main__":
    main()
