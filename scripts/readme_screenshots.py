"""Captures the README screenshots from a running server (uvicorn api.main:app --port 8000).

    python scripts/readme_screenshots.py

Needs Playwright with Chrome: pip install playwright && playwright install chrome
"""
import os

from playwright.sync_api import sync_playwright

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "docs", "screenshots")
BASE = os.environ.get("APP_URL", "http://localhost:8000")


def main():
    os.makedirs(OUT, exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch(channel="chrome", headless=True, args=["--use-gl=angle"])
        pg = b.new_page(viewport={"width": 1440, "height": 900})
        pg.request.post(f"{BASE}/fleet/reset")  # start from a fresh shift
        pg.goto(f"{BASE}/?theme=light&nowelcome")
        pg.wait_for_timeout(4000)
        pg.click("#btn-demo-menu")
        pg.select_option("#demo-machine", "CNC-01")
        pg.click("#btn-demo-fault")
        pg.wait_for_timeout(3000)
        pg.screenshot(path=f"{OUT}/app-home.png")
        pg.click(".att-card [data-act=why]")
        pg.wait_for_timeout(1800)
        pg.screenshot(path=f"{OUT}/app-drawer.png")
        pg.keyboard.press("Escape")
        pg.click("#btn-forecast")
        pg.wait_for_timeout(3000)
        pg.screenshot(path=f"{OUT}/app-forecast.png")
        pg.close()

        pg = b.new_page(viewport={"width": 1440, "height": 900})
        pg.goto(f"{BASE}/?theme=dark&nowelcome&tour=quick")
        pg.wait_for_timeout(4500)
        if pg.is_enabled("#guide-voice"):
            pg.click("#guide-voice")
        pg.keyboard.press("ArrowRight")
        pg.wait_for_timeout(5000)
        pg.screenshot(path=f"{OUT}/app-tour.png")
        pg.close()

        for name in ("why", "method", "results"):
            pg = b.new_page(viewport={"width": 1440, "height": 900})
            pg.add_init_script("localStorage.setItem('titan_theme','light')")
            pg.emulate_media(reduced_motion="reduce")
            pg.goto(f"{BASE}/{name}.html")
            pg.wait_for_timeout(2000)
            pg.screenshot(path=f"{OUT}/page-{name}.png")
            pg.close()
        b.close()
    print(f"saved to {OUT}")


if __name__ == "__main__":
    main()
