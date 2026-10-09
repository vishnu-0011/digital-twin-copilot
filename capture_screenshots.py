"""
Capture High-Resolution Screenshots of Titan Aerospace Operations Center
in Multiple Cinematic Angles, 4 Production Bays, and Both Themes (Cleanroom Light & Dark)
"""
import os
import time
from playwright.sync_api import sync_playwright

def capture_all():
    screenshots_dir = "docs/screenshots"
    os.makedirs(screenshots_dir, exist_ok=True)
    
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
        
        # 1. Global Overview: Executive Cleanroom Mega-Factory (8 Machines, 4 Bays, 2 AMRs)
        page.click("button[data-preset='global']")
        page.wait_for_timeout(1800)
        page.screenshot(path=f"{screenshots_dir}/01_cleanroom_mega_factory_overview.png")
        print("Captured: 01_cleanroom_mega_factory_overview.png")
        
        # 2. Bay 1 Focus: CNC Machining Centers (CNC-01 Roughing Mill & CNC-02 Finishing Center)
        page.click("button[data-preset='bay1']")
        page.wait_for_timeout(1800)
        page.screenshot(path=f"{screenshots_dir}/02_bay1_cnc_machining_centers.png")
        print("Captured: 02_bay1_cnc_machining_centers.png")
        
        # 3. Bay 2 Focus: Heavy Forming & Thermal (PRESS-01 1000T, PRESS-02 Extrusion, FURN-01 Carburizing)
        page.click("button[data-preset='bay2']")
        page.wait_for_timeout(1800)
        page.screenshot(path=f"{screenshots_dir}/03_bay2_forming_vacuum_furnace.png")
        print("Captured: 03_bay2_forming_vacuum_furnace.png")
        
        # 4. Bay 3 Focus: Robotics & Metrology (ROBOT-01 6-DOF Arm & LASER-01 Dual Laser Arch)
        page.click("button[data-preset='bay3']")
        page.wait_for_timeout(1800)
        page.screenshot(path=f"{screenshots_dir}/04_bay3_robotics_laser_metrology.png")
        print("Captured: 04_bay3_robotics_laser_metrology.png")
        
        # 5. Bay 4 Focus: Avionics Assembly Line (CONV-01)
        page.click("button[data-preset='bay4']")
        page.wait_for_timeout(1800)
        page.screenshot(path=f"{screenshots_dir}/05_bay4_avionics_assembly_line.png")
        print("Captured: 05_bay4_avionics_assembly_line.png")
        
        # 6. Logistics Patrol: AGV-01 AMR Chase Cam
        page.click("button[data-preset='agv1']")
        page.wait_for_timeout(2500)
        page.screenshot(path=f"{screenshots_dir}/06_agv_autonomous_logistics.png")
        print("Captured: 06_agv_autonomous_logistics.png")
        
        # 7. SCADA Inspection Drawer with Live Dual-Channel Oscilloscope & TCN Prognostics
        page.click("button[data-preset='global']")
        page.wait_for_timeout(1000)
        # Select CNC-01
        badges = page.locator(".float-badge")
        if badges.count() > 0:
            badges.first.click()
        page.wait_for_timeout(1800)
        page.screenshot(path=f"{screenshots_dir}/07_cleanroom_scada_diagnostics.png")
        print("Captured: 07_cleanroom_scada_diagnostics.png")
        
        # Close drawer
        page.click("#btn-drawer-close")
        page.wait_for_timeout(800)
        
        # 8. 10-Stage Process Pipeline Ribbon
        page.evaluate("document.getElementById('tab-pipe-prod') && document.getElementById('tab-pipe-prod').click()")
        page.wait_for_timeout(1200)
        page.screenshot(path=f"{screenshots_dir}/08_end_to_end_10stage_pipeline.png")
        print("Captured: 08_end_to_end_10stage_pipeline.png")

        # 9. Main Entrance Portal: Cleanroom Access & 'TITAN AEROSPACE' Signage
        page.click("button[data-preset='entrance']")
        page.wait_for_timeout(2000)
        page.screenshot(path=f"{screenshots_dir}/10_titan_aerospace_entrance_portal.png")
        print("Captured: 10_titan_aerospace_entrance_portal.png")

        # 10. Toggle Theme to Dark Mode
        page.click("button[data-preset='global']")
        page.wait_for_timeout(1000)
        page.evaluate("document.getElementById('btn-theme') && document.getElementById('btn-theme').click()")
        page.wait_for_timeout(1800)
        page.screenshot(path=f"{screenshots_dir}/09_dark_mode_cyberpunk_view.png")
        print("Captured: 09_dark_mode_cyberpunk_view.png")
        
        browser.close()
        print("All 10 screenshots captured successfully!")

if __name__ == "__main__":
    capture_all()
