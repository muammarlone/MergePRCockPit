import requests
import json
import sys

def verify_uat():
    print(">>> CONNECTING TO LIVE DEMO SERVER...")
    base_url = "http://localhost:5000"
    
    # 1. Verify Root
    try:
        r = requests.get(base_url)
        if r.status_code == 200:
            print("[SUCCESS] Web Server Online (Root Reached)")
        else:
            print(f"[FAIL] Root returned {r.status_code}")
    except Exception as e:
        print(f"[CRITICAL] Could not connect to {base_url}: {e}")
        sys.exit(1)

    # 2. Verify Universe Audit
    print("\n>>> AUDITING GADOS UNIVERSE ENDPOINT...")
    r = requests.get(f"{base_url}/api/audit/universe")
    data = r.json()
    print(json.dumps(data, indent=2))
    
    if data["status"] == "SUCCESS" and data["mode"] == "ASYNC_IO":
        print("[VERIFIED] Universe Kernel is operating in Async Mode.")
    else:
        print("[FAIL] Universe Kernel rejected audit.")

    # 3. Verify Browser Sentinel
    print("\n>>> AUDITING BROWSER SENTINEL ENDPOINT...")
    r = requests.get(f"{base_url}/api/browser/scan?url=https://github.com")
    data = r.json()
    print(json.dumps(data, indent=2))
    
    if data["guardian_verdict"] == "SECURE" and data["sentinel_mode"] == "ACTIVE":
        print("[VERIFIED] Browser Sentinel is ACTIVE and SECURE.")
    else:
        print("[FAIL] Browser Sentinel inactive.")

if __name__ == "__main__":
    verify_uat()
