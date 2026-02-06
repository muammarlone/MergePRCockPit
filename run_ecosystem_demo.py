import sys
import os
import asyncio
import json

# Setup Environment to mimic the Repos
os.environ["GADOS_ROOT"] = "C:/Corporate/GADOS Universe" 

print("##################################################")
print("#      GADOS ECOSYSTEM LIVE DEMO RUNNER          #")
print("##################################################")

async def demo_gados_universe():
    print("\n\n>>> DEMO 1: GADOS UNIVERSE (Async Audit) <<<")
    print("Loading Kernel from: C:/Corporate/GADOS Universe")
    
    universe_path = r"C:\Corporate\GADOS Universe"
    if universe_path not in sys.path:
        sys.path.append(universe_path)
        
    try:
        import forward_engineer
        # Mocking the Guardian Service to avoid complex dependency chain failure in demo
        # (Since we are running in MergePRCockPit context, not Universe context)
        class MockGuardian:
            def analyze_changes(self, path): return ["file1.py", "file2.py"]
            def forward_engineering_review(self, changes, path):
                class Review:
                    review_id = "REV-DEMO-001"
                    overall_grade = "A+"
                    findings = [{"severity": "INFO", "issue": "Code is solid", "file": "file1.py"}]
                    status = "APPROVED"
                    approval_signature = "SIG-GENIUS-AI"
                    security_score = 100
                    compliance_score = 100
                return Review()
        
        # Inject Mock
        forward_engineer.guardian = MockGuardian()
        
        # Run Main
        # We need to await it since we refactored it to async
        await forward_engineer.main()
        
    except ImportError:
        print("!! Could not import forward_engineer. Check path.")
    except Exception as e:
        print(f"!! Universe Demo Error: {e}")

async def demo_browser():
    print("\n\n>>> DEMO 2: BROWSER (Sentinel Bridge) <<<")
    print("Loading Sentinel from: C:/Corporate/Browser")
    
    browser_path = r"C:\Corporate\Browser"
    if browser_path not in sys.path:
        sys.path.append(browser_path)
        
    try:
        import guardian_bridge
        # We want to test the scan function directly
        print("Simulating Browser Navigation to 'https://github.com'...")
        
        # Force GADOS_AVAILABLE=False to use the Fallback/Mock logic we saw in the code
        guardian_bridge.GADOS_AVAILABLE = False 
        
        result = await guardian_bridge.scan("https://github.com", "<html>Github</html>")
        print(json.dumps(result, indent=2))
        
        print("\nSimulating Malicious Site...")
        result_bad = await guardian_bridge.scan("http://bad.site", "malware")
        print(json.dumps(result_bad, indent=2))
        
    except ImportError:
        print("!! Could not import guardian_bridge. Check path.")
    except Exception as e:
        print(f"!! Browser Demo Error: {e}")

async def main():
    await demo_gados_universe()
    await demo_browser()
    print("\n\n##################################################")
    print("#           DEMO SEQUENCE COMPLETE               #")
    print("##################################################")

if __name__ == "__main__":
    asyncio.run(main())
