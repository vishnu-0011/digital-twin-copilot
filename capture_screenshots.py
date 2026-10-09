"""
Capture High-Resolution Screenshots of Titan Aerospace Operations Center
in Multiple Cinematic Angles & Operational States
"""
import time
from playwright.sync_api import sync_playwright

def capture_all():
    screenshots_dir = "docs/screenshots"
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            channel="chrome",
            headless=True,
            args=["--use-gl=angle", "--enable-webgl", "--force-device-scale-factor=1"]
        )
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()
        page.goto("http://localhost:8000/")
        
        # Allow WebGL scene, textures, and API calls to warm up
        page.wait_for_timeout(3500)
        
        # 1. Global Overview (Full Factory Floor)
        page.click("button[data-preset='global']")
        page.wait_for_timeout(1500)
        page.screenshot(path=f"{screenshots_dir}/01_factory_overview.png")
        print("Captured: 01_factory_overview.png")
        
        # 2. CNC-01 5-Axis Milling Center Focus
        page.click("button[data-preset='cnc']")
        page.wait_for_timeout(1800)
        page.screenshot(path=f"{screenshots_dir}/02_cnc_mill_focus.png")
        print("Captured: 02_cnc_mill_focus.png")
        
        # 3. PRESS-01 1000-Ton Hydraulic Forging Press Focus
        page.click("button[data-preset='press']")
        page.wait_for_timeout(1800)
        page.screenshot(path=f"{screenshots_dir}/03_hydraulic_press_focus.png")
        print("Captured: 03_hydraulic_press_focus.png")
        
        # 4. CONV-01 Conveyor & Laser QC Inspection Tunnel Focus
        page.click("button[data-preset='conv']")
        page.wait_for_timeout(1800)
        page.screenshot(path=f"{screenshots_dir}/04_conveyor_laser_qc_focus.png")
        print("Captured: 04_conveyor_laser_qc_focus.png")
        
        # 5. AGV-01 Autonomous Mobile Robot Chase Cam
        page.click("button[data-preset='agv']")
        page.wait_for_timeout(2500)
        page.screenshot(path=f"{screenshots_dir}/05_agv_patrol_chase.png")
        print("Captured: 05_agv_patrol_chase.png")
        
        # 6. SCADA Holographic Inspection Drawer (with Oscilloscope & TCN Prognostics)
        page.click("button[data-preset='global']")
        page.wait_for_timeout(1200)
        # Click on floating badge for CNC-01 to open drawer
        badges = page.locator(".float-badge")
        if badges.count() > 0:
            badges.first.click()
        else:
            page.evaluate("window.dispatchEvent(new CustomEvent('select-machine', { detail: 'CNC-01' }))")
        page.wait_for_timeout(1800)
        page.screenshot(path=f"{screenshots_dir}/06_scada_drawer_diagnostics.png")
        print("Captured: 06_scada_drawer_diagnostics.png")
        
        # Close drawer for clean view of AI trace
        page.click("#btn-drawer-close")
        page.wait_for_timeout(800)
        
        # 7. AI Inference Reasoning Pipeline Trace
        page.click("#tab-pipe-ai")
        page.wait_for_timeout(1200)
        page.screenshot(path=f"{screenshots_dir}/07_ai_reasoning_pipeline.png")
        print("Captured: 07_ai_reasoning_pipeline.png")
        
        browser.close()
        print("All 7 screenshots captured successfully!")

if __name__ == "__main__":
    capture_all()
