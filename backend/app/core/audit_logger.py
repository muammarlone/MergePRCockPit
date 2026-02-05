import hashlib
import json
import os
from datetime import datetime
from typing import Dict, Any, List, Optional
from pathlib import Path

class GraphAuditLogger:
    """
    Implements the GADOS V2 Graph Audit pattern.
    Tracks all deliverable mutations as nodes in a graph.
    """
    def __init__(self, audit_dir: str = "log/audit"):
        self.audit_dir = Path(audit_dir)
        self.audit_dir.mkdir(parents=True, exist_ok=True)

    def log_mutation(self, 
                     source: str, 
                     target: str, 
                     predicate: str, 
                     properties: Dict[str, Any] = None) -> str:
        """
        Logs a mutation event as a node in the graph.
         source: The actor or trigger (e.g., 'USER-001', 'AGENT-ADVISOR-STARTUP-V1')
         target: The deliverable affected (e.g., 'PR-61', 'REPO-MergePRCockPit')
         predicate: The action taken (e.g., 'MERGED', 'REJECTED', 'ADVISED')
        """
        timestamp = datetime.utcnow().isoformat()
        node_id = hashlib.sha256(f"{source}{target}{predicate}{timestamp}".encode()).hexdigest()[:12]
        
        mutation_node = {
            "id": node_id,
            "source": source,
            "target": target,
            "predicate": predicate,
            "timestamp": timestamp,
            "properties": properties or {},
            "causality_link": self._get_latest_node_id(target)
        }
        
        file_path = self.audit_dir / f"mutation_{node_id}.json"
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(mutation_node, f, indent=2)
            
        self._update_latest_node(target, node_id)
        return node_id

    def _get_latest_node_id(self, target: str) -> Optional[str]:
        index_file = self.audit_dir / f"latest_{hashlib.md5(target.encode()).hexdigest()}.ptr"
        if index_file.exists():
            return index_file.read_text().strip()
        return None

    def _update_latest_node(self, target: str, node_id: str):
        index_file = self.audit_dir / f"latest_{hashlib.md5(target.encode()).hexdigest()}.ptr"
        index_file.write_text(node_id)

audit_logger = GraphAuditLogger()
