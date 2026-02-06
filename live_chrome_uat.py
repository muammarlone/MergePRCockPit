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
        browser = await p.chromium.launch(headless=False, slow_mo=1000)
        page = await browser.new_page()
        
        try:
            # 1. Audit Universe
            print(">>> Navigating to GADOS Universe Audit...")
            for i in range(max_retries):
                try:
                    await page.goto("http://localhost:5000/api/audit/universe", timeout=5000)
                    content = await page.content()
                    if "GADOS Universe Kernel is ONLINE" in content:
                        break
                except Exception:
                    print(f"Server not ready.. retrying {i+1}/{max_retries}")
                    await asyncio.sleep(2)
            
            await page.wait_for_selector("text=GADOS Universe Kernel", timeout=10000)
            await page.screenshot(path="evidence_universe.png")
            print(f"Captured: evidence_universe.png (Content Verified)")
            
            # 2. Audit Browser
            print(">>> Navigating to Browser Sentinel...")
            await page.goto("http://localhost:5000/api/browser/scan?url=https://github.com")
            await page.wait_for_selector("text=guardian_verdict", timeout=10000)
            await page.screenshot(path="evidence_browser.png")
            print(f"Captured: evidence_browser.png (Content Verified)")
            
        except Exception as e:
            print(f"!!! VISUAL UAT FAILED TO LOAD CORRECTLY: {e}")
            await page.screenshot(path="evidence_failure.png")
        
        finally:
            print(">>> UAT COMPLETE. Closing Browser.")
            await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
