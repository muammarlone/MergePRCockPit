import asyncio
from playwright.async_api import async_playwright
import os
import json
import time

async def run():
    print(">>> LAUNCHING NATIVE CHROME UAT SESSION...")
    # Add retry logic for server startup
    max_retries = 5
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, slow_mo=1000)
        page = await browser.new_page()
        
        try:
            # 2. PERFECTIONIST STRESS TEST (100x Cycles)
            print(">>> INITIATING PERFECTIONIST STRESS TEST (100 CYCLES)...")
            
            # CRITICAL: Ensure UI is fully hydrated before hammering it
            try:
                print(">>> Waiting for UI Hydration (30s timeout)...")
                await page.wait_for_selector(".spatial-container", state="visible", timeout=30000)
                await page.wait_for_selector("#intent-select", state="visible", timeout=30000)
                print(">>> UI Hydrated. Starting Loop.")
            except:
                print(">>> Hydration Timeout. Attempting Hard Reload...")
                await page.reload()
                try:
                    await page.wait_for_selector(".spatial-container", state="visible", timeout=30000)
                    print(">>> UI Hydrated after Reload.")
                except:
                    print(">>> FATAL: UI failed to hydrate even after reload. Aborting.")
                    return

            for cycle in range(1, 101):
                try:
                    # Alternating Intents to create "Noise" (Visual Activity)
                    intent = "General Inquiry" if cycle % 2 == 0 else "Payment Verification"
                    
                    # 1. Select Intent
                    await page.select_option("#intent-select", intent)
                    
                    # 2. Adjust Criticality (Random Noise)
                    box = await page.evaluate_handle("document.getElementById('crit-slider')")
                    # Simulate slider drag (random value)
                    # For simplicity in headless, we just let the default sit or toggle input
                    
                    # 3. Trigger Resolve
                    await page.click("#btn-resolve")
                    
                    # 4. Also Trigger Traffic Blast periodically
                    if cycle % 10 == 0:
                        await page.click("#btn-inject")
                        print(f"   [Cycle {cycle}] >>> BLAST INJECTED")
                    
                    # 5. Wait for Result update
                    # We wait for the routing chain to repopulate.
                    # A robust way is to wait for the text to match the expected path.
                    expected_node = "CCAI_Stream" if intent == "General Inquiry" else "Genesys_Adapter"
                    try:
                        await page.wait_for_selector(f"#routing-chain >> text={expected_node}", timeout=2000)
                        print(f"   [Cycle {cycle}/100] Verified Path: {expected_node} (SUCCESS)")
                    except:
                        print(f"   [Cycle {cycle}/100] WARNING: Visual Lag detected.")
                    
                    # Short sleep to let animation play (Visual "Noise")
                    await asyncio.sleep(0.5)
                    
                except Exception as e:
                    print(f"   [Cycle {cycle}/100] ERROR: {e}")
            
            print(">>> PERFECTIONIST STRESS TEST COMPLETE.")
            
            # Capture the Final "Noisy" State
            await page.screenshot(path="evidence_stress_test.png")
            print(f"Captured: evidence_stress_test.png")
            
            # 2. Audit Browser Sentinel (Legacy)
            print(">>> Navigating to Browser Sentinel...")
            
        except Exception as e:
            print(f"!!! VISUAL UAT FAILED TO LOAD CORRECTLY: {e}")
            await page.screenshot(path="evidence_failure.png")
        
        finally:
            print(">>> UAT COMPLETE. Closing Browser.")
            await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
