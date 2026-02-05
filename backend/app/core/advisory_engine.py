import requests
import json
from datetime import datetime
from typing import Dict, Any, List
from ..models.advisory import AdvisoryMessage, AdvisoryAssistant
from .audit_logger import audit_logger

class AdvisoryEngine:
    """
    Core engine for triggering methodology-aware guidance.
    Integrates with Ollama for dynamic message generation.
    """
    def __init__(self, ollama_url: str = "http://localhost:11434"):
        self.ollama_url = ollama_url

    def evaluate_context(self, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Evaluates the current PR context against Startup Champion rules.
        Returns a list of potential advisory messages.
        """
        signals = []
        
        # Rule 1: Missing ADR signal
        if context.get('is_significant_change') and not context.get('has_adr'):
            signals.append({
                "trigger": "architecture_decision_detected",
                "severity": "recommendation",
                "context": "Architecture Decision",
                "template": "You may want to capture this decision in a lightweight Architecture Decision Record (ADR) to avoid rework later."
            })
            
        # Rule 2: High Risk signal
        if context.get('risk_level') == 'high':
            signals.append({
                "trigger": "high_risk_detected",
                "severity": "caution",
                "context": "Risk Signal",
                "template": "This PR has high risk indicators. Ensure 'Accountable' has reviewed the performance impact."
            })
            
        return signals

    def generate_ai_guidance(self, signal: Dict[str, Any], context: Dict[str, Any]) -> str:
        """
        Calls Ollama (Qwen 2.5) to generate personalized guidance.
        """
        prompt = f"""You are the Startup Champion, an advisory assistant.
Context: {json.dumps(context)}
Signal: {signal['trigger']}
Goal: Generate a concise, startup-friendly recommendation.

Advisory:"""
        
        try:
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": "qwen2.5:7b",
                    "prompt": prompt,
                    "stream": False
                },
                timeout=10
            )
            if response.status_code == 200:
                return response.json().get('response', signal['template'])
        except Exception:
            pass
            
        return signal['template']

    def distribute_advice(self, context: Dict[str, Any], project_id: str, tenant_id: str):
        """
        Evaluates, generates, and persists advice to the database and audit graph.
        """
        signals = self.evaluate_context(context)
        for signal in signals:
            guidance = self.generate_ai_guidance(signal, context)
            
            # Persist to Audit Graph
            audit_logger.log_mutation(
                source="AGENT-ADVISOR-STARTUP-V1",
                target=f"PR-{context.get('pr_id')}",
                predicate="ADVISED",
                properties={
                    "trigger": signal['trigger'],
                    "guidance": guidance,
                    "target_role": "Accountable"
                }
            )
            
            # In a real system, we'd save to DB here
            print(f"Advice Generated for {project_id}: {guidance}")

advisory_engine = AdvisoryEngine()
